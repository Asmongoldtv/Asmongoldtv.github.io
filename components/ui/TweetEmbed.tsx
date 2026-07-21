"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Official X (Twitter) embeds.
 *
 * Renders the real, live tweet — X serves the content itself, so nothing
 * here needs an API key and the text can never drift out of date. If a
 * tweet is edited or deleted upstream, the embed reflects that.
 *
 * widgets.js replaces each <blockquote class="twitter-tweet"> with an
 * iframe. Until it runs — or if it is blocked by an ad blocker, or the
 * visitor has no JS — the blockquote itself stays on screen as a styled
 * link, so the section is never empty.
 */

type Twttr = {
  widgets?: { load?: (el?: HTMLElement) => void };
};

declare global {
  interface Window {
    twttr?: Twttr;
  }
}

const SCRIPT_ID = "x-widgets-js";
const SCRIPT_SRC = "https://platform.twitter.com/widgets.js";

/** Load widgets.js once per page, no matter how many embeds mount. */
function loadWidgets(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.twttr?.widgets?.load) return Promise.resolve();

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => resolve(), { once: true });
    });
  }

  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = SCRIPT_SRC;
    s.async = true;
    s.charset = "utf-8";
    // Resolve on error too: a blocked script must not leave the section
    // stuck in a loading state — the blockquote fallback is good enough.
    s.addEventListener("load", () => resolve(), { once: true });
    s.addEventListener("error", () => resolve(), { once: true });
    document.head.appendChild(s);
  });
}

export function TweetEmbed({
  id,
  handle,
}: {
  /** Numeric status id from the tweet URL. */
  id: string;
  handle: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadWidgets().then(() => {
      if (cancelled || !ref.current) return;
      // Re-scan this subtree; needed because the markup arrives via React
      // after widgets.js has already done its initial page scan.
      window.twttr?.widgets?.load?.(ref.current);
      setRendered(true);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const url = `https://twitter.com/${handle}/status/${id}`;

  return (
    <div ref={ref} className="tweet-embed" data-loaded={rendered || undefined}>
      <blockquote
        className="twitter-tweet"
        data-theme="light"
        data-dnt="true"
        data-conversation="none"
      >
        <a href={url}>View post on X</a>
      </blockquote>
    </div>
  );
}
