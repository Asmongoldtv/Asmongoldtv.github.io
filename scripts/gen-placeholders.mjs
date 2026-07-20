/**
 * Generates the placeholder assets the site still needs.
 * Run: node scripts/gen-placeholders.mjs
 *
 * Styled to the light greige/gold system so the build reads as
 * intentional until the real artwork lands. The hero is NOT here — it
 * uses the real illustration via scripts/build-hero-assets.mjs.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { join } from "node:path";

const C = {
  canvas: "#d6d1c4",
  surface: "#cfcabc",
  elevated: "#e2ded4",
  ink: "#111111",
  muted: "#5a564e",
  gold: "#e6b31c",
  goldDeep: "#9e7508",
};

const pub = join(process.cwd(), "public");
const assets = join(pub, "assets");
const thumbs = join(assets, "thumbs");
mkdirSync(thumbs, { recursive: true });

/* ---------- Favicon: gold tile, ink monogram ---------- */
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="${C.gold}"/>
  <path d="M9 24 L16 8 L23 24 M12.2 19h7.6" stroke="${C.ink}" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
writeFileSync(join(pub, "favicon.svg"), favicon);

/* ---------- Thumbnails ---------- */
const thumb = (label, i = 0, w = 480, h = 270) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.surface}"/>
      <stop offset="1" stop-color="${C.elevated}"/>
    </linearGradient>
    <radialGradient id="a" cx="${0.2 + (i % 4) * 0.16}" cy="0.25" r="0.85">
      <stop offset="0" stop-color="${C.gold}" stop-opacity="${0.5 - (i % 4) * 0.07}"/>
      <stop offset="1" stop-color="${C.gold}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#a)"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="none" stroke="${C.goldDeep}" stroke-opacity="0.3" stroke-width="2"/>
  <text x="${w / 2}" y="${h / 2 + h / 14}" text-anchor="middle" font-family="Archivo, Helvetica, sans-serif" font-weight="800" font-size="${h / 5}" fill="${C.ink}" opacity="0.55">${label}</text>
</svg>`;

for (let i = 1; i <= 6; i++)
  writeFileSync(join(thumbs, `video-${i}.svg`), thumb(`▶ ${String(i).padStart(2, "0")}`, i));
for (let i = 1; i <= 5; i++)
  writeFileSync(join(thumbs, `vod-${i}.svg`), thumb(`VOD ${String(i).padStart(2, "0")}`, i));
writeFileSync(join(thumbs, "news-featured.svg"), thumb("NEWS", 1, 960, 600));
for (let i = 2; i <= 4; i++)
  writeFileSync(join(thumbs, `news-${i}.svg`), thumb(`N${i}`, i, 400, 300));

/* ---------- og.png: valid minimal 1200x630 canvas-coloured PNG ---------- */
function solidPng(w, h, r, g, b) {
  const raw = Buffer.alloc(h * (w * 3 + 1));
  for (let y = 0; y < h; y++) {
    const row = y * (w * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < w; x++) {
      raw[row + 1 + x * 3] = r;
      raw[row + 2 + x * 3] = g;
      raw[row + 3 + x * 3] = b;
    }
  }
  const crcTable = [...Array(256)].map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const cc = Buffer.alloc(4);
    cc.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, cc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
writeFileSync(join(pub, "og.png"), solidPng(1200, 630, 0xd6, 0xd1, 0xc4));

console.log("Placeholder assets written to public/");
