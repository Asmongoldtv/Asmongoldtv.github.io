export type LiveStatus = {
  live: boolean;
  /** Which platform is live; the hero pill links here */
  platform: "twitch" | "kick" | null;
  url: string;
  viewers?: number;
  title?: string;
};

export type NewsItem = {
  id: string;
  date: string; // ISO
  headline: string;
  excerpt: string;
  href: string;
  image?: string;
};

/**
 * Shape written by scripts/sync-videos.mjs. No duration: YouTube's public
 * RSS feed does not carry one (that needs the quota-limited Data API).
 */
export type Video = {
  id: string; // YouTube video id; the thumbnail is derived from it
  title: string;
  views: number;
  publishedAt: string; // ISO
  href: string;
};

/**
 * Shape written by scripts/sync-vods.mjs. No game/category: Twitch's
 * Helix /videos endpoint does not return one.
 */
export type Vod = {
  id: string; // numeric Twitch VOD id
  title: string;
  thumbnail: string;
  streamedAt: string; // ISO
  duration: string; // "7h 12m"
  views: number;
  href: string;
};
