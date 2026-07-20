"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { DUR, EASE_ENTRANCE, VIEWPORT_ONCE } from "@/lib/motion";

/** Standard once-on-scroll entrance: fade + lift. Opacity-only under reduced motion. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article" | "figure";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration: DUR.cinematic, delay, ease: EASE_ENTRANCE }}
    >
      {children}
    </Tag>
  );
}
