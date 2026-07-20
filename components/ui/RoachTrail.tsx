"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-driven trail: a path snakes down the page, one bend per section,
 * drawing itself as you scroll while a cockroach walks along it.
 *
 * The path is generated from the real section positions after layout (and
 * on resize), not hardcoded, so it keeps weaving correctly when section
 * heights change. The roach is placed with getPointAtLength() and rotated
 * to the local tangent, so it always faces the way it is travelling.
 *
 * Sits at -z-10: a positioned element at z-index 0 paints *above*
 * non-positioned block content, which would put the trail over the copy.
 */
export function RoachTrail() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const clipRef = useRef<SVGRectElement>(null);
  const roachRef = useRef<SVGGElement>(null);
  const [geom, setGeom] = useState<{ w: number; h: number; d: string } | null>(
    null,
  );
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
  }, []);

  /* Build the path from the sections currently on the page. */
  useEffect(() => {
    if (!enabled) return;

    const build = () => {
      const sections = [...document.querySelectorAll<HTMLElement>("main > section")];
      if (!sections.length) return;

      const w = document.documentElement.clientWidth;
      const h = document.documentElement.scrollHeight;
      const inset = Math.max(18, Math.min(90, w * 0.07));

      // Start where the hero ends — inside it the trail is hidden behind
      // the full-bleed artwork anyway.
      const first = sections[0].getBoundingClientRect();
      const startY = first.bottom + window.scrollY;

      const points: { x: number; y: number }[] = [{ x: w / 2, y: startY }];
      sections.slice(1).forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const top = r.top + window.scrollY;
        points.push({
          x: i % 2 === 0 ? inset : w - inset,
          y: top + r.height * 0.5,
        });
      });
      points.push({ x: w / 2, y: h - 40 });

      // Smooth vertical S-curves: control points share the midpoint Y of
      // each segment, which keeps every join tangent-continuous.
      let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const cur = points[i];
        const midY = (prev.y + cur.y) / 2;
        d += ` C ${prev.x.toFixed(1)} ${midY.toFixed(1)}, ${cur.x.toFixed(1)} ${midY.toFixed(1)}, ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`;
      }

      setGeom({ w, h, d });
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [enabled]);

  /* Drive the reveal and the walk from scroll position. */
  useEffect(() => {
    if (!enabled || !geom) return;
    const path = pathRef.current;
    const roach = roachRef.current;
    const clip = clipRef.current;
    if (!path || !roach || !clip) return;

    const len = path.getTotalLength();

    let raf = 0;
    let queued = false;
    let idle: ReturnType<typeof setTimeout>;

    const draw = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const at = len * p;

      const pt = path.getPointAtLength(at);
      /* Reveal by clipping to everything above the roach rather than by
         stroke-dashoffset: dasharray is already carrying the dotted
         pattern, and an inline dashoffset would overwrite it. The trail
         only ever descends, so a horizontal clip edge is exact — and it
         reads better, appearing behind the roach as it walks. */
      clip.setAttribute("height", String(Math.max(0, pt.y)));
      // Sample slightly ahead for the tangent; clamp so the last frame
      // doesn't sample past the end and snap the rotation.
      const ahead = path.getPointAtLength(Math.min(len, at + 2));
      const angle = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;

      roach.setAttribute(
        "transform",
        `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(1.3)`,
      );
      roach.style.opacity = p > 0.005 ? "1" : "0";
    };

    const onScroll = () => {
      roach.dataset.walking = "true";
      clearTimeout(idle);
      idle = setTimeout(() => delete roach.dataset.walking, 160);
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled, geom]);

  if (!enabled || !geom) return null;

  return (
    <svg
      ref={svgRef}
      aria-hidden
      width={geom.w}
      height={geom.h}
      viewBox={`0 0 ${geom.w} ${geom.h}`}
      className="pointer-events-none absolute left-0 top-0 -z-10"
    >
      <defs>
        <clipPath id="roach-reveal">
          <rect ref={clipRef} x="0" y="0" width={geom.w} height="0" />
        </clipPath>
      </defs>
      <path
        ref={pathRef}
        d={geom.d}
        fill="none"
        stroke="var(--gold-deep)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray="1 8"
        opacity={0.55}
        clipPath="url(#roach-reveal)"
      />
      <g ref={roachRef} className="roach" style={{ opacity: 0 }}>
        {/* Drawn pointing along +X so the tangent angle can be applied raw */}
        <g
          className="roach-legs roach-legs-a"
          stroke="var(--ink)"
          strokeWidth={1.6}
          strokeLinecap="round"
          fill="none"
        >
          <path d="M-6 -5 l-5 -4M0 -6 l-2 -6M6 -5 l5 -5" />
        </g>
        <g
          className="roach-legs roach-legs-b"
          stroke="var(--ink)"
          strokeWidth={1.6}
          strokeLinecap="round"
          fill="none"
        >
          <path d="M-6 5 l-5 4M0 6 l-2 6M6 5 l5 5" />
        </g>
        <ellipse
          cx="0"
          cy="0"
          rx="11"
          ry="7"
          fill="#5a3a1e"
          stroke="var(--ink)"
          strokeWidth={1.5}
        />
        <path d="M-8 0 L8 0" stroke="var(--ink)" strokeWidth={1.1} opacity={0.7} />
        <circle
          cx="10"
          cy="0"
          r="4.2"
          fill="#3d2713"
          stroke="var(--ink)"
          strokeWidth={1.4}
        />
        {/* Longer and thinner than the legs, or they read as a seventh pair */}
        <path
          d="M13.5 -2.2 q8 -6 14 -2.5M13.5 2.2 q8 6 14 2.5"
          stroke="var(--ink)"
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
