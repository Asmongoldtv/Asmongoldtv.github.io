import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages.
 *
 * `output: "export"` prerenders every page to plain HTML at build time —
 * no server, no ISR. The data fetchers run once during the build; with no
 * API keys set they fall back to the curated data in lib/, so the export
 * always succeeds.
 *
 * BASE_PATH is empty for a custom domain or a user/org page
 * (username.github.io). For a project page (username.github.io/repo) set
 * NEXT_PUBLIC_BASE_PATH to "/repo" in the deploy workflow so Next's own
 * assets resolve; manual asset URLs go through lib/asset.ts, which reads
 * the same value.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  images: {
    // Required for `output: export`; the site uses plain <img> anyway.
    unoptimized: true,
  },
  // GitHub Pages serves /path as /path/index.html; trailing slashes make
  // relative links resolve correctly on that host.
  trailingSlash: true,
};

export default nextConfig;
