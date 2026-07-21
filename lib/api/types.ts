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

export type Video = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string; // "12:41"
  views: number;
  publishedAt: string; // ISO
  href: string;
};

export type Vod = {
  id: string;
  title: string;
  game: string;
  thumbnail: string;
  streamedAt: string; // ISO
  duration: string; // "7h 12m"
  peakViewers: number;
  href: string;
};
