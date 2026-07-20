import sharp from "sharp";

/**
 * Erase isolated specks from an image's alpha channel.
 *
 * Editing objects out of the illustrations leaves stray pixels scattered
 * far from the figure. They render as unexplained dots on the canvas and
 * inflate crop bounds. Label connected components and drop everything
 * below minArea; each figure is one huge blob, so nothing real is at risk.
 *
 * The threshold is deliberately low (alpha > 8) so a speck's soft halo is
 * pulled into its own component and erased with it, rather than being left
 * behind as a faint ghost.
 */
export async function despeckle(src, minArea = 2000) {
  const { data, info } = await sharp(src)
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
