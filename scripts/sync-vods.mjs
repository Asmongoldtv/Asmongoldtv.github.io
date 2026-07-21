/**
 * Refresh data/vods.json with the channel's newest past broadcasts.
 *
 *   TWITCH_CLIENT_ID=... TWITCH_CLIENT_SECRET=... node scripts/sync-vods.mjs
 *
 * Env:
 *   TWITCH_CLIENT_ID      required
 *   TWITCH_CLIENT_SECRET  required
 *   TWITCH_LOGIN          optional — channel login (default: zackrawrr)
 *   VOD_LIMIT             optional — how many to keep (default: 5)
 *
 * Twitch has no public feed, so this uses the official Helix API. The
 * credentials are FREE — register an app at https://dev.twitch.tv/console
 * and use its Client ID and Secret. No user login or review is involved;
 * this only reads public data via the client-credentials flow.
 *
 * It never throws: missing credentials, a rejected token or an outage log
 * a notice and exit 0, leaving the JSON untouched, so a bad day at Twitch
 * cannot block a deploy.
 *
 * Helix /videos carries no game or category, so none is stored.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const ID = process.env.TWITCH_CLIENT_ID;
const SECRET = process.env.TWITCH_CLIENT_SECRET;
const LOGIN = process.env.TWITCH_LOGIN || "zackrawrr";
const LIMIT = Number(process.env.VOD_LIMIT || 5);
const FILE = join(process.cwd(), "data", "vods.json");

function skip(reason) {
  console.log(`sync-vods: skipped — ${reason}`);
  console.log("sync-vods: data/vods.json left unchanged.");
  process.exit(0);
}

if (!ID || !SECRET) {
  skip(
    "TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET not set. Create a free app at " +
      "https://dev.twitch.tv/console and add them as repository secrets.",
  );
}

/** "3h20m30s" -> "3h 20m" (or "45m" for short streams). */
function formatDuration(raw = "") {
  const h = Number((raw.match(/(\d+)h/) || [])[1] || 0);
  const m = Number((raw.match(/(\d+)m/) || [])[1] || 0);
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

async function helix(path, token) {
  const res = await fetch(`https://api.twitch.tv/helix/${path}`, {
    headers: { "Client-ID": ID, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`helix ${path}: ${res.status} ${res.statusText} ${body.slice(0, 160)}`);
  }
  return res.json();
}

let vods;
try {
  const tokenRes = await fetch(
    "https://id.twitch.tv/oauth2/token" +
      `?client_id=${encodeURIComponent(ID)}` +
      `&client_secret=${encodeURIComponent(SECRET)}` +
      "&grant_type=client_credentials",
    { method: "POST" },
  );
  if (!tokenRes.ok) {
    skip(`token request failed: ${tokenRes.status} ${tokenRes.statusText}`);
  }
  const token = (await tokenRes.json()).access_token;
  if (!token) skip("no access token returned");

  const users = await helix(`users?login=${encodeURIComponent(LOGIN)}`, token);
  const userId = users?.data?.[0]?.id;
  if (!userId) skip(`could not resolve channel "${LOGIN}"`);

  const res = await helix(
    `videos?user_id=${userId}&type=archive&sort=time&first=${Math.min(Math.max(LIMIT, 1), 100)}`,
    token,
  );

  vods = (res?.data ?? []).map((v) => ({
    id: v.id,
    title: (v.title || "").trim(),
    thumbnail: (v.thumbnail_url || "")
      .replace("%{width}", "640")
      .replace("%{height}", "360"),
    streamedAt: v.created_at,
    duration: formatDuration(v.duration),
    views: Number(v.view_count || 0),
    href: v.url || `https://www.twitch.tv/videos/${v.id}`,
  }));
} catch (err) {
  skip(String(err.message || err));
}

if (!vods.length) skip("channel returned no archived VODs");

const next = JSON.stringify(vods, null, 2) + "\n";
let current = "";
try {
  current = readFileSync(FILE, "utf8");
} catch {
  /* first run */
}

if (next === current) {
  console.log(`sync-vods: up to date (${vods.length} stored).`);
  process.exit(0);
}

const previousIds = new Set(
  (() => {
    try {
      return JSON.parse(current).map((v) => v.id);
    } catch {
      return [];
    }
  })(),
);
const added = vods.filter((v) => !previousIds.has(v.id));

mkdirSync(dirname(FILE), { recursive: true });
writeFileSync(FILE, next);

console.log(`sync-vods: ${added.length} new, ${vods.length} stored (${LOGIN}).`);
for (const v of added) {
  console.log(`  + ${v.streamedAt.slice(0, 10)}  ${v.duration.padEnd(7)} ${v.title.slice(0, 58)}`);
}
