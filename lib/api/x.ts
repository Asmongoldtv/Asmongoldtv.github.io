import "server-only";
import type { Tweet } from "./types";
import fallbackTweets from "@/data/tweets.json";

/**
 * X / Twitter fetcher.
 *
 * NOTE ON API ACCESS: the X API v2 free tier does not cover reading a
 * user's timeline, and paid tiers are expensive for a fan site. The
 * fetch path below is implemented and gated on X_BEARER_TOKEN, but the
 * PRIMARY data source in practice is data/tweets.json — a manually
 * maintained file. Update it whenever you want fresh tweets on the
 * marquee. This is a deliberate fallback, not a stub.
 */

export async function getLatestTweets(): Promise<Tweet[]> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) return fallbackTweets as Tweet[];

  try {
    const userRes = await fetch(
      "https://api.x.com/2/users/by/username/Asmongold",
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 1800 },
      },
    );
    if (!userRes.ok) return fallbackTweets as Tweet[];
    const user = await userRes.json();
    const id = user.data?.id;
    if (!id) return fallbackTweets as Tweet[];

    const tlRes = await fetch(
      `https://api.x.com/2/users/${id}/tweets?max_results=12&tweet.fields=created_at,public_metrics&exclude=retweets,replies`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 1800 },
      },
    );
    if (!tlRes.ok) return fallbackTweets as Tweet[];
    const tl = await tlRes.json();

    return (tl.data ?? []).map(
      (t: {
        id: string;
        text: string;
        created_at: string;
        public_metrics: { like_count: number; retweet_count: number; reply_count: number };
      }): Tweet => ({
        id: t.id,
        handle: "@Asmongold",
        name: "Asmongold",
        text: t.text,
        date: t.created_at,
        likes: t.public_metrics.like_count,
        reposts: t.public_metrics.retweet_count,
        replies: t.public_metrics.reply_count,
        href: `https://x.com/asmongold/status/${t.id}`,
      }),
    );
  } catch {
    return fallbackTweets as Tweet[];
  }
}
