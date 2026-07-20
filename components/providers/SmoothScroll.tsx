"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

let lenis: Lenis | null = null;

/** Shared handle so the nav / anchors can drive smooth scrolling */
export function getLenis(): Lenis | null {
  return lenis;
}

export function scrollToAnchor(hash: string) {
  const target = document.querySelector(hash);
  if (!target) return;
  if (lenis) {
    lenis.scrollTo(target as HTMLElement, { duration: 1.2 });
  } else {
    (target as HTMLElement).scrollIntoView({ behavior: "smooth" });
  }
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    let raf = 0;
    const loop = (time: number) => {
      lenis?.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return <>{children}</>;
}
