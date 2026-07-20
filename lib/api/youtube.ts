import "server-only";
import type { Video } from "./types";

/**
 * YouTube Data API v3 fetcher, server-side with ISR (15 min).
 * Requires YOUTUBE_API_KEY. Falls back to curated entries otherwise.
 */

const CHANNEL_HANDLE = "AsmonTV";

export const FALLBACK_VIDEOS: Video[] = [
  {
    id: "yt1",
    title: "This Is the Biggest Scandal in Gaming History",
    thumbnail: "/assets/thumbs/video-1.svg",
    duration: "24:18",
    views: 2_100_000,
    publishedAt: "2026-07-18T14:00:00Z",
    href: "https://youtube.com/@AsmonTV",
  },
  {
    id: "yt2",
    title: "Asmongold Reacts to the Future of MMOs",
    thumbnail: "/assets/thumbs/video-2.svg",
    duration: "31:42",
    views: 1_800_000,
    publishedAt: "2026-07-17T14:00:00Z",
    href: "https://youtube.com/@AsmonTV",
  },
  {
    id: "yt3",
    title: "The Truth About Streaming Money",
    thumbnail: "/assets/thumbs/video-3.svg",
    duration: "18:05",
    views: 3_400_000,
    publishedAt: "2026-07-15T14:00:00Z",
    href: "https://youtube.com/@AsmonTV",
  },
  {
    id: "yt4",
    title: "I Played the Most Hated Game of 2026",
    thumbnail: "/assets/thumbs/video-4.svg",
    duration: "42:11",
    views: 2_700_000,
    publishedAt: "2026-07-13T14:00:00Z",
    href: "https://youtube.com/@AsmonTV",
  },
  {
    id: "yt5",
    title: "Why Every Studio Is Making the Same Mistake",
    thumbnail: "/assets/thumbs/video-5.svg",
    duration: "27:56",
    views: 1_500_000,
    publishedAt: "2026-07-11T14:00:00Z",
    href: "https://youtube.com/@AsmonTV",
  },
  {
    id: "yt6",
    title: "McConnell and I Settle This Once and for All",
    thumbnail: "/assets/thumbs/video-6.svg",
    duration: "35:20",
    views: 1_900_000,
    publishedAt: "2026-07-09T14:00:00Z",
    href: "https://youtube.com/@AsmonTV",
  },
];

function isoDurationToClock(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "0:00";
  const [, h, min, s] = m;
  const mm = Number(min ?? 0);
  const ss = String(Number(s ?? 0)).padStart(2, "0");
  return h ? `${h}:${String(mm).padStart(2, "0")}:${ss}` : `${mm}:${ss}`;
}

export async function getLatestVideos(): Promise<Video[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return FALLBACK_VIDEOS;

  try {
    const chRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${CHANNEL_HANDLE}&key=${key}`,
      { next: { revalidate: 900 } },
    );
    if (!chRes.ok) return FALLBACK_VIDEOS;
    const ch = await chRes.json();
    const uploads: string | undefined =
      ch.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) return FALLBACK_VIDEOS;

    const plRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=6&playlistId=${uploads}&key=${key}`,
      { next: { revalidate: 900 } },
    );
    if (!plRes.ok) return FALLBACK_VIDEOS;
    const pl = await plRes.json();
    const ids = pl.items
      .map((i: { contentDetails: { videoId: string } }) => i.contentDetails.videoId)
      .join(",");

    const vidRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${ids}&key=${key}`,
      { next: { revalidate: 900 } },
    );
    if (!vidRes.ok) return FALLBACK_VIDEOS;
    const vids = await vidRes.json();

    return vids.items.map(
      (v: {
        id: string;
        snippet: { title: string; publishedAt: string; thumbnails: { high: { url: string } } };
        contentDetails: { duration: string };
        statistics: { viewCount: string };
      }): Video => ({
        id: v.id,
        title: v.snippet.title,
        thumbnail: v.snippet.thumbnails.high.url,
        duration: isoDurationToClock(v.contentDetails.duration),
        views: Number(v.statistics.viewCount),
        publishedAt: v.snippet.publishedAt,
        href: `https://youtube.com/watch?v=${v.id}`,
      }),
    );
  } catch {
    return FALLBACK_VIDEOS;
  }
}
