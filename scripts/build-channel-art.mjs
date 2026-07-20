/**
 * Generates an abstract background plate per platform card, tinted to that
 * platform's brand colour.
 *
 * Run: node scripts/build-channel-art.mjs
 * Output: public/assets/channels/<id>-{800,1200}.{avif,webp}
 *
 * Procedural rather than AI-generated on purpose: six plates need to read
 * as one set, and the only thing that should vary between them is the hue
 * and the composition seed. Generating them means the brand colour is
 * exact, the files are ~5KB, and retuning is one edit.
 *
 * The art is produced at full saturation. The card mutes it at rest with
 * CSS (opacity + saturate) and lets it bloom on hover, so one asset serves
 * both states.
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

/* Portrait, to match the 3:4 product-card format. */
const W = 900;
const H = 1200;

/** id -> brand colour, mirroring PLATFORMS in lib/data.ts */
const BRANDS = {
  twitch: "#9146FF",
  kick: "#53FC18",
  youtube: "#FF0000",
  rumble: "#85C742",
  spotify: "#1DB954",
  x: "#111111",
};

/** Mix a hex toward white/black so each plate has tonal range. */
function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const to = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  const ch = (v) => Math.round(v + (to - v) * t);
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map(ch)
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

/**
 * Each plate: a base wash, three blurred blobs and one diagonal streak.
 * Positions are driven by the index so no two compositions match, while
 * the construction stays identical across the set.
 */
function plate(brand, i) {
  const light = shade(brand, 0.42);
  const deep = shade(brand, -0.55);
  const blobs = [
    { cx: 0.24 + (i % 3) * 0.18, cy: 0.2 + ((i * 2) % 3) * 0.12, r: 0.7, c: light, o: 0.9 },
    { cx: 0.8 - ((i + 1) % 3) * 0.16, cy: 0.74 - (i % 2) * 0.18, r: 0.62, c: brand, o: 0.95 },
    { cx: 0.5 + (i % 2 ? 0.26 : -0.26), cy: 0.52, r: 0.5, c: deep, o: 0.7 },
  ];
  const angle = -22 + i * 9;

  /* Saturated, not washed: the card no longer mutes the plate, so the
     colour that ships here is the colour on screen. */
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${shade(brand, 0.3)}"/>
        <stop offset="1" stop-color="${shade(brand, -0.3)}"/>
      </linearGradient>
      ${blobs
        .map(
          (b, k) => `<radialGradient id="b${k}" cx="${b.cx}" cy="${b.cy}" r="${b.r}">
            <stop offset="0" stop-color="${b.c}" stop-opacity="${b.o}"/>
            <stop offset="1" stop-color="${b.c}" stop-opacity="0"/>
          </radialGradient>`,
        )
        .join("")}
      <linearGradient id="streak" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${light}" stop-opacity="0"/>
        <stop offset="0.5" stop-color="${light}" stop-opacity="0.5"/>
        <stop offset="1" stop-color="${light}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#base)"/>
    ${blobs.map((_, k) => `<rect width="${W}" height="${H}" fill="url(#b${k})"/>`).join("")}
    <g transform="rotate(${angle} ${W / 2} ${H / 2})">
      <rect x="${-W * 0.3}" y="${H * (0.3 + (i % 3) * 0.14)}" width="${W * 1.6}" height="${H * 0.13}" fill="url(#streak)"/>
    </g>
  </svg>`);
}

const outDir = join(process.cwd(), "public", "assets", "channels");
mkdirSync(outDir, { recursive: true });

let i = 0;
for (const [id, brand] of Object.entries(BRANDS)) {
  const svg = plate(brand, i++);
  for (const w of [900, 600]) {
    const pipe = sharp(svg, { density: 200 }).resize({ width: w });
    await pipe.clone().avif({ quality: 58, effort: 6 }).toFile(join(outDir, `${id}-${w}.avif`));
    await pipe.clone().webp({ quality: 80, effort: 6 }).toFile(join(outDir, `${id}-${w}.webp`));
  }
  console.log(`  ${id} (${brand}) .avif/.webp`);
}

console.log("done.");
