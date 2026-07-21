import "server-only";
import type { LiveStatus, Vod } from "./types";
import storedVods from "@/data/vods.json";

/**
 * Twitch data.
 *
 * VODs come from data/vods.json, refreshed by scripts/sync-vods.mjs off
 * the Helix API. The deploy workflow runs that before every build, so the
 * site ships with the newest broadcasts; the committed copy is the
 * fallback used when Twitch is unreachable or credentials are absent.
 *
 * Live status is still fetched here, but note it is baked in at build
 * time on a static export — it reflects whether the channel was live when
 * the site was last built, not right now. The "Watch Live" button links
 * to the channel either way.
 */

const CHANNEL_LOGIN = process.env.TWITCH_LOGIN || "zackrawrr";

const OFFLINE: LiveStatus = {
  live: false,
  platform: null,
  url: `https://twitch.tv/${CHANNEL_LOGIN}`,
};

export async function getLatestVods(): Promise<Vod[]> {
  return (storedVods as Vod[])
    .slice()
    .sort((a, b) => Date.parse(b.streamedAt) - Date.parse(a.streamedAt));
}

export async function getLiveStatus(): Promise<LiveStatus> {
  const id = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !secret) return OFFLINE;

  try {
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`,
      { method: "POST" },
    );
    if (!tokenRes.ok) return OFFLINE;
    const token = (await tokenRes.json())?.access_token;
    if (!token) return OFFLINE;

    const res = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${CHANNEL_LOGIN}`,
      { headers: { "Client-ID": id, Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return OFFLINE;

    const stream = (await res.json())?.data?.[0];
    if (!stream) return OFFLINE;

    return {
      live: true,
      platform: "twitch",
      url: `https://twitch.tv/${CHANNEL_LOGIN}`,
      viewers: stream.viewer_count,
      title: stream.title,
    };
  } catch {
    return OFFLINE;
  }
}
