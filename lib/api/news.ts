import "server-only";
import type { NewsItem } from "./types";

/**
 * News fetcher. Points at an RSS/CMS endpoint (NEWS_FEED_URL) with
 * ISR at 30 minutes; degrades to curated hardcoded entries.
 */

export const FALLBACK_NEWS: NewsItem[] = [
  {
    id: "n1",
    date: "2026-07-17",
    headline: "OTK announces its biggest live event yet — a full arena show in Austin",
    excerpt:
      "One True King is taking the game-show format offstream and into a 12,000-seat arena, with the whole roster on stage for the first time.",
    href: "https://otknetwork.com",
    image: "/assets/thumbs/news-featured.svg",
  },
  {
    id: "n2",
    date: "2026-07-14",
    headline: "Multi-platform experiment pays off as Kick simulcasts hit record numbers",
    excerpt:
      "Splitting the stream across Twitch and Kick was supposed to fragment the audience. It doubled it instead.",
    href: "https://kick.com/asmongold",
    image: "/assets/thumbs/news-2.svg",
  },
  {
    id: "n3",
    date: "2026-07-10",
    headline: "The reaction era, quantified: AsmonTV crosses three million subscribers",
    excerpt:
      "The clips channel that started as an afterthought is now one of the largest gaming commentary channels on YouTube.",
    href: "https://youtube.com/@AsmonTV",
    image: "/assets/thumbs/news-3.svg",
  },
  {
    id: "n4",
    date: "2026-07-06",
    headline: "WoW Classic anniversary stream pulls the old raid team back together",
    excerpt:
      "A one-night reunion of the original <Dad Gamers> roster, twelve years after the first clear.",
    href: "https://twitch.tv/zackrawrr",
    image: "/assets/thumbs/news-4.svg",
  },
];

export async function getNews(): Promise<NewsItem[]> {
  const feed = process.env.NEWS_FEED_URL;
  if (!feed) return FALLBACK_NEWS;

  try {
    const res = await fetch(feed, { next: { revalidate: 1800 } });
    if (!res.ok) return FALLBACK_NEWS;
    const xml = await res.text();

    // Minimal RSS parse — swap for a real parser if the feed grows fancier.
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, 4)
      .map((m, i): NewsItem | null => {
        const block = m[1];
        const pick = (tag: string) =>
          block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`))?.[1]?.trim() ?? "";
        const headline = pick("title");
        if (!headline) return null;
        return {
          id: `rss-${i}`,
          date: new Date(pick("pubDate") || Date.now()).toISOString().slice(0, 10),
          headline,
          excerpt: pick("description").replace(/<[^>]+>/g, "").slice(0, 180),
          href: pick("link") || "#",
          image: FALLBACK_NEWS[i]?.image,
        };
      })
      .filter((x): x is NewsItem => x !== null);

    return items.length ? items : FALLBACK_NEWS;
  } catch {
    return FALLBACK_NEWS;
  }
}
