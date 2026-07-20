import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { formatCompact } from "@/lib/data";
import type { Vod } from "@/lib/api/types";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

/** Full-width list — deliberately a different shape from the Videos grid. */
export function Vods({ vods }: { vods: Vod[] }) {
  return (
    <section
      id="vods"
      aria-labelledby="vods-heading"
      className="mx-auto max-w-[1440px] px-6 py-28 md:py-40 lg:px-10"
    >
      <SectionHeading id="vods-heading" lead="Latest" highlight="VODs" />
      <ul className="border-t border-hairline">
        {vods.map((v, i) => (
          <Reveal as="li" key={v.id} delay={i * 0.05}>
            <a
              href={v.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col gap-4 border-b border-hairline py-5 transition-colors duration-300 hover:bg-surface md:flex-row md:items-center md:gap-8"
            >
              {/* Gold bar grows from the top on hover */}
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-gold transition-transform duration-300 [transition-timing-function:var(--ease-state)] group-hover:scale-y-100"
              />
              <div className="flex w-full items-center gap-6 transition-transform duration-300 [transition-timing-function:var(--ease-state)] group-hover:translate-x-2 md:contents">
                <div className="w-[160px] shrink-0 overflow-hidden bg-elevated transition-transform duration-300 [transition-timing-function:var(--ease-state)] md:w-[240px] md:group-hover:translate-x-2">
                  <img
                    src={v.thumbnail}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-video h-auto w-full object-cover"
                  />
                </div>
                <div className="grid min-w-0 flex-1 gap-x-6 gap-y-1 transition-transform duration-300 [transition-timing-function:var(--ease-state)] md:grid-cols-[110px_1fr_170px] md:items-center md:group-hover:translate-x-2">
                  <span className="label truncate text-[10px] text-ink">
                    {v.game}
                  </span>
                  <h3 className="truncate pr-4 text-[15px] font-medium text-ink md:text-base">
                    {v.title}
                  </h3>
                  <div className="flex gap-4 text-[11px] tracking-[0.08em] text-muted md:justify-end">
                    <span>{fmtDate(v.streamedAt)}</span>
                    <span>{v.duration}</span>
                    <span className="text-ink/80">
                      {formatCompact(v.peakViewers)} peak
                    </span>
                  </div>
                </div>
              </div>
            </a>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
