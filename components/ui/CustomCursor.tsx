"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Gold dot cursor. Lerped follow; scales up and inverts over
 * interactive elements. Renders nothing on touch / reduced motion.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
    document.documentElement.classList.add("cursor-none-global");

    const pos = { x: -100, y: -100 };
    const target = { x: -100, y: -100 };
    let hovering = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      hovering = !!(e.target as HTMLElement).closest(
        "a, button, input, [role='button'], [data-cursor]",
      );
    };

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.22;
      pos.y += (target.y - pos.y) * 0.22;
      const el = dotRef.current;
      if (el) {
        el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${hovering ? 2.6 : 1})`;
        el.style.mixBlendMode = hovering ? "difference" : "normal";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.documentElement.classList.remove("cursor-none-global");
    };
  }, []);

  if (!enabled) return null;
  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[120] size-3 rounded-full bg-gold-bright transition-[width,height] duration-200"
    />
  );
}
