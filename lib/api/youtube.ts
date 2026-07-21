import "server-only";
import type { Video } from "./types";
import stored from "@/data/videos.json";

/**
 * Videos come from data/videos.json, refreshed by scripts/sync-videos.mjs
 * off YouTube's public per-channel RSS feed (no API key, no quota).
 *
 * The deploy workflow runs that script before every build, so the site
 * always ships with the newest uploads. The committed copy of the file is
 * the fallback used when the feed is unreachable.
 */
export async function getLatestVideos(): Promise<Video[]> {
  return (stored as Video[])
    .slice()
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
