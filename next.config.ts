import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Product preview images are fetched live from arbitrary retailer domains
  // (Trendyol, Shein, AliExpress…), so the optimizer is disabled to avoid
  // host allow-list failures. Images are served directly by the retailer CDN.
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  serverExternalPackages: ["node:sqlite"],
};

export default nextConfig;
