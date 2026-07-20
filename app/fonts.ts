/**
 * Typography.
 *
 * The design calls for:
 *   Headings — TR 3 A
 *   Body     — PP Neue Montreal Book
 *
 * Both are commercial licences and neither file is in the repo, so the
 * site currently runs on the closest free stand-ins. Nothing else in the
 * codebase references the font names directly — everything goes through
 * the two CSS variables below, so swapping is a one-file change.
 *
 * TO INSTALL THE REAL FONTS
 * 1. Drop the woff2 files into app/fonts/:
 *      app/fonts/TR3A.woff2
 *      app/fonts/PPNeueMontreal-Book.woff2
 * 2. Delete the "STAND-IN" block below and uncomment the "LICENSED" block.
 * 3. Nothing else changes — the variable names are identical.
 *
 * Stand-in rationale:
 *   Archivo 700-900 — heavy neo-grotesque, closest free match for the
 *     oversized display setting the layout needs.
 *   Inter — neutral grotesque in the same family as PP Neue Montreal.
 *     PP Neue Montreal Book is lighter than Inter Regular, so the
 *     stand-in reads slightly heavier than the final will.
 */

/* ---------- STAND-IN (active) ---------- */
import { Archivo, Inter } from "next/font/google";

export const display = Archivo({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

export const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/* ---------- LICENSED (uncomment once the files are in place) ----------

import localFont from "next/font/local";

export const display = localFont({
  src: "./fonts/TR3A.woff2",
  variable: "--font-display",
  display: "swap",
  // Keeps layout shift down while the webfont loads.
  fallback: ["Archivo", "Helvetica Neue", "sans-serif"],
});

export const body = localFont({
  src: "./fonts/PPNeueMontreal-Book.woff2",
  variable: "--font-body",
  display: "swap",
  fallback: ["Inter", "system-ui", "sans-serif"],
});

------------------------------------------------------------------- */
