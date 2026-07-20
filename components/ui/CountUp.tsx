"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { formatCompact } from "@/lib/data";

/** Number that counts up once when it enters the viewport. */
export function CountUp({
  value,
  format = "compact",
  duration = 1400,
  className,
  suffix = "",
}: {
  value: number;
  format?: "compact" | "plain";
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const fmt = (n: number) =>
      format === "compact" ? formatCompact(n) : Math.round(n).toLocaleString();
    if (reduced) {
      setDisplay(fmt(value));
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(fmt(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, format, reduced]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
