import { FOOTER_COLUMNS, PLATFORMS } from "@/lib/data";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { Reveal } from "@/components/ui/Reveal";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      aria-label="Site footer"
      className="relative overflow-hidden border-t border-hairline"
    >
      {/* Slow gold gradient mesh drifting behind everything */}
      <div aria-hidden className="absolute inset-0 opacity-[0.05]">
        <div
          className="animate-mesh absolute -inset-[20%]"
          style={{
            background:
              "radial-gradient(40% 50% at 25% 30%, #c9a227 0%, transparent 70%), radial-gradient(35% 45% at 75% 65%, #8b6f14 0%, transparent 70%), radial-gradient(30% 40% at 55% 20%, #f0c94a 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Oversized gold wordmark. Sized to sit fully inside the viewport
          (ASMONGOLD is ~6.68em wide in the display face, so 13vw spans
          ~87% — a smaller, uncropped version of the old 17vw). */}
      <div className="relative flex justify-center px-6 pt-14">
        <p className="display select-none whitespace-nowrap text-[clamp(2rem,13vw,14rem)] leading-[0.9] text-gold">
          ASMONGOLD
        </p>
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 pb-10 pt-14 lg:px-10">
        <Reveal>
          <div className="flex flex-col gap-12 md:flex-row md:justify-between">
            <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
              {FOOTER_COLUMNS.map((col) => (
                <nav key={col.title} aria-label={col.title}>
                  <p className="label mb-5 !text-gold-deep">{col.title}</p>
                  <ul className="flex flex-col gap-3">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          {...(l.href.startsWith("http")
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="text-sm text-ink/80 transition-colors duration-200 hover:opacity-60"
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>

            <div className="md:text-right">
              <p className="label mb-5 !text-gold-deep">Social</p>
              <ul className="flex gap-5 md:justify-end">
                {PLATFORMS.map((p) => (
                  <li key={p.id}>
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={p.name}
                      className="text-muted transition-colors duration-200 hover:opacity-60"
                    >
                      <PlatformIcon id={p.id} className="size-5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 border-t border-hairline pt-6">
          <div className="flex flex-col gap-2 text-[11px] leading-relaxed tracking-[0.06em] text-muted md:flex-row md:justify-between">
            <p>© {year} - All trademarks belong to their owners.</p>
            <p>
              Unofficial fan concept. Not affiliated with or endorsed by
              Asmongold or One True King.
            </p>
            <p>
              Design &amp; Developed by{" "}
              <a
                href="https://empdesigns.pt/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline decoration-hairline underline-offset-2 transition-opacity duration-200 hover:opacity-60"
              >
                EMP Designs
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
