import { queryAll, queryOne, run } from "./db";
import type { Store } from "./types";

/**
 * Brand-store directory CRUD (admin "Stores manager").
 */

export interface StoreInput {
  slug: string;
  name: string;
  name_ar?: string | null;
  name_tr?: string | null;
  domain: string;
  url: string;
  logo?: string | null;
  accent?: string | null;
  tagline?: string | null;
  tagline_ar?: string | null;
  tagline_tr?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export function listStores(onlyActive = false): Store[] {
  return queryAll<Store>(
    onlyActive
      ? "SELECT * FROM stores WHERE is_active = 1 ORDER BY sort_order ASC, id ASC"
      : "SELECT * FROM stores ORDER BY sort_order ASC, id ASC",
  );
}

export function getStore(id: number): Store | undefined {
  return queryOne<Store>("SELECT * FROM stores WHERE id = ?", id);
}

export function getStoreBySlug(slug: string): Store | undefined {
  return queryOne<Store>("SELECT * FROM stores WHERE slug = ?", slug);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createStore(input: StoreInput): Store {
  const slug = slugify(input.slug || input.name);
  const result = run(
    `INSERT INTO stores
       (slug, name, name_ar, name_tr, domain, url, logo, accent, tagline, tagline_ar, tagline_tr, is_active, sort_order)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    slug,
    input.name,
    input.name_ar ?? null,
    input.name_tr ?? null,
    input.domain.replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
    input.url,
    input.logo ?? "generic",
    input.accent ?? "#D4AF37",
    input.tagline ?? "",
    input.tagline_ar ?? null,
    input.tagline_tr ?? null,
    input.is_active === false ? 0 : 1,
    input.sort_order ?? 100,
  );
  const created = getStore(result.lastInsertRowid);
  if (!created) throw new Error("Failed to create store");
  return created;
}

export function updateStore(id: number, input: Partial<StoreInput>): Store | undefined {
  const existing = getStore(id);
  if (!existing) return undefined;

  const merged: StoreInput = {
    slug: input.slug ?? existing.slug,
    name: input.name ?? existing.name,
    name_ar: input.name_ar !== undefined ? input.name_ar : existing.name_ar,
    name_tr: input.name_tr !== undefined ? input.name_tr : existing.name_tr,
    domain: input.domain ?? existing.domain,
    url: input.url ?? existing.url,
    logo: input.logo ?? existing.logo,
    accent: input.accent ?? existing.accent,
    tagline: input.tagline ?? existing.tagline,
    tagline_ar: input.tagline_ar !== undefined ? input.tagline_ar : existing.tagline_ar,
    tagline_tr: input.tagline_tr !== undefined ? input.tagline_tr : existing.tagline_tr,
    is_active: input.is_active !== undefined ? input.is_active : existing.is_active === 1,
    sort_order: input.sort_order ?? existing.sort_order,
  };

  run(
    `UPDATE stores SET
        slug = ?, name = ?, name_ar = ?, name_tr = ?, domain = ?, url = ?, logo = ?,
        accent = ?, tagline = ?, tagline_ar = ?, tagline_tr = ?, is_active = ?, sort_order = ?
      WHERE id = ?`,
    slugify(merged.slug),
    merged.name,
    merged.name_ar ?? null,
    merged.name_tr ?? null,
    merged.domain.replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
    merged.url,
    merged.logo ?? "generic",
    merged.accent ?? "#D4AF37",
    merged.tagline ?? "",
    merged.tagline_ar ?? null,
    merged.tagline_tr ?? null,
    merged.is_active ? 1 : 0,
    merged.sort_order ?? 100,
    id,
  );
  return getStore(id);
}

export function toggleStore(id: number, isActive: boolean): Store | undefined {
  run(
    "UPDATE stores SET is_active = ? WHERE id = ?",
    isActive ? 1 : 0,
    id,
  );
  return getStore(id);
}

export function deleteStore(id: number): boolean {
  const result = run("DELETE FROM stores WHERE id = ?", id);
  return result.changes > 0;
}
