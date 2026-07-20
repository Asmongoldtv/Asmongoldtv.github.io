/**
 * Static site content: nav, stats, timeline, platforms, sponsors.
 * Live numbers come from lib/api/* fetchers; these are the curated
 * fallbacks and copy that never depend on an API.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://asmongold-concept.vercel.app";

export const NAV_LINKS = [
  { href: "#bio", label: "Bio" },
  { href: "#channels", label: "Channels" },
  { href: "#news", label: "News" },
  { href: "#videos", label: "Videos" },
  { href: "#vods", label: "VODs" },
] as const;

export const HERO_STATS = [
  { label: "Total followers", value: 7_600_000, format: "compact" },
  { label: "Total views", value: 4_100_000_000, format: "compact" },
  { label: "Years streaming", value: 12, format: "plain" },
] as const;

/** Short lead for the About Me section. Two paragraphs, deliberately tight. */
export const BIO_PARAGRAPHS = [
  "Zack started uploading World of Warcraft commentary because nobody else was saying what he was thinking. Twitch turned that voice into the town square of the MMO world — six-figure concurrent peaks, viewership records, and a community that treated patch days like national holidays.",
  "In 2019 he co-founded One True King. The act after that is the biggest: a pivot from raid nights to the news desk, and one of the most-quoted voices in gaming culture — same chair, much bigger arena.",
] as const;


export type Platform = {
  id: string;
  name: string;
  handle: string;
  href: string;
  followers: number;
  followerLabel: string;
  live?: boolean;
  brandColor: string;
  subLink?: { label: string; href: string };
};

export const PLATFORMS: Platform[] = [
  {
    id: "twitch",
    name: "Twitch",
    handle: "twitch.tv/zackrawrr",
    href: "https://twitch.tv/zackrawrr",
    followers: 2_400_000,
    followerLabel: "followers",
    brandColor: "#9146FF",
    // Kept short: this renders as a pill on a narrow card and the handle
    // made it wrap to two lines.
    subLink: { label: "VOD reruns", href: "https://twitch.tv/asmongold247" },
  },
  {
    id: "kick",
    name: "Kick",
    handle: "kick.com/asmongold",
    href: "https://kick.com/asmongold",
    followers: 480_000,
    followerLabel: "followers",
    brandColor: "#53FC18",
  },
  {
    id: "youtube",
    name: "YouTube",
    handle: "@AsmonTV",
    href: "https://youtube.com/@AsmonTV",
    followers: 3_200_000,
    followerLabel: "subscribers",
    brandColor: "#FF0000",
    subLink: { label: "Second channel", href: "https://youtube.com/@ZackRawrr" },
  },
  {
    id: "rumble",
    name: "Rumble",
    handle: "rumble.com/c/Asmongold",
    href: "https://rumble.com/c/Asmongold",
    followers: 210_000,
    followerLabel: "followers",
    brandColor: "#85C742",
  },
  {
    id: "spotify",
    name: "Spotify",
    handle: "Asmongold Podcasts",
    href: "https://open.spotify.com/",
    followers: 95_000,
    followerLabel: "followers",
    brandColor: "#1DB954",
  },
  {
    id: "x",
    name: "X",
    handle: "@Asmongold",
    href: "https://x.com/asmongold",
    followers: 1_900_000,
    followerLabel: "followers",
    // X's mark is black. The old near-white value was for the dark theme
    // and disappears against the light cards.
    brandColor: "#111111",
  },
];

export const SPONSORS = [
  "NORDVPN",
  "GAMER SUPPS",
  "DISPLATE",
  "STARFORGE",
  "MEDAL.TV",
  "CASHAPP",
] as const;

export const FOOTER_COLUMNS = [
  {
    title: "Watch",
    links: [
      { label: "Twitch", href: "https://twitch.tv/zackrawrr" },
      { label: "Kick", href: "https://kick.com/asmongold" },
      { label: "YouTube", href: "https://youtube.com/@AsmonTV" },
      { label: "Rumble", href: "https://rumble.com/c/Asmongold" },
    ],
  },
  {
    title: "Follow",
    links: [
      { label: "X / Twitter", href: "https://x.com/asmongold" },
      { label: "Spotify", href: "https://open.spotify.com/" },
      { label: "OTK", href: "https://otknetwork.com" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Bio", href: "#bio" },
      { label: "News", href: "#news" },
      { label: "Partners", href: "#sponsors" },
    ],
  },
] as const;

/** Compact number: 7 600 000 -> "7.6M" */
export function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n}`;
}
