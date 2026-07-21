"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NAV_LINKS } from "@/lib/data";
import type { LiveStatus } from "@/lib/api/types";
import { scrollToAnchor } from "@/components/providers/SmoothScroll";
import { EASE_ENTRANCE, STAGGER } from "@/lib/motion";

/**
 * Fixed nav. The hero carries its own inline link row, so on desktop this
 * bar stays hidden until the hero has scrolled past — otherwise the same
 * links appear twice on first paint. On mobile the hero row is hidden, so
 * the bar (logo + menu button) is always present.
 *
 * `solid` opts out of that: article pages have no hero, so there is
 * nothing to defer to and the bar must be visible from the top.
 */
export function Nav({ live, solid = false }: { live: LiveStatus; solid?: boolean }) {
  const [scrolled, setScrolled] = useState(solid);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (solid) return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [solid]);

  const anchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    // Article pages have none of these sections, so smooth-scrolling would
    // do nothing. Send the visitor to the homepage anchor instead.
    if (document.querySelector(href)) scrollToAnchor(href);
    else window.location.href = `/${href}`;
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${
        scrolled
          ? "border-b border-hairline bg-canvas/80 opacity-100 backdrop-blur-md"
          : // Desktop hides it until scrolled — the hero owns the links up
            // there. Mobile keeps it, since the hero row is hidden below md.
            "border-b border-transparent bg-transparent md:pointer-events-none md:opacity-0"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10"
      >
        <a
          href="#top"
          onClick={(e) => anchor(e, "#top")}
          className="display text-lg text-ink"
          aria-label="Asmongold — back to top"
        >
          A<span className="text-gold-deep">.</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => anchor(e, l.href)}
                className="label !text-ink transition-opacity duration-200 hover:opacity-55"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <a
            href={live.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-gold px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-ink transition-colors duration-200 hover:bg-gold-bright sm:block"
          >
            {live.live ? "● Watch Live" : "Watch Live"}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex size-10 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span
              className={`h-px w-6 bg-ink transition-transform duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-6 bg-ink transition-transform duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_ENTRANCE }}
            className="fixed inset-0 top-16 z-[99] bg-canvas/95 backdrop-blur-lg md:hidden"
          >
            <ul className="flex flex-col gap-2 px-8 pt-12">
              {NAV_LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 + i * STAGGER,
                    duration: 0.6,
                    ease: EASE_ENTRANCE,
                  }}
                >
                  <a
                    href={l.href}
                    onClick={(e) => anchor(e, l.href)}
                    className="display block py-3 text-4xl text-ink transition-opacity hover:opacity-60"
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + NAV_LINKS.length * STAGGER,
                  duration: 0.6,
                  ease: EASE_ENTRANCE,
                }}
              >
                <a
                  href={live.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block rounded-full bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-ink"
                >
                  {live.live ? "● Live now" : "Watch live"}
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
