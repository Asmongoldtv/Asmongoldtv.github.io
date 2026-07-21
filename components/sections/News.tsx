import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ARTICLES, articleImage, type Article } from "@/lib/articles";

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

function Thumb({ article, className }: { article: Article; className?: string }) {
  const base = articleImage(article.slug, 800);
  return (
    <picture>
      <source
        type="image/avif"
        srcSet={`${base}.avif 800w, ${articleImage(article.slug, 1400)}.avif 1400w`}
        sizes="(max-width: 1024px) 100vw, 55vw"
      />
      <source
        type="image/webp"
        srcSet={`${base}.webp 800w, ${articleImage(article.slug, 1400)}.webp 1400w`}
        sizes="(max-width: 1024px) 100vw, 55vw"
      />
      <img
        src={`${base}.webp`}
        alt=""
        loading="lazy"
        decoding="async"
        className={className}
      />
    </picture>
  );
}

/** Editorial layout: one featured article + a stacked column. */
export function News() {
  const [featured, ...rest] = ARTICLES;
  if (!featured) return null;

  return (
    <section
      id="news"
      aria-labelledby="news-heading"
      className="mx-auto max-w-[1440px] px-6 py-28 md:py-40 lg:px-10"
    >
      <SectionHeading id="news-heading" lead="Latest" highlight="News" />

      <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
        {/* Featured */}
        <Reveal as="article">
          <Link href={`/news/${featured.slug}/`} className="group block">
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-surface">
              <Thumb
                article={featured}
                className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-entrance)] group-hover:scale-[1.03]"
              />
            </div>
            <p className="label mt-6 !text-gold-deep">
              {fmtDate(featured.date)} · {featured.topic}
            </p>
            <h3 className="display mt-3 max-w-[26ch] text-2xl leading-tight text-ink md:text-3xl">
              <span className="underline-wipe">{featured.title}</span>
            </h3>
            <p className="mt-3 line-clamp-3 max-w-[58ch] text-muted">
              {featured.excerpt}
            </p>
            <span className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-muted">
              Read <Arrow />
            </span>
          </Link>
        </Reveal>

        {/* Stacked column */}
        <div className="flex flex-col divide-y divide-[var(--stroke)]">
          {rest.map((n, i) => (
            <Reveal as="article" key={n.slug} delay={i * 0.08}>
              <Link
                href={`/news/${n.slug}/`}
                className="group flex gap-5 py-7 first:pt-0"
              >
                {/* self-start or the flex row stretches this to the full
                    item height and the aspect ratio is ignored, which
                    crops the thumbnail's artwork. */}
                <div className="relative aspect-[16/10] w-28 shrink-0 self-start overflow-hidden rounded-sm bg-surface">
                  <Thumb
                    article={n}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                </div>
                <div className="min-w-0">
                  <p className="label !text-gold-deep">{n.topic}</p>
                  <h3 className="display mt-2 text-lg leading-snug text-ink">
                    <span className="underline-wipe">{n.title}</span>
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{n.excerpt}</p>
                </div>
                <span className="ml-auto self-center">
                  <Arrow />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
