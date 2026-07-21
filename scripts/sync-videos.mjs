/**
 * Refresh data/videos.json with the channel's newest uploads.
 *
 *   node scripts/sync-videos.mjs
 *
 * Env:
 *   YOUTUBE_CHANNEL_ID  optional — defaults to the Asmongold TV channel
 *   VIDEO_LIMIT         optional — how many to keep (default: 6)
 *
 * Uses YouTube's public per-channel RSS feed, which needs no API key and
 * no quota. The feed carries the last ~15 uploads; we keep the newest
 * VIDEO_LIMIT, so a new upload pushes the oldest one out.
 *
 * It never throws on a network problem: an outage or a shape change logs
 * a notice and exits 0, leaving the JSON untouched. This runs inside the
 * deploy pipeline and a bad response upstream must not block the site
 * from shipping.
 *
 * The feed has no duration field — that is only in the paid-quota Data
 * API — so durations are not stored or displayed.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || "UCQeRaTukNYft1_6AZPACnog";
const LIMIT = Number(process.env.VIDEO_LIMIT || 6);
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const FILE = join(process.cwd(), "data", "videos.json");

function skip(reason) {
  console.log(`sync-videos: skipped — ${reason}`);
  console.log("sync-videos: data/videos.json left unchanged.");
  process.exit(0);
}

/** XML entities that show up in YouTube titles. */
function decode(s = "") {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

let xml;
try {
  const res = await fetch(FEED, { headers: { "user-agent": "asmongold-site" } });
  if (!res.ok) skip(`feed returned ${res.status} ${res.statusText}`);
  xml = await res.text();
} catch (err) {
  skip(String(err.message || err));
}

const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
if (!entries.length) skip("feed contained no entries");

const videos = entries
  .map(([, body]) => {
    const pick = (tag) =>
      (body.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)) || [])[1];
    const id = pick("yt:videoId");
    if (!id) return null;
    return {
      id,
      title: decode(pick("title") || "").trim(),
      publishedAt: pick("published") || "",
      views: Number((body.match(/views="(\d+)"/) || [])[1] || 0),
      href: `https://www.youtube.com/watch?v=${id}`,
    };
  })
  .filter(Boolean)
  .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  .slice(0, LIMIT);

if (!videos.length) skip("no usable entries after parsing");

const next = JSON.stringify(videos, null, 2) + "\n";
let current = "";
try {
  current = readFileSync(FILE, "utf8");
} catch {
  /* first run */
}

if (next === current) {
  console.log(`sync-videos: up to date (${videos.length} stored).`);
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
const added = videos.filter((v) => !previousIds.has(v.id));

mkdirSync(dirname(FILE), { recursive: true });
writeFileSync(FILE, next);

console.log(`sync-videos: ${added.length} new, ${videos.length} stored.`);
for (const v of added) {
  console.log(`  + ${v.publishedAt.slice(0, 10)}  ${v.title.slice(0, 66)}`);
}
