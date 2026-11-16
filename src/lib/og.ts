import dns from "node:dns/promises";
import net from "node:net";

/**
 * Open Graph preview extraction.
 *
 * Retailers (Trendyol, Shein, AliExpress…) are frequently protected by
 * anti-bot middleware, so every failure path degrades to a graceful
 * placeholder instead of an error page.
 */

export interface OgMeta {
  title: string | null;
  image: string | null;
  siteName: string | null;
  price: string | null;
  description: string | null;
  url: string;
}

export interface OgResult {
  ok: boolean;
  data: OgMeta;
  error?: string;
}

const FETCH_TIMEOUT_MS = 9_000;
const MAX_BYTES = 768 * 1024;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/* ---------------------------- URL validation ------------------------ */

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const address = ip.toLowerCase();
  if (address === "::1" || address === "::") return true;
  if (address.startsWith("fe80") || address.startsWith("fc") || address.startsWith("fd")) {
    return true;
  }
  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  const mapped = address.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return false;
}

/**
 * Blocks requests to loopback / link-local / private ranges so the preview
 * endpoint cannot be abused as an internal network probe.
 */
export async function isSafePublicUrl(url: URL): Promise<boolean> {
  const hostname = url.hostname.toLowerCase();
  if (!hostname) return false;
  if (hostname === "localhost" || hostname.endsWith(".localhost")) return false;
  if (hostname.endsWith(".local") || hostname.endsWith(".internal")) return false;
  if (net.isIPv4(hostname) && isPrivateIPv4(hostname)) return false;
  if (net.isIPv6(hostname) && isPrivateIPv6(hostname)) return false;

  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const { address } of addresses) {
      if (net.isIPv4(address) && isPrivateIPv4(address)) return false;
      if (net.isIPv6(address) && isPrivateIPv6(address)) return false;
    }
  } catch {
    // DNS failure → the request itself will fail; not a security signal.
  }
  return true;
}

/* ------------------------------ HTML parsing ------------------------ */

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16)),
    );
}

/** Extracts the content of a <meta> tag regardless of attribute order. */
function metaContent(html: string, key: string): string | null {
  const tagPattern = new RegExp(
    `<meta[^>]*\\b(?:property|name)\\s*=\\s*["']${key}["'][^>]*>`,
    "i",
  );
  const match = html.match(tagPattern);
  if (!match) return null;
  const contentMatch = match[0].match(/\bcontent\s*=\s*["']([^"']*)["']/i);
  if (!contentMatch) return null;
  const value = decodeEntities(contentMatch[1]).trim();
  return value.length ? value : null;
}

function documentTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return null;
  const value = decodeEntities(match[1]).replace(/\s+/g, " ").trim();
  return value.length ? value : null;
}

/* -------------------------------- fetch ----------------------------- */

export async function fetchOgMeta(rawUrl: string): Promise<OgResult> {
  const fallback: OgMeta = {
    title: null,
    image: null,
    siteName: null,
    price: null,
    description: null,
    url: rawUrl,
  };

  if (!isValidHttpUrl(rawUrl)) {
    return { ok: false, data: fallback, error: "invalid_url" };
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return { ok: false, data: fallback, error: "invalid_url" };
  }

  if (!(await isSafePublicUrl(target))) {
    return { ok: false, data: fallback, error: "blocked_host" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(target.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,tr;q=0.8",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      return { ok: false, data: fallback, error: `http_${response.status}` };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType && !contentType.includes("html") && !contentType.includes("xml")) {
      return { ok: false, data: fallback, error: "unsupported_content_type" };
    }

    const html = await readLimitedBody(response);
    const finalUrl = response.url || target.toString();

    const ogTitle = metaContent(html, "og:title");
    const twitterTitle = metaContent(html, "twitter:title");
    const ogImage = metaContent(html, "og:image");
    const twitterImage = metaContent(html, "twitter:image");
    const ogSite = metaContent(html, "og:site_name");
    const ogPrice =
      metaContent(html, "product:price:amount") ?? metaContent(html, "og:price:amount");
    const ogDescription =
      metaContent(html, "og:description") ?? metaContent(html, "description");

    const imageCandidate = ogImage ?? twitterImage;
    let image: string | null = null;
    if (imageCandidate) {
      try {
        image = new URL(imageCandidate, finalUrl).toString();
      } catch {
        image = imageCandidate;
      }
    }

    const title = ogTitle ?? twitterTitle ?? documentTitle(html);

    return {
      ok: Boolean(title || image),
      data: {
        title: title ? title.slice(0, 300) : null,
        image,
        siteName: ogSite,
        price: ogPrice,
        description: ogDescription ? ogDescription.slice(0, 400) : null,
        url: finalUrl,
      },
    };
  } catch (error) {
    const code =
      error instanceof Error && error.name === "AbortError" ? "timeout" : "fetch_failed";
    return { ok: false, data: fallback, error: code };
  } finally {
    clearTimeout(timeout);
  }
}

async function readLimitedBody(response: Response): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (received < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.length;
    }
  }
  await reader.cancel().catch(() => undefined);

  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder("utf-8").decode(merged);
}
