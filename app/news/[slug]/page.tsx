import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/sections/Footer";
import {
  ARTICLES,
  articleImage,
  getArticle,
  renderArticleBody,
} from "@/lib/articles";
import { SITE_URL } from "@/lib/data";

export const dynamic = "force-static";

/** One static page per article, so the whole set exports to plain HTML. */
export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  const image = `${articleImage(slug, 1400)}.webp`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/news/${slug}/` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${SITE_URL}/news/${slug}/`,
      type: "article",
      publishedTime: article.date,
      images: [{ url: image, width: 1400, height: 875, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [image],
    },
  };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const body = renderArticleBody(slug);

  // Split on where the highlight actually occurs, not on the assumption
  // that it is the trailing run — "GTA 6: Every Take Ahead of..." has it
  // mid-title, and slicing from the end garbled the heading.
  const at = article.title.indexOf(article.titleHighlight);
  const lead = at >= 0 ? article.title.slice(0, at) : article.title;
  const tail =
    at >= 0 ? article.title.slice(at + article.titleHighlight.length) : "";

  const img = articleImage(slug, 1400);
  const others = ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    image: `${SITE_URL}${img}.webp`,
    mainEntityOfPage: `${SITE_URL}/news/${slug}/`,
    author: { "@type": "Person", name: "Asmongold" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Articles have no hero, so the nav is always solid here. */}
      <Nav solid />

      <main className="pt-16">
        <article className="mx-auto max-w-[820px] px-6 pb-24 pt-16 md:pt-24">
          <p className="label mb-5">
            <Link href="/#news" className="transition-opacity hover:opacity-60">
              News
            </Link>
            <span aria-hidden> / {article.topic}</span>
          </p>

          <h1 className="display text-3xl leading-[1.08] text-ink sm:text-4xl lg:text-5xl">
            {lead}
            {at >= 0 && <span className="hl">{article.titleHighlight}</span>}
            {tail}
          </h1>

          <p className="label mt-6">Updated {fmtDate(article.date)}</p>

          <figure className="mt-10 overflow-hidden rounded-sm border border-hairline">
            <picture>
              <source
                type="image/avif"
                srcSet={`${articleImage(slug, 800)}.avif 800w, ${img}.avif 1400w`}
                sizes="(max-width: 860px) 100vw, 820px"
              />
              <source
                type="image/webp"
                srcSet={`${articleImage(slug, 800)}.webp 800w, ${img}.webp 1400w`}
                sizes="(max-width: 860px) 100vw, 820px"
              />
              <img
                src={`${articleImage(slug, 800)}.webp`}
                alt=""
                className="aspect-[16/10] w-full object-cover"
              />
            </picture>
          </figure>

          {/* Rendered from markdown at build time; styling lives in .prose. */}
          <div
            className="prose mt-12"
            dangerouslySetInnerHTML={{ __html: body }}
          />

          <div className="mt-16 border-t border-hairline pt-10">
            <p className="label mb-6">Keep reading</p>
            <ul className="grid gap-6 sm:grid-cols-3">
              {others.map((a) => (
                <li key={a.slug}>
                  <Link href={`/news/${a.slug}/`} className="group block">
                    <div className="overflow-hidden rounded-sm border border-hairline">
                      <img
                        src={`${articleImage(a.slug, 800)}.webp`}
                        alt=""
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium leading-snug text-ink">
                      <span className="underline-wipe">{a.title}</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
