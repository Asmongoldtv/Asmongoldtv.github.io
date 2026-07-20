import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SPONSORS } from "@/lib/data";

/** Quiet, confident. Wordmarks only — no marketing copy. */
export function Sponsors() {
  return (
    <section
      id="sponsors"
      aria-labelledby="sponsors-heading"
      className="mx-auto max-w-[1440px] px-6 py-32 md:py-48 lg:px-10"
    >
      <SectionHeading id="sponsors-heading" highlight="Partners" />
      <Reveal>
        <ul className="sponsor-row flex flex-wrap items-center gap-x-14 gap-y-10 lg:justify-between">
          {SPONSORS.map((s) => (
            <li key={s}>
              <span
                data-cursor
                className="sponsor-logo display cursor-default text-xl tracking-[0.04em] text-muted opacity-40 transition-[opacity,color] duration-[400ms] [transition-timing-function:var(--ease-state)] md:text-2xl"
              >
                {s}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
