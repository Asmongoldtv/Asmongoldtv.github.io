"use client";

import { useState } from "react";

/**
 * Twitch VOD embed with a thumbnail facade — same rationale as the
 * YouTube one: the player is only created on click, so no third-party
 * player script loads until someone actually wants to watch.
 *
 * The `parent` parameter is read from window.location.hostname at click
 * time rather than hardcoded. Twitch refuses to play if `parent` does not
 * match the embedding host, and that is the single most common way these
 * embeds break; deriving it means localhost, the Pages domain and any
 * future custom domain all work with no configuration.
 */
export function TwitchEmbed({
  id,
  title,
  thumbnail,
  href,
}: {
  /** Numeric Twitch VOD id. */
  id: string;
  title: string;
  thumbnail: string;
  href: string;
}) {
  const [playing, setPlaying] = useState(false);

  // Seed entries use placeholder ids until the sync script runs with
  // credentials. Those cannot be played, so link out instead of showing
  // a player that would only ever error.
  const playable = /^\d+$/.test(id);

  if (playing && playable) {
    const parent = window.location.hostname;
    return (
      <div className="relative aspect-video overflow-hidden rounded-sm bg-ink">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://player.twitch.tv/?video=${id}&parent=${parent}&autoplay=true`}
          title={title}
          allow="autoplay; fullscreen picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const Wrapper = playable ? "button" : "a";
  const wrapperProps = playable
    ? { type: "button" as const, onClick: () => setPlaying(true), "aria-label": `Play: ${title}` }
    : {
        href,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `Watch on Twitch: ${title}`,
      };

  return (
    <Wrapper
      {...wrapperProps}
      className="group/vod relative block aspect-video w-full overflow-hidden rounded-sm bg-surface"
    >
      <img
        src={thumbnail}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-entrance)] group-hover/vod:scale-[1.04]"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gold/20 mix-blend-multiply transition-opacity duration-500 group-hover/vod:opacity-0"
      />
      <span aria-hidden className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-gold shadow-lg transition-transform duration-300 [transition-timing-function:var(--ease-entrance)] group-hover/vod:scale-110">
          <svg viewBox="0 0 24 24" className="size-7 translate-x-px text-ink">
            <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
          </svg>
        </span>
      </span>
    </Wrapper>
  );
}
