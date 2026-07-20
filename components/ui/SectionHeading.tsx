import { Reveal } from "./Reveal";

/**
 * Section heading. Every one carries a gold-filled run, matching the
 * About Me heading — pass the plain part as `lead` and the highlighted
 * part as `highlight`. `lead` is optional for one-word headings.
 */
export function SectionHeading({
  id,
  lead,
  highlight,
}: {
  id: string;
  lead?: string;
  highlight: string;
}) {
  return (
    <Reveal className="mb-14 md:mb-20">
      <h2 id={id} className="display text-4xl text-ink sm:text-5xl lg:text-6xl">
        {lead ? `${lead} ` : null}
        <span className="hl">{highlight}</span>
      </h2>
    </Reveal>
  );
}
