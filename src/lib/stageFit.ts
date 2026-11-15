import type { Dimensions } from '@/lib/geometry';

export interface StagePadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
  gap: number;
}

/** Reserved chrome around the pair: captions, zoom, brackets, ground line. */
export const PLAY_STAGE_PADDING: StagePadding = {
  top: 56,
  right: 88,
  bottom: 44,
  left: 24,
  gap: 48,
};

export const REVEAL_STAGE_PADDING: StagePadding = {
  top: 72,
  right: 24,
  left: 24,
  bottom: 56,
  gap: 36,
};

export const DESKTOP_STAGE = { width: 1104, height: 520 };
export const MOBILE_STAGE = { width: 360, height: 400 };

/**
 * One px/cm for a pair (and optional extra silhouettes) so both actual sizes
 * fit inside the safe stage. Extreme ratios shrink both objects.
 */
export function pairScalePxPerCm(
  stageWidth: number,
  stageHeight: number,
  reference: Dimensions,
  target: Dimensions,
  padding: StagePadding = PLAY_STAGE_PADDING,
  extras: Dimensions[] = [],
): number {
  if (stageWidth <= 0 || stageHeight <= 0) return 0;

  const safeWidth = Math.max(80, stageWidth - padding.left - padding.right);
  const safeHeight = Math.max(80, stageHeight - padding.top - padding.bottom);
  const targetWidth = Math.max(target.widthCm, ...extras.map((item) => item.widthCm));
  const targetHeight = Math.max(target.heightCm, ...extras.map((item) => item.heightCm));

  const widthScale = (safeWidth - padding.gap) / (reference.widthCm + targetWidth);
  const heightScale = safeHeight / Math.max(reference.heightCm, targetHeight);
  const scale = Math.min(widthScale, heightScale);
  return Number.isFinite(scale) && scale > 0 ? scale : 0;
}

export function groundY(stageHeight: number, padding: StagePadding = PLAY_STAGE_PADDING) {
  return stageHeight - padding.bottom;
}

export function referenceCenterX(
  stageWidth: number,
  referenceWidthPx: number,
  padding: StagePadding = PLAY_STAGE_PADDING,
) {
  return padding.left + referenceWidthPx / 2;
}

export function targetCenterX(
  stageWidth: number,
  targetWidthPx: number,
  padding: StagePadding = PLAY_STAGE_PADDING,
) {
  return stageWidth - padding.right - targetWidthPx / 2;
}
