/**
 * Generates a thumbnail per article.
 *
 * Run: node scripts/build-article-art.mjs
 * Output: public/assets/articles/<slug>-{800,1400}.{avif,webp}
 *
 * Procedural and abstract on purpose. The articles are about specific
 * games and companies, and using their key art or logos would put
 * third-party IP on the site; these stay in the site's own gold/greige
 * palette so the whole set reads as one system.
 *
 * Each plate is keyed off its index, so no two compositions repeat while
 * the construction stays identical across the set.
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const W = 1400;
const H = 875; // 16:10, matching the featured card's aspect

const C = {
  canvas: "#d6d1c4",
  surface: "#cfcabc",
  ink: "#111111",
  gold: "#e6b31c",
  goldBright: "#f5ca3c",
  goldDeep: "#9e7508",
};

/** slug -> the word set across the plate */
const ARTICLES = [
  { slug: "what-asmongold-is-playing-2026", label: "PLAYING" },
  { slug: "asmongold-on-gta-6", label: "GTA 6" },
  { slug: "where-to-watch-asmongold", label: "CHANNELS" },
  { slug: "why-asmongold-left-otk", label: "OTK" },
];

function plate(label, i) {
  const angle = -18 + i * 11;
  const cx = 0.3 + (i % 3) * 0.2;
  const cy = 0.28 + ((i * 2) % 3) * 0.16;

  // Stripe bands sweep across at a per-article angle.
  const bands = Array.from({ length: 7 }, (_, k) => {
    const y = -H * 0.4 + k * (H * 0.26);
    const h = k % 2 === 0 ? H * 0.055 : H * 0.02;
    const o = 0.07 + ((k + i) % 3) * 0.035;
    return `<rect x="${-W * 0.4}" y="${y}" width="${W * 1.8}" height="${h}" fill="${C.goldDeep}" opacity="${o}"/>`;
  }).join("");

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${C.goldBright}"/>
        <stop offset="0.55" stop-color="${C.gold}"/>
        <stop offset="1" stop-color="${C.goldDeep}"/>
      </linearGradient>
      <radialGradient id="glow" cx="${cx}" cy="${cy}" r="0.75">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="vig" cx="0.5" cy="0.5" r="0.78">
        <stop offset="0.55" stop-color="${C.ink}" stop-opacity="0"/>
        <stop offset="1" stop-color="${C.ink}" stop-opacity="0.34"/>
      </radialGradient>
    </defs>

    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g transform="rotate(${angle} ${W / 2} ${H / 2})">${bands}</g>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>

    <text x="${W / 2}" y="${H / 2}" text-anchor="middle" dominant-baseline="central"
      font-family="Archivo, Helvetica Neue, Arial, sans-serif" font-weight="900"
      font-size="${H * 0.24}" letter-spacing="-4" fill="${C.ink}" opacity="0.9">${label}</text>

    <rect x="0" y="${H - 10}" width="${W}" height="10" fill="${C.ink}" opacity="0.85"/>
  </svg>`);
}

const outDir = join(process.cwd(), "public", "assets", "articles");
mkdirSync(outDir, { recursive: true });

let i = 0;
for (const a of ARTICLES) {
  const svg = plate(a.label, i++);
  for (const w of [1400, 800]) {
    const pipe = sharp(svg, { density: 200 }).resize({ width: w });
    await pipe.clone().avif({ quality: 58, effort: 6 }).toFile(join(outDir, `${a.slug}-${w}.avif`));
    await pipe.clone().webp({ quality: 80, effort: 6 }).toFile(join(outDir, `${a.slug}-${w}.webp`));
  }
  console.log(`  ${a.slug} (${a.label}) .avif/.webp`);
}
console.log("done.");
