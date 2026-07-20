"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** 2px gold bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 40,
    restDelta: 0.001,
  });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[110] h-[2px] origin-left bg-gold"
      style={{ scaleX }}
    />
  );
}
