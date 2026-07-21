# Asmongold — Concept Site

A single long-scroll fan site for Asmongold (Zack). Warm greige canvas, gold
accent, oversized wordmark, scroll-driven animation throughout.

> **Unofficial fan concept.** Not affiliated with or endorsed by Asmongold or
> One True King. All trademarks belong to their owners.

## Stack

- **Next.js 15** (App Router, static export)
- **Tailwind CSS v4** — tokens in `styles/design-tokens.css`, mapped in `app/globals.css`
- **Motion** (`motion/react`) for component animation
- **Lenis** for smooth scrolling
- Deployed as a static site to **GitHub Pages**

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
npm run typecheck
```

`npm run build` produces a fully static site in `out/` — no server required.
Data fetchers run once at build time and fall back to curated data in `lib/`
when no API keys are set, so the build always succeeds.

## Environment variables

All optional — every fetcher degrades to curated fallback data.

| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical / OG / sitemap URL (set by the deploy workflow) |
| `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` | live status + VODs |
| `YOUTUBE_API_KEY` | latest videos |
| `X_BEARER_TOKEN` | tweet sync script only (see below) |
| `NEWS_FEED_URL` | news RSS feed |

Copy `.env.example` → `.env.local` to set them locally.

## Structure

```
app/                  layout, page, robots, sitemap
components/sections/  Hero, Bio, MediaChannels, News, Tweets, Videos, Vods, Sponsors, Footer
components/ui/         Nav, ScrollProgress, CustomCursor, RoachTrail, Reveal, CountUp, icons
lib/                  data (copy, links), api/ (typed fetchers with fallbacks), motion tokens
scripts/             asset generators (run manually; see below)
```

## Assets

The hero and About portraits are illustrated cut-outs. The channel-card
backgrounds and placeholder thumbnails are generated procedurally. To
regenerate:

```bash
node scripts/build-hero-assets.mjs [source.webp]   # responsive hero AVIF/WebP
node scripts/build-channel-art.mjs                 # per-platform brand plates
node scripts/gen-placeholders.mjs                  # favicon, thumbnails, OG image
```

## Tweets

`data/tweets.json` is the single source of truth for the Latest Tweets
marquee — the site only ever reads that file, so a build never depends on X
being reachable, and the tweets are versioned in git.

To pull in new ones:

```bash
X_BEARER_TOKEN=... node scripts/sync-tweets.mjs
```

The script **merges** rather than replaces: existing tweets are kept, new ones
are added, duplicates resolve in favour of the fresher copy (so like and
repost counts refresh), and the result is sorted newest-first and capped at
`TWEET_LIMIT` (default 16). Running it twice with no new tweets writes
nothing.

It never fails its caller: a missing token, a rate limit or an X outage logs a
notice and exits 0, leaving the file untouched. The deploy workflow runs it on
a 6-hour schedule and commits the file only when it actually changed.

> **Requires a paid X API plan.** Reading a user's timeline is not part of the
> free tier — on free the script reports a 403 and skips. Until then,
> `data/tweets.json` can simply be edited by hand; the format is one object
> per tweet with `id`, `handle`, `name`, `text`, `date` (ISO), `likes`,
> `reposts`, `replies` and `href`.

## Deploy

`.github/workflows/deploy.yml` builds the static export and publishes it to
GitHub Pages. It runs on every push to `main`, on a 6-hour schedule (to pick
up new tweets), and on demand via **Actions → Run workflow**.

The tweet sync commits inside that same workflow on purpose: a push made with
`GITHUB_TOKEN` does not trigger other workflows, so a standalone sync job
would update the data but never republish the site.
