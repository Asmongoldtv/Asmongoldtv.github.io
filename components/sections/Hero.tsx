"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { NAV_LINKS } from "@/lib/data";
import { scrollToAnchor } from "@/components/providers/SmoothScroll";

/**
 * Hero layout, after the reference:
 *   z-0  oversized wordmark
 *   z-10 inline nav row, sitting directly under the wordmark
 *   z-20 cut-out subject, overlapping both
 *   z-30 frosted card
 *
 * The subject layer is pointer-events-none: its PNG is a full-width
 * rectangle and would otherwise swallow clicks meant for the nav links
 * showing through its transparent regions.
 */

/* Split so both groups sit clear of the figure's silhouette. */
const NAV_LEFT = [{ href: "#top", label: "Home" }, ...NAV_LINKS.slice(0, 2)];
const NAV_RIGHT = NAV_LINKS.slice(2);

/**
 * Entrance timing, measured off the reference video frame by frame.
 * The yellow wordmark's bounding box gives the phases directly: its right
 * edge holds at x=1362 from the first frame while the left edge sweeps
 * 1138 -> 236 by t=0.4s, and glyphs appear sliced mid-shape — so it is a
 * continuous wipe anchored to the final right edge, not letters landing
 * one at a time. Its top edge then rises 464 -> 266 between t=0.8 and
 * t=1.6 while the subject resolves out of a blur.
 *
 * Only the nav stagger lives here; the rest is in globals.css. The whole
 * sequence is pure CSS on purpose — an earlier JS-driven version did not
 * start until hydration finished, which left the page blank for ~900ms.
 * CSS animations run from first paint.
 */
const NAV_T = { start: 1680, stagger: 70 };

function NavGroup({
  links,
  from,
}: {
  links: readonly { href: string; label: string }[];
  /** Index offset so the two groups share one continuous stagger. */
  from: number;
}) {
  return (
    <ul className="flex items-center gap-5 lg:gap-7">
      {links.map((l, i) => (
        // The entrance rides on the <li> so each separator fades in with
        // its own link — on the <a> alone the ticks appeared first, on
        // their own, and read as a broken row.
        <li
          key={l.href}
          data-nav-item
          style={{ animationDelay: `${NAV_T.start + (from + i) * NAV_T.stagger}ms` }}
          className="flex items-center gap-5 lg:gap-7"
        >
          {i > 0 && <span aria-hidden className="h-3.5 w-px bg-ink/25" />}
          <a
            href={l.href}
            onClick={(e) => {
              e.preventDefault();
              scrollToAnchor(l.href);
            }}
            className="text-[15px] font-bold uppercase tracking-[0.1em] text-ink transition-opacity duration-200 hover:opacity-55 lg:text-base"
          >
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const liftRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  /**
   * Fit the wordmark to the viewport width, then play the entrance.
   *
   * A hardcoded vw size only works for one font: "ASMONGOLD" measures
   * 6.68em in the Archivo stand-in, and TR 3 A will differ. Measuring at
   * a reference size and scaling means the wordmark stays edge-to-edge
   * through the font swap with nothing to retune. The CSS clamp() is the
   * pre-hydration approximation.
   */
  useEffect(() => {
    const el = wordmarkRef.current;
    const word = wordRef.current;
    if (!el || !word) return;

    const fit = () => {
      const container = el.parentElement?.parentElement;
      if (!container) return;
      // Measuring needs the untransformed width; the wipe animation is
      // running on this span, so read its layout width, not its box.
      el.style.fontSize = "100px";
      const natural = word.offsetWidth;
      if (!natural) return;
      const target = container.clientWidth * 0.97;
      el.style.fontSize = `${Math.min((100 * target) / natural, 400)}px`;
    };

    fit();
    document.fonts?.ready.then(fit).catch(() => {});
    const ro = new ResizeObserver(fit);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);

  /* Mouse parallax: inverse cursor offset, lerped at 0.06 so it trails. */
  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const section = sectionRef.current;
    if (!section) return;
    const layers = [...section.querySelectorAll<HTMLElement>("[data-depth]")];
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const loop = () => {
      pos.x += (target.x - pos.x) * 0.06;
      pos.y += (target.y - pos.y) * 0.06;
      for (const l of layers) {
        const depth = Number(l.dataset.depth);
        l.style.transform = `translate3d(${-pos.x * depth}px, ${-pos.y * depth}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [reduced]);

  return (
    <section
      id="top"
      ref={sectionRef}
      aria-label="Asmongold"
      className="hero-intro relative flex h-[100svh] min-h-[640px] flex-col overflow-hidden"
    >
      {/* ---------- z-0 / z-10 — wordmark and nav ---------- */}
      {/* pt-20 on mobile clears the fixed nav bar, which is visible there. */}
      <div className="relative z-10 overflow-hidden px-2 pt-20 md:pt-[7svh]">
        {/* Three nested nodes on purpose: parallax writes transform on
            [data-depth], the lift owns its own node, and the wipe needs a
            third — one element cannot carry three independent transforms. */}
        <div data-depth="7">
          <div ref={liftRef} data-lift>
            <h1
              ref={wordmarkRef}
              className="display select-none text-center leading-[0.82] text-gold"
              style={{ fontSize: "clamp(3rem, 14.3vw, 20rem)", fontWeight: 900 }}
            >
              <span
                ref={wordRef}
                data-wordmark
                className="inline-block whitespace-nowrap will-change-transform"
              >
                ASMONGOLD
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/*
        Nav sits *behind* the subject, as in the reference — the groups are
        pushed to the outer edges where the silhouette never reaches, so the
        figure crosses the row without covering a link.
        The subject layer is pointer-events-none, so these stay clickable.
      */}
      <nav
        aria-label="Section"
        className="relative z-10 mt-7 hidden items-start justify-between px-6 md:flex lg:px-10"
      >
        <NavGroup links={NAV_LEFT} from={0} />
        <NavGroup links={NAV_RIGHT} from={NAV_LEFT.length} />
      </nav>

      {/* ---------- z-20 — subject ---------- */}
      <div
        data-depth="4"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[14svh] z-20"
      >
        <div className="animate-breathe flex h-full justify-center">
          <picture data-subject className="block h-full w-full">
            <source
              media="(max-width: 768px)"
              type="image/avif"
              srcSet="/assets/hero-subject-mobile-720.avif 720w, /assets/hero-subject-mobile-1080.avif 1080w"
              sizes="100vw"
            />
            <source
              media="(max-width: 768px)"
              type="image/webp"
              srcSet="/assets/hero-subject-mobile-720.webp 720w, /assets/hero-subject-mobile-1080.webp 1080w"
              sizes="100vw"
            />
            <source
              type="image/avif"
              srcSet="/assets/hero-subject-1440.avif 1440w, /assets/hero-subject-2560.avif 2560w"
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet="/assets/hero-subject-1440.webp 1440w, /assets/hero-subject-2560.webp 2560w"
              sizes="100vw"
            />
            <img
              src="/assets/hero-subject-1440.webp"
              alt="Illustrated portrait of Asmongold — long hair, headphones, arms spread mid-take"
              fetchPriority="high"
              decoding="async"
              /* The near-square mobile crop is width-constrained in a tall
                 portrait container, leaving a dead gap under the wordmark;
                 cover fills it. The crop already excludes the hands. */
              className="h-full w-full object-bottom object-cover md:object-contain"
            />
          </picture>
        </div>
      </div>

      {/* ---------- z-30 — frosted card, centred over the chest ---------- */}
      <div className="absolute inset-x-0 bottom-[12svh] z-30 flex justify-center px-6">
        <div
          data-card
          className="card-frost-solid rounded-sm px-7 py-5 text-center"
        >
          <p className="label mb-2">Welcome</p>
          <p className="display text-2xl leading-tight text-ink sm:text-3xl">
            Welcome to my Nest
          </p>
        </div>
      </div>
    </section>
  );
}
