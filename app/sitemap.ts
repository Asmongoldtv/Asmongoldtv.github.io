import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/data";

// Emit a static sitemap.xml at build time (required by output: export).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
