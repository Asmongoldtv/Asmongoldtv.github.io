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
| `X_BEARER_TOKEN` | latest tweets (else `data/tweets.json`) |
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

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
static export and publishes it to GitHub Pages. See the workflow for details.
