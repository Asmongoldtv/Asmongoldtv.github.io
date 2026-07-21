import "server-only";
import type { Tweet } from "./types";
import stored from "@/data/tweets.json";

/**
 * Tweets come from data/tweets.json, which is the single source of truth.
 *
 * That file is populated by scripts/sync-tweets.mjs, which talks to the X
 * API and merges new tweets in. Keeping ingestion in the script and out of
 * the render path means the build never depends on X being reachable, and
 * the tweets are versioned in git.
 *
 * To refresh manually: `node scripts/sync-tweets.mjs` (needs
 * X_BEARER_TOKEN). The file can also just be hand-edited.
 */
export async function getLatestTweets(): Promise<Tweet[]> {
  return (stored as Tweet[])
    .slice()
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}
