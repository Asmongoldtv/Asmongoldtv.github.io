"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { PLATFORMS, formatCompact, type Platform } from "@/lib/data";
import type { LiveStatus } from "@/lib/api/types";

/**
 * Platform card, in the product-card format: a full-bleed plate in the
 * platform's own brand colour (scripts/build-channel-art.mjs) with a
 * frosted panel floating over it.
 *
 * The panel is ink at 55%, not a lighter glass. Over the brightest plate
 * in the set (Kick's #53FC18) a 35% scrim leaves white text at 3.0:1;
 * 55% takes it to 5.4:1, so the same panel works on all six without
 * per-platform tuning.
 */
function PlatformCard({ p, isLive }: { p: Platform; isLive: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || reduced) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    // Cursor-tracked tilt, max 6deg — kept deliberately subtle
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-6px)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
  };

  const art = `/assets/channels/${p.id}`;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative flex aspect-[4/5] min-w-[78vw] snap-start flex-col overflow-hidden rounded-[20px] transition-transform duration-500 [transition-timing-function:var(--ease-entrance)] sm:min-w-0"
    >
      {/* Brand plate */}
      <picture>
        <source
          type="image/avif"
          srcSet={`${art}-600.avif 600w, ${art}-900.avif 900w`}
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 33vw"
        />
        <source
          type="image/webp"
          srcSet={`${art}-600.webp 600w, ${art}-900.webp 900w`}
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 33vw"
        />
        <img
          src={`${art}-600.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-entrance)] group-hover:scale-[1.06]"
        />
      </picture>

      {/*
        Oversized mark, cropped by the card edge. The reference fills this
        area with the product shot; we have no per-platform photography, so
        the logo does the work instead of leaving the lower half bare.
      */}
      <PlatformIcon
        id={p.id}
        className="pointer-events-none absolute -bottom-8 -right-6 size-44 text-white/[0.13] transition-transform duration-700 [transition-timing-function:var(--ease-entrance)] group-hover:scale-110"
      />

      {/* Gold ring on hover, drawn inside so it follows the radius */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-white/15 transition-[box-shadow] duration-500 group-hover:ring-2 group-hover:ring-gold"
      />

      {/* Stretched link — whole card is clickable without nesting anchors */}
      <a
        href={p.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${p.name} — ${p.handle}`}
        className="absolute inset-0 z-[1]"
      />

      {/* Frosted header panel */}
      <div className="relative m-4 flex items-center gap-4 rounded-2xl bg-ink/55 p-4 backdrop-blur-xl">
        <div className="min-w-0 flex-1">
          <h3 className="display truncate text-xl text-white sm:text-2xl">
            {p.name}
          </h3>
          <p className="truncate text-[13px] text-white/75">{p.handle}</p>
        </div>
        <PlatformIcon id={p.id} className="size-7 shrink-0 text-white" />
      </div>

      {/* Pills */}
      <div className="relative mx-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-ink/65 px-4 py-1.5 text-[13px] font-semibold text-white backdrop-blur-md">
          {formatCompact(p.followers)} {p.followerLabel}
        </span>
        {isLive && (
          <span className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
            <span className="animate-pulse-dot size-1.5 rounded-full bg-ink" />
            Live
          </span>
        )}
      </div>

      {p.subLink && (
        <a
          href={p.subLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 mx-4 mb-4 mt-auto w-fit whitespace-nowrap rounded-full bg-ink/45 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-white/90 backdrop-blur-md transition-colors duration-200 hover:bg-ink/70"
        >
          {p.subLink.label}
        </a>
      )}
    </div>
  );
}

export function MediaChannels({ live }: { live: LiveStatus }) {
  return (
    <section
      id="channels"
      aria-labelledby="channels-heading"
      className="mx-auto max-w-[1440px] px-6 py-28 md:py-40 lg:px-10"
    >
      <SectionHeading id="channels-heading" lead="Asmongold Media" highlight="Channels" />
      {/* Capped at 70% of the container — a proportional 30% size cut that
          keeps the 3x2 grid rather than orphaning a row. Left-aligned, not
          centred, so the grid's edge lines up with the heading above it.
          The cap is lg-only: the two-column tablet layout is already
          narrow, and capping it there just left a dead gutter. Mobile is a
          carousel and needs its track wider than the viewport. */}
      <ul className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:max-w-[70%] lg:grid-cols-3">
        {PLATFORMS.map((p, i) => (
          <Reveal as="li" key={p.id} delay={(i % 3) * 0.08}>
            <PlatformCard p={p} isLive={live.live && live.platform === p.id} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
