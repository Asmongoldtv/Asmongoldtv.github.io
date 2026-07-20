import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/data";

// Emit a static robots.txt at build time (required by output: export).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
