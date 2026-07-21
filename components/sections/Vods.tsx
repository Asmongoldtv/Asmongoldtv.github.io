import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { TwitchEmbed } from "@/components/ui/TwitchEmbed";
import { formatCompact } from "@/lib/data";
import type { Vod } from "@/lib/api/types";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/**
 * Past broadcasts, playable inline. Two columns rather than the Videos
 * grid's three: VODs are long-form, so they get wider cards and keep the
 * two sections visually distinct.
 */
export function Vods({ vods }: { vods: Vod[] }) {
  return (
    <section
      id="vods"
      aria-labelledby="vods-heading"
      className="mx-auto max-w-[1440px] px-6 py-28 md:py-40 lg:px-10"
    >
      <SectionHeading id="vods-heading" lead="Latest" highlight="VODs" />

      <ul className="grid gap-x-6 gap-y-10 md:grid-cols-2">
        {vods.map((v, i) => (
          <Reveal as="li" key={v.id} delay={(i % 2) * 0.08}>
            <TwitchEmbed
              id={v.id}
              title={v.title}
              thumbnail={v.thumbnail}
              href={v.href}
            />
            <h3 className="mt-4 line-clamp-2 text-[15px] font-medium leading-snug text-ink md:text-base">
              <a
                href={v.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity duration-200 hover:opacity-60"
              >
                {v.title}
              </a>
            </h3>
            <p className="label mt-2 text-[10px]">
              {fmtDate(v.streamedAt)} · {v.duration} ·{" "}
              {formatCompact(v.views)} views
            </p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
