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
| `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` | VOD sync + live status (free, see VODs) |
| `NEWS_FEED_URL` | news RSS feed |
| `YOUTUBE_CHANNEL_ID` | override the channel the video sync reads (has a default) |

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

The Latest Tweets section uses **official X embeds** — X serves the live post,
so no API key is involved and the text can never drift out of date.

To feature different posts, edit `FEATURED_TWEET_IDS` in `lib/data.ts`. Each
id is the last path segment of a tweet URL:

```
https://x.com/Asmongold/status/2041352900635422834
                               └──────── this ────────┘
```

`components/ui/TweetEmbed.tsx` loads X's `widgets.js` once per page and asks
it to render the blockquotes. If the script is blocked (ad blockers commonly
do) or JS is off, the blockquote stays visible as a styled link, so the
section is never empty.

## Videos

The Latest Videos section shows the channel's six newest uploads, each
playable inline.

`data/videos.json` is refreshed by:

```bash
node scripts/sync-videos.mjs
```

That reads YouTube's **public per-channel RSS feed** — no API key, no quota.
It keeps the newest `VIDEO_LIMIT` (default 6), so a new upload pushes the
oldest one out, and it never throws: a feed outage logs a notice and leaves
the file untouched.

The deploy workflow runs it before every build, including on a 6-hour
schedule, so new uploads appear on their own. It deliberately does **not**
commit the result: view counts change constantly, which would mean a noisy
commit on every run. The build reads the freshly synced file either way; the
committed copy is the fallback used when the feed is unreachable.

`components/ui/YouTubeEmbed.tsx` renders a thumbnail facade and only creates
the real iframe on click. Six eagerly-loaded players would pull well over a
megabyte of third-party script before anyone pressed play.

> The RSS feed carries no duration, so durations are not shown — that field
> only exists in the quota-limited Data API.

## VODs

The Latest VODs section shows the channel's most recent past broadcasts,
playable inline via the Twitch player.

```bash
TWITCH_CLIENT_ID=... TWITCH_CLIENT_SECRET=... node scripts/sync-vods.mjs
```

Unlike YouTube, Twitch has no public feed — this uses the official Helix
API. **The credentials are free**: register an app at
<https://dev.twitch.tv/console>, take its Client ID and Secret, and add them
as repository secrets. No review, no cost, no user login; the script only
reads public data through the client-credentials flow.

Same contract as the video sync: it keeps the newest `VOD_LIMIT` (default 5),
runs before every build, is not committed, and never fails the deploy — with
no credentials it logs a notice and the committed fallback is used.

`components/ui/TwitchEmbed.tsx` uses the same thumbnail-facade approach as
YouTube. Two details worth knowing:

- **`parent` is read from `window.location.hostname` at click time**, never
  hardcoded. Twitch refuses to play when `parent` does not match the
  embedding host, and that is the most common way these embeds break;
  deriving it means localhost, the Pages domain and any future custom domain
  all work with no configuration.
- Until the sync runs, `data/vods.json` holds placeholder entries whose ids
  are not numeric. Those render as **link-outs to Twitch** rather than a
  player that could only ever error.

> Helix `/videos` returns no game or category, so none is shown.

## Deploy

`.github/workflows/deploy.yml` builds the static export and publishes it to
GitHub Pages. It runs on every push to `main`, on a 6-hour schedule (to pick
up new uploads), and on demand via **Actions → Run workflow**.
