/** Shared motion vocabulary — mirrors styles/design-tokens.css */

export const EASE_ENTRANCE = [0.16, 1, 0.3, 1] as const;
export const EASE_STATE = [0.65, 0, 0.35, 1] as const;

export const DUR = {
  micro: 0.18,
  standard: 0.5,
  cinematic: 0.9,
} as const;

export const STAGGER = 0.07;

/** Standard once-on-scroll entrance: fade + lift */
export const riseIn = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.cinematic, ease: EASE_ENTRANCE },
  },
};

export const staggerParent = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
};

export const VIEWPORT_ONCE = { once: true, margin: "-80px" } as const;
