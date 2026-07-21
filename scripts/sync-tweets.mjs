/**
 * Sync the newest tweets into data/tweets.json.
 *
 *   node scripts/sync-tweets.mjs
 *
 * Env:
 *   X_BEARER_TOKEN  required — app bearer token for the X API v2
 *   X_USERNAME      optional — handle to pull (default: Asmongold)
 *   TWEET_LIMIT     optional — how many to keep in the file (default: 16)
 *
 * HOW IT BEHAVES
 * New tweets are *merged* into the existing file, not swapped for it:
 * anything already stored is kept, fresh ones are added, duplicates are
 * resolved in favour of the newer copy (so like/repost counts refresh),
 * and the result is sorted newest-first and capped at TWEET_LIMIT.
 *
 * It never throws on an API problem. A missing token, a rate limit or an
 * X outage logs a notice and exits 0, leaving data/tweets.json untouched
 * — this runs inside the deploy pipeline, and a bad day at X should not
 * block the site from shipping.
 *
 * NOTE ON API ACCESS: reading a user's timeline is not part of the X API
 * free tier; it needs a paid plan. Without one this script will report a
 * 403 and skip, and the site keeps rendering whatever is in the JSON.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TOKEN = process.env.X_BEARER_TOKEN;
const USERNAME = process.env.X_USERNAME || "Asmongold";
const LIMIT = Number(process.env.TWEET_LIMIT || 16);
// Overridable so the merge logic can be exercised against a local stub.
const API = process.env.X_API_BASE || "https://api.x.com";
const FILE = join(process.cwd(), "data", "tweets.json");

/** Log and exit without failing the caller. */
function skip(reason) {
  console.log(`sync-tweets: skipped — ${reason}`);
  console.log("sync-tweets: data/tweets.json left unchanged.");
  process.exit(0);
}

if (!TOKEN) {
  skip(
    "no X_BEARER_TOKEN set. Add it as a repository secret to enable syncing.",
  );
}

async function api(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const hint =
      res.status === 401
        ? " (token rejected — check X_BEARER_TOKEN)"
        : res.status === 403
          ? " (forbidden — reading timelines requires a paid X API plan)"
          : res.status === 429
            ? " (rate limited — try again later)"
            : "";
    throw new Error(`${res.status} ${res.statusText}${hint} ${body.slice(0, 200)}`);
  }
  return res.json();
}

/** Existing file is the baseline; a malformed one is treated as empty. */
function readExisting() {
  try {
    const parsed = JSON.parse(readFileSync(FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn("sync-tweets: could not read existing file, starting fresh.");
    return [];
  }
}

let fetched;
try {
  const user = await api(
    `${API}/2/users/by/username/${encodeURIComponent(USERNAME)}`,
  );
  const id = user?.data?.id;
  if (!id) skip(`could not resolve @${USERNAME}`);

  const timeline = await api(
    `${API}/2/users/${id}/tweets` +
      `?max_results=${Math.min(Math.max(LIMIT, 5), 100)}` +
      `&tweet.fields=created_at,public_metrics&exclude=retweets,replies`,
  );

  const handle = `@${user.data.username ?? USERNAME}`;
  const name = user.data.name ?? USERNAME;

  fetched = (timeline?.data ?? []).map((t) => ({
    id: t.id,
    handle,
    name,
    text: t.text,
    date: t.created_at,
    likes: t.public_metrics?.like_count ?? 0,
    reposts: t.public_metrics?.retweet_count ?? 0,
    replies: t.public_metrics?.reply_count ?? 0,
    href: `https://x.com/${user.data.username ?? USERNAME}/status/${t.id}`,
  }));
} catch (err) {
  skip(String(err.message || err));
}

const existing = readExisting();
const existingIds = new Set(existing.map((t) => t.id));
const added = fetched.filter((t) => !existingIds.has(t.id));

// Fresh copies win on collision so engagement counts stay current.
const byId = new Map(existing.map((t) => [t.id, t]));
for (const t of fetched) byId.set(t.id, t);

const merged = [...byId.values()]
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .slice(0, LIMIT);

const next = JSON.stringify(merged, null, 2) + "\n";
const current = (() => {
  try {
    return readFileSync(FILE, "utf8");
  } catch {
    return "";
  }
})();

if (next === current) {
  console.log(
    `sync-tweets: up to date (${merged.length} stored, nothing new from @${USERNAME}).`,
  );
  process.exit(0);
}

writeFileSync(FILE, next);
console.log(
  `sync-tweets: ${added.length} new, ${merged.length} stored (@${USERNAME}).`,
);
for (const t of added.slice(0, 5)) {
  console.log(`  + ${t.date.slice(0, 10)}  ${t.text.replace(/\s+/g, " ").slice(0, 70)}`);
}
