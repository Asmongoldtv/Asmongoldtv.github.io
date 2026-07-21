import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/data";
import { ARTICLES } from "@/lib/articles";

// Emit a static sitemap.xml at build time (required by output: export).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    ...ARTICLES.map((a) => ({
      url: `${SITE_URL}/news/${a.slug}/`,
      lastModified: new Date(a.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
