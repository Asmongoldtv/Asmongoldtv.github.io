import { Reveal } from "@/components/ui/Reveal";
import { BIO_PARAGRAPHS } from "@/lib/data";

/**
 * About Me — heading and a short lead, nothing else.
 *
 * Server component: with the portrait, the profile panel and the milestone
 * timeline all removed, there is no state, no scroll-scrub and no GSAP
 * left here, so it no longer needs to ship as a client bundle.
 */
export function Bio() {
  return (
    <section
      id="bio"
      aria-labelledby="bio-heading"
      className="relative mx-auto max-w-[1440px] px-6 py-28 md:py-40 lg:px-10"
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <Reveal>
          <h2
            id="bio-heading"
            className="display text-4xl text-ink sm:text-5xl lg:text-6xl"
          >
            From WOW to the <span className="hl">World</span>
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="flex max-w-[62ch] flex-col gap-6 text-[17px] leading-[1.7] text-ink/90 md:text-lg">
            {BIO_PARAGRAPHS.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
