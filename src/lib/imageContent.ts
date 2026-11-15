/**
 * Visible-content frame of an object image.
 *
 * Many assets are square SVGs with transparent padding. Layout must use the
 * opaque drawing, not the full canvas, or long animals look smaller than
 * stocky ones with the same real-world length.
 */
export interface ImageContentFrame {
  imageWidth: number;
  imageHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /**
   * Centre of the painted edge, 0..1 inside the content frame. A bounding-box
   * corner is often transparent for curved silhouettes, so a resize grip that
   * uses the corner can float in empty space. These anchors sit on the shape.
   */
  rightAnchor?: number;
  leftAnchor?: number;
  topAnchor?: number;
  bottomAnchor?: number;
  /**
   * Share of the content frame that is actually painted, 0..1. Area-based
   * measurements divide by this value so the visible painted area — not the
   * rectangular bounding box — matches the real measurement. Island nations
   * and concave coastlines would otherwise look too large.
   */
  coverage?: number;
}

const ALPHA_THRESHOLD = 12;
const SCAN_MAX_SIDE = 256;

export function fullImageFrame(imageWidth: number, imageHeight: number): ImageContentFrame {
  return {
    imageWidth: Math.max(1, imageWidth),
    imageHeight: Math.max(1, imageHeight),
    x: 0,
    y: 0,
    width: Math.max(1, imageWidth),
    height: Math.max(1, imageHeight),
    coverage: 1,
  };
}

export function contentAspect(frame: ImageContentFrame): number {
  return frame.width / Math.max(1, frame.height);
}

export function measureOpaqueBounds(image: HTMLImageElement): ImageContentFrame {
  const naturalW = Math.max(1, image.naturalWidth);
  const naturalH = Math.max(1, image.naturalHeight);
  const fallback = fullImageFrame(naturalW, naturalH);

  const scale = Math.min(1, SCAN_MAX_SIDE / Math.max(naturalW, naturalH));
  const w = Math.max(1, Math.round(naturalW * scale));
  const h = Math.max(1, Math.round(naturalH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return fallback;

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(image, 0, 0, w, h);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return fallback;
  }

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  let opaqueCount = 0;

  for (let y = 0; y < h; y += 1) {
    const row = y * w;
    for (let x = 0; x < w; x += 1) {
      if (data[(row + x) * 4 + 3] > ALPHA_THRESHOLD) {
        opaqueCount += 1;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return fallback;

  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const opaque = (x: number, y: number) => data[(y * w + x) * 4 + 3] > ALPHA_THRESHOLD;

  /** Midpoint of the longest painted run along one edge, normalised to the content frame. */
  const edgeAnchor = (
    from: number,
    to: number,
    isOpaque: (index: number) => boolean,
    origin: number,
    length: number,
  ) => {
    let bestStart = -1;
    let bestEnd = -1;
    let runStart = -1;
    for (let index = from; index <= to; index += 1) {
      if (isOpaque(index) && runStart < 0) runStart = index;
      const last = index === to;
      if (runStart >= 0 && (!isOpaque(index) || last)) {
        const runEnd = isOpaque(index) && last ? index : index - 1;
        if (runEnd - runStart > bestEnd - bestStart) {
          bestStart = runStart;
          bestEnd = runEnd;
        }
        runStart = -1;
      }
    }
    if (bestStart < 0) return 0.5;
    return ((bestStart + bestEnd) / 2 - origin) / Math.max(1, length - 1);
  };

  const rightAnchor = edgeAnchor(minY, maxY, (y) => opaque(maxX, y), minY, contentH);
  const leftAnchor = edgeAnchor(minY, maxY, (y) => opaque(minX, y), minY, contentH);
  const topAnchor = edgeAnchor(minX, maxX, (x) => opaque(x, minY), minX, contentW);
  const bottomAnchor = edgeAnchor(minX, maxX, (x) => opaque(x, maxY), minX, contentW);

  const inv = 1 / scale;
  return {
    imageWidth: naturalW,
    imageHeight: naturalH,
    x: minX * inv,
    y: minY * inv,
    width: contentW * inv,
    height: contentH * inv,
    coverage: Math.min(1, Math.max(0.05, opaqueCount / Math.max(1, contentW * contentH))),
    rightAnchor,
    leftAnchor,
    topAnchor,
    bottomAnchor,
  };
}
