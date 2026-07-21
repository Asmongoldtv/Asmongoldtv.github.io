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
  "Zack, better known as Asmongold, went from making World of Warcraft guides in his bedroom to becoming one of the most-watched streamers in the world. No polished set, no script, no filter. Just blunt takes and an audience that trusts him because of it.",
  "He's the reason Final Fantasy XIV sold out. He co-founded OTK and Starforge Systems. He's covered everything from raid nights to election nights to hundreds of thousands of live viewers. Whether he's reacting, reviewing, or picking a fight with a game studio, he's built a following on one thing: he says what he actually thinks.",
] as const;


/**
 * Latest Tweets section — the three posts embedded on the page.
 *
 * These are official X embeds keyed by status id, so X serves the live
 * content and there is nothing to keep in sync here. To feature different
 * posts, swap the ids: they are the last path segment of a tweet URL,
 * e.g. x.com/Asmongold/status/<id>.
 */
export const TWEET_HANDLE = "Asmongold";

export const FEATURED_TWEET_IDS = [
  "2041352900635422834",
  "2009816212843442600",
  "2007508319938965770",
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
  },
  {
    id: "kick",
    name: "Kick",
    handle: "kick.com/asmongold",
    href: "https://kick.com/asmongold",
    followers: 313_000,
    followerLabel: "followers",
    brandColor: "#53FC18",
  },
  {
    id: "youtube",
    name: "YouTube",
    handle: "@AsmonTV",
    href: "https://youtube.com/@AsmonTV",
    followers: 4_600_000,
    followerLabel: "subscribers",
    brandColor: "#FF0000",
    subLink: { label: "Second channel", href: "https://youtube.com/@ZackRawrr" },
  },
  {
    id: "rumble",
    name: "Rumble",
    handle: "rumble.com/c/Asmongold",
    href: "https://rumble.com/c/Asmongold",
    followers: 66_000,
    followerLabel: "followers",
    brandColor: "#85C742",
  },
  {
    id: "x",
    name: "X",
    handle: "@Asmongold",
    href: "https://x.com/asmongold",
    followers: 1_300_000,
    followerLabel: "followers",
    // X's mark is black. The old near-white value was for the dark theme
    // and disappears against the light cards.
    brandColor: "#111111",
  },
];

export const SPONSORS = [
  "GAMER SUPPS",
  "OTK NETWORK",
  "STARFORGE",
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
      { label: "Instagram", href: "https://www.instagram.com/asmongold/" },
      { label: "Reddit", href: "https://www.reddit.com/r/Asmongold/" },
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
