import "server-only";
import type { LiveStatus, Vod } from "./types";

/**
 * Twitch Helix fetchers. Server-side only — the app access token never
 * reaches the client. Requires TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET.
 * Every fetcher degrades to curated fallback data when creds are absent
 * or the API errors, so the site always renders.
 */

const CHANNEL_LOGIN = "zackrawrr";

const FALLBACK_STATUS: LiveStatus = {
  live: false,
  platform: null,
  url: "https://twitch.tv/zackrawrr",
};

export const FALLBACK_VODS: Vod[] = [
  {
    id: "v1",
    title: "The Industry Is Cooked — Full Stream",
    game: "Just Chatting",
    thumbnail: "/assets/thumbs/vod-1.svg",
    streamedAt: "2026-07-18T18:00:00Z",
    duration: "8h 12m",
    peakViewers: 61_400,
    href: "https://twitch.tv/zackrawrr/videos",
  },
  {
    id: "v2",
    title: "New MMO First Look — Actually Good?",
    game: "MMORPG",
    thumbnail: "/assets/thumbs/vod-2.svg",
    streamedAt: "2026-07-16T18:30:00Z",
    duration: "6h 45m",
    peakViewers: 54_100,
    href: "https://twitch.tv/zackrawrr/videos",
  },
  {
    id: "v3",
    title: "Elden Ring DLC — Zero Deaths Attempt",
    game: "Elden Ring",
    thumbnail: "/assets/thumbs/vod-3.svg",
    streamedAt: "2026-07-14T17:00:00Z",
    duration: "9h 02m",
    peakViewers: 72_800,
    href: "https://twitch.tv/zackrawrr/videos",
  },
  {
    id: "v4",
    title: "Reacting to the Worst Gaming Takes of 2026",
    game: "Just Chatting",
    thumbnail: "/assets/thumbs/vod-4.svg",
    streamedAt: "2026-07-12T18:00:00Z",
    duration: "7h 33m",
    peakViewers: 58_900,
    href: "https://twitch.tv/zackrawrr/videos",
  },
  {
    id: "v5",
    title: "WoW Classic Hardcore — The Final Push",
    game: "World of Warcraft",
    thumbnail: "/assets/thumbs/vod-5.svg",
    streamedAt: "2026-07-10T16:00:00Z",
    duration: "10h 18m",
    peakViewers: 84_200,
    href: "https://twitch.tv/zackrawrr/videos",
  },
];

async function getAppToken(): Promise<string | null> {
  const id = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !secret) return null;
  try {
    const res = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`,
      { method: "POST", next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token?: string };
    return json.access_token ?? null;
  } catch {
    return null;
  }
}

async function helix<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.twitch.tv/helix/${path}`, {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getLiveStatus(): Promise<LiveStatus> {
  const token = await getAppToken();
  if (!token) return FALLBACK_STATUS;

  const data = await helix<{
    data: Array<{ viewer_count: number; title: string }>;
  }>(`streams?user_login=${CHANNEL_LOGIN}`, token);

  const stream = data?.data?.[0];
  if (!stream) return FALLBACK_STATUS;
  return {
    live: true,
    platform: "twitch",
    url: `https://twitch.tv/${CHANNEL_LOGIN}`,
    viewers: stream.viewer_count,
    title: stream.title,
  };
}

export async function getLatestVods(): Promise<Vod[]> {
  const token = await getAppToken();
  if (!token) return FALLBACK_VODS;

  const users = await helix<{ data: Array<{ id: string }> }>(
    `users?login=${CHANNEL_LOGIN}`,
    token,
  );
  const userId = users?.data?.[0]?.id;
  if (!userId) return FALLBACK_VODS;

  const vods = await helix<{
    data: Array<{
      id: string;
      title: string;
      thumbnail_url: string;
      created_at: string;
      duration: string;
      view_count: number;
      url: string;
    }>;
  }>(`videos?user_id=${userId}&type=archive&first=5`, token);

  if (!vods?.data?.length) return FALLBACK_VODS;
  return vods.data.map((v) => ({
    id: v.id,
    title: v.title,
    game: "Stream", // Helix /videos has no category; needs a per-VOD lookup
    thumbnail: v.thumbnail_url
      .replace("%{width}", "480")
      .replace("%{height}", "270"),
    streamedAt: v.created_at,
    duration: v.duration.replace(/(\d+)h(\d+)m\d+s/, "$1h $2m"),
    peakViewers: v.view_count,
    href: v.url,
  }));
}
