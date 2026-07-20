import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import type { NewsItem } from "@/lib/api/types";

function fmtDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    .toUpperCase();
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="size-3.5 -translate-x-1 text-ink opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
    >
      <path
        d="M1 8h13M9 3l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Editorial layout: one featured story + stacked column. Server component. */
export function News({ items }: { items: NewsItem[] }) {
  const [featured, ...rest] = items;
  if (!featured) return null;

  return (
    <section
      id="news"
      aria-labelledby="news-heading"
      className="mx-auto max-w-[1440px] px-6 py-28 md:py-40 lg:px-10"
    >
      <SectionHeading id="news-heading" lead="Latest" highlight="News" />

      <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
        {/* Featured story */}
        <Reveal as="article">
          <a href={featured.href} target="_blank" rel="noopener noreferrer" className="group block">
            <div className="relative aspect-[16/10] overflow-hidden bg-surface">
              {featured.image && (
                <img
                  src={featured.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-entrance)] group-hover:scale-[1.03]"
                />
              )}
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent"
              />
            </div>
            <p className="mt-6 text-xs tracking-[0.12em] text-ink">
              {fmtDate(featured.date)}
            </p>
            <h3 className="display mt-3 max-w-[24ch] text-2xl leading-tight text-ink md:text-3xl">
              <span className="underline-wipe">{featured.headline}</span>
            </h3>
            <p className="mt-3 line-clamp-2 max-w-[54ch] text-muted">{featured.excerpt}</p>
            <span className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-muted">
              Read <Arrow />
            </span>
          </a>
        </Reveal>

        {/* Stacked column */}
        <div className="flex flex-col divide-y divide-[var(--stroke)]">
          {rest.slice(0, 3).map((n, i) => (
            <Reveal as="article" key={n.id} delay={i * 0.08}>
              <a
                href={n.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-5 py-7 first:pt-0"
              >
                <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden bg-surface">
                  {n.image && (
                    <img
                      src={n.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] tracking-[0.12em] text-ink">
                    {fmtDate(n.date)}
                  </p>
                  <h3 className="display mt-2 text-lg leading-snug text-ink">
                    <span className="underline-wipe">{n.headline}</span>
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{n.excerpt}</p>
                </div>
                <span className="ml-auto self-center">
                  <Arrow />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
