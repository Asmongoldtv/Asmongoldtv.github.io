import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { formatCompact } from "@/lib/data";
import type { Video } from "@/lib/api/types";

function relativeDate(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

/** Server component. VideoObject JSON-LD lives here alongside the grid. */
export function Videos({ videos }: { videos: Video[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: videos.map((v, i) => ({
      "@type": "VideoObject",
      position: i + 1,
      name: v.title,
      thumbnailUrl: v.thumbnail,
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
      <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {videos.slice(0, 6).map((v, i) => (
          <Reveal as="li" key={v.id} delay={(i % 3) * 0.08}>
            <a
              href={v.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative aspect-video overflow-hidden bg-surface">
                <img
                  src={v.thumbnail}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-entrance)] group-hover:scale-[1.04]"
                />
                {/* Gold tint that lifts on hover */}
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gold/20 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0"
                />
                {/* Play triangle — ink, since thumbnails can be light */}
                <span
                  aria-hidden
                  className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                >
                  <span className="flex size-14 items-center justify-center rounded-full bg-gold">
                    <svg viewBox="0 0 24 24" className="size-7 translate-x-px text-ink">
                      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
                    </svg>
                  </span>
                </span>
                <span className="absolute bottom-2 right-2 bg-ink/85 px-1.5 py-0.5 text-[11px] tabular-nums text-white">
                  {v.duration}
                </span>
              </div>
              <h3 className="mt-4 line-clamp-2 text-[15px] font-medium leading-snug text-ink transition-colors duration-300 group-hover:opacity-60">
                {v.title}
              </h3>
              <p className="label mt-2 text-[10px]">
                {formatCompact(v.views)} views · {relativeDate(v.publishedAt)}
              </p>
            </a>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
