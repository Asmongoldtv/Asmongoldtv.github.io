import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { formatCompact } from "@/lib/data";
import type { Video } from "@/lib/api/types";

function relativeDate(iso: string) {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

/** Six most recent uploads, each playable inline. */
export function Videos({ videos }: { videos: Video[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: videos.map((v, i) => ({
      "@type": "VideoObject",
      position: i + 1,
      name: v.title,
      thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hq720.jpg`,
      uploadDate: v.publishedAt,
      url: v.href,
    })),
  };

  return (
    <section
      id="videos"
      aria-labelledby="videos-heading"
      className="mx-auto max-w-[1440px] px-6 py-28 md:py-40 lg:px-10"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SectionHeading id="videos-heading" lead="Latest" highlight="Videos" />

      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {videos.slice(0, 6).map((v, i) => (
          <Reveal as="li" key={v.id} delay={(i % 3) * 0.08}>
            <YouTubeEmbed id={v.id} title={v.title} />
            <h3 className="mt-4 line-clamp-2 text-[15px] font-medium leading-snug text-ink">
              <a
                href={v.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity duration-200 hover:opacity-60"
              >
                {v.title}
              </a>
            </h3>
            <p className="label mt-2 text-[10px]">
              {formatCompact(v.views)} views · {relativeDate(v.publishedAt)}
            </p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
