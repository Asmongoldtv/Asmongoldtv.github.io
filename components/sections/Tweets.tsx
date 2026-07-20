"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { formatCompact } from "@/lib/data";
import type { Tweet } from "@/lib/api/types";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60_000))}m`;
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function TweetCard({ t }: { t: Tweet }) {
  return (
    <a
      href={t.href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-[340px] shrink-0 select-none flex-col gap-4 border border-hairline bg-surface p-6 transition-colors duration-300 hover:border-gold/50"
      draggable={false}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-elevated text-xs text-ink">
          A
        </span>
        <div className="leading-tight">
          <p className="text-sm font-medium text-ink">{t.name}</p>
          <p className="text-[11px] text-muted">{t.handle}</p>
        </div>
        <PlatformIcon id="x" className="ml-auto size-4 text-muted" />
      </div>
      <p className="line-clamp-4 whitespace-pre-line text-[15px] leading-relaxed text-ink/90">
        {t.text}
      </p>
      <div className="mt-auto flex items-center gap-5 text-[11px] tracking-[0.08em] text-muted">
        <span>{formatCompact(t.replies)} replies</span>
        <span>{formatCompact(t.reposts)} rt</span>
        <span className="text-ink/80">{formatCompact(t.likes)} likes</span>
        <span className="ml-auto">{timeAgo(t.date)}</span>
      </div>
    </a>
  );
}

/**
 * Auto-drifting marquee row. rAF-driven so it can pause on hover and
 * accept pointer drags; content is doubled for a seamless wrap.
 */
function MarqueeRow({
  tweets,
  direction,
  speed,
}: {
  tweets: Tweet[];
  direction: 1 | -1;
  speed: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track || reduced) return;

    let offset = 0;
    let paused = false;
    let dragging = false;
    let lastX = 0;
    let raf = 0;
    let half = track.scrollWidth / 2;

    const onEnter = () => (paused = true);
    const onLeave = () => {
      paused = false;
      dragging = false;
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      track.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      offset += e.clientX - lastX;
      lastX = e.clientX;
    };
    const onUp = () => (dragging = false);

    const loop = () => {
      if (!paused && !dragging) offset -= direction * speed;
      // wrap seamlessly in both directions
      if (offset <= -half) offset += half;
      if (offset > 0) offset -= half;
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => (half = track.scrollWidth / 2));
    ro.observe(track);
    track.addEventListener("mouseenter", onEnter);
    track.addEventListener("mouseleave", onLeave);
    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      track.removeEventListener("mouseenter", onEnter);
      track.removeEventListener("mouseleave", onLeave);
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
    };
  }, [direction, speed, reduced]);

  return (
    <div className="overflow-hidden">
      <div ref={trackRef} className="flex w-max touch-pan-y gap-5 pr-5">
        {tweets.map((t) => (
          <TweetCard key={t.id} t={t} />
        ))}
        {/* Clone half for the seamless wrap — out of a11y tree and tab order */}
        <div aria-hidden inert className="contents">
          {tweets.map((t) => (
            <TweetCard key={`${t.id}-clone`} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Tweets({ tweets }: { tweets: Tweet[] }) {
  const rowA = tweets.filter((_, i) => i % 2 === 0);
  const rowB = tweets.filter((_, i) => i % 2 === 1);
  return (
    <section
      id="tweets"
      aria-labelledby="tweets-heading"
      className="overflow-hidden py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <SectionHeading id="tweets-heading" lead="Latest" highlight="Tweets" />
      </div>
      <div className="flex flex-col gap-5">
        <MarqueeRow tweets={rowA} direction={1} speed={0.45} />
        <MarqueeRow tweets={rowB} direction={-1} speed={0.32} />
      </div>
    </section>
  );
}
