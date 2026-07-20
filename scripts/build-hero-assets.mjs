/**
 * Exports the hero subject from the 5504x3072 RGBA source into the
 * responsive AVIF/WebP set the site consumes.
 *
 * Run: node scripts/build-hero-assets.mjs [path-to-source]
 *
 * Rules from the brief, enforced here:
 *  - never upscale (source width is the ceiling)
 *  - transparency preserved; no background baked in
 *  - separate mobile crop framed from roughly the elbows up, so portrait
 *    viewports don't slice the hands
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const SRC =
  process.argv[2] ??
  "C:/Users/FOXsetup/Downloads/asmongold cartoon hero section (1).webp";

const outDir = join(process.cwd(), "public", "assets");
mkdirSync(outDir, { recursive: true });

const src = sharp(SRC);
const meta = await src.metadata();
console.log(`source: ${meta.width}x${meta.height} ${meta.format} alpha=${meta.hasAlpha}`);

/**
 * Erase isolated specks from the alpha channel.
 *
 * Editing the mic out of the artwork left ~4000 stray pixels scattered
 * from x=23 to x=5356, well outside the figure (which spans 663..5304).
 * They render as unexplained dots on the canvas and inflate the crop
 * bounds. Label connected components and drop everything below minArea;
 * the figure is one huge blob, so nothing real is at risk.
 *
 * Threshold is deliberately low (alpha > 8) so a speck's soft halo is
 * pulled into its own component and erased with it, rather than being
 * left behind as a faint ghost.
 */
async function despeckle(buf, minArea = 2000) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: ch } = info;
  const n = W * H;
  const A = (i) => data[i * ch + 3];

  const seen = new Uint8Array(n);
  const stack = new Int32Array(n);
  const comp = new Int32Array(n);
  let removedPx = 0;
  let removedComps = 0;
  let kept = 0;

  for (let i = 0; i < n; i++) {
    if (seen[i]) continue;
    if (A(i) <= 8) {
      seen[i] = 1;
      continue;
    }
    let sp = 0;
    let cn = 0;
    stack[sp++] = i;
    seen[i] = 1;
    while (sp) {
      const p = stack[--sp];
      comp[cn++] = p;
      const x = p % W;
      const y = (p / W) | 0;
      if (x > 0 && !seen[p - 1] && A(p - 1) > 8) { seen[p - 1] = 1; stack[sp++] = p - 1; }
      if (x < W - 1 && !seen[p + 1] && A(p + 1) > 8) { seen[p + 1] = 1; stack[sp++] = p + 1; }
      if (y > 0 && !seen[p - W] && A(p - W) > 8) { seen[p - W] = 1; stack[sp++] = p - W; }
      if (y < H - 1 && !seen[p + W] && A(p + W) > 8) { seen[p + W] = 1; stack[sp++] = p + W; }
    }
    if (cn < minArea) {
      for (let k = 0; k < cn; k++) data[comp[k] * ch + 3] = 0;
      removedPx += cn;
      removedComps++;
    } else {
      kept++;
    }
  }

  console.log(
    `despeckle: removed ${removedComps} blobs (${removedPx}px), kept ${kept} component(s)`,
  );
  return sharp(data, { raw: { width: W, height: H, channels: ch } })
    .png()
    .toBuffer();
}

const CLEAN = await despeckle(SRC);

/** Tight bounding box of non-transparent pixels, so crops are framed off
 *  the actual artwork rather than the canvas. */
const { info } = await sharp(CLEAN)
  .ensureAlpha()
  .trim({ threshold: 1 })
  .toBuffer({ resolveWithObject: true });
console.log(`trimmed content: ${info.width}x${info.height}`);

const encode = async (pipeline, base, width) => {
  const resized = pipeline.clone().resize({ width, withoutEnlargement: true });
  await resized
    .clone()
    .avif({ quality: 62, effort: 6 })
    .toFile(join(outDir, `${base}-${width}.avif`));
  await resized
    .clone()
    .webp({ quality: 82, effort: 6 })
    .toFile(join(outDir, `${base}-${width}.webp`));
  console.log(`  ${base}-${width} .avif/.webp`);
};

/* ---------- Desktop: full frame, 2560 + 1440 ---------- */
console.log("desktop:");
for (const w of [2560, 1440]) {
  await encode(sharp(CLEAN).ensureAlpha(), "hero-subject", w);
}

/* ---------- Mobile: elbows-up crop ---------- */
/* Source is 16:9, so a true 4:5 can never contain both elbows (they sit
   at roughly x=1180 and x=4400). Use a near-square frame instead: full
   height, centred on the face. Portrait viewports get a much larger
   figure without slicing the hands.

   Hands occupy x<1375 and x>4372 in the source. Framing between them
   excludes both cleanly — a hand sliced mid-palm reads as a mistake.
   The centre used to sit right of the face to keep the boom mic in
   shot; the mic is gone from the artwork, so it is back on the face. */
const CROP_H = meta.height; // 3072
const CROP_W = 2850;
const CENTER_X = 2780;
const left = Math.max(0, Math.min(meta.width - CROP_W, CENTER_X - Math.round(CROP_W / 2)));

console.log("mobile (elbows-up, near-square):");
const mobile = sharp(CLEAN)
  .ensureAlpha()
  .extract({ left, top: 0, width: CROP_W, height: CROP_H });
for (const w of [1080, 720]) {
  await encode(mobile, "hero-subject-mobile", w);
}

console.log("done.");
