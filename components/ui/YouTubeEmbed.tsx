"use client";

import { useState } from "react";

/**
 * YouTube embed with a thumbnail facade.
 *
 * Clicking plays the video inline, in a real YouTube iframe — but the
 * iframe is only created on click. Six eagerly-loaded YouTube players
 * would pull well over a megabyte of third-party script before anyone
 * pressed play; this keeps the section as light as the image grid it
 * replaced. It is the approach Google itself recommends for embeds.
 *
 * Uses youtube-nocookie.com so nothing is set until playback starts.
 */
export function YouTubeEmbed({
  id,
  title,
}: {
  /** YouTube video id (the v= parameter). */
  id: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  // hq720 is a true 16:9 still; not every upload has one, so fall back.
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${id}/hq720.jpg`);

  if (playing) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-sm bg-ink">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play: ${title}`}
      className="group/vid relative block aspect-video w-full overflow-hidden rounded-sm bg-surface"
    >
      <img
        src={thumb}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setThumb(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-entrance)] group-hover/vid:scale-[1.04]"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gold/20 mix-blend-multiply transition-opacity duration-500 group-hover/vid:opacity-0"
      />
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-gold shadow-lg transition-transform duration-300 [transition-timing-function:var(--ease-entrance)] group-hover/vid:scale-110">
          <svg viewBox="0 0 24 24" className="size-7 translate-x-px text-ink">
            <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
          </svg>
        </span>
      </span>
    </button>
  );
}
