import { contentAspect, type ImageContentFrame } from '@/lib/imageContent';
import type { GameObject, MeasureAxis } from '@/types/game';

export interface Dimensions {
  widthCm: number;
  heightCm: number;
}

export interface EstimateRange {
  min: number;
  max: number;
}

export interface MeasureSpan {
  start: number;
  end: number;
  fraction: number;
}

export interface Box {
  left: number;
  top: number;
  w: number;
  h: number;
}

/**
 * Wingspan ÷ body depth when no published ratio exists.
 * Used only as a fallback — never as a pose taken from the SVG frame.
 */
export const FALLBACK_WINGSPAN_ASPECT = 2.8;

/** Upright objects may not render wider than they are tall on the measured body. */
const MAX_HEIGHT_ASPECT = 1;

type GeometryObject = Pick<
  GameObject,
  'axis' | 'aspect' | 'aspectOverride' | 'measureStart' | 'measureEnd'
>;

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function measureSpan(object: Pick<GameObject, 'measureStart' | 'measureEnd'>): MeasureSpan {
  const start = clamp01(object.measureStart ?? 0);
  const end = clamp01(object.measureEnd ?? 1);
  const lo = Math.min(start, end);
  const hi = Math.max(start, end);
  const fraction = Math.max(0.15, hi - lo);
  return { start: lo, end: lo + fraction > 1 ? 1 : lo + fraction, fraction };
}

/**
 * Published display aspect when present; otherwise art — except wingspan,
 * which never takes its ratio from the SVG pose.
 */
export function resolveDisplayAspect(object: GeometryObject, frame: ImageContentFrame | null): number {
  if (object.aspectOverride && object.aspectOverride > 0) return object.aspectOverride;
  if (object.axis === 'wingspan') return FALLBACK_WINGSPAN_ASPECT;
  if (frame) {
    const art = contentAspect(frame);
    if (art > 0) return art;
  }
  return object.aspect > 0 ? object.aspect : 1;
}

/**
 * Bounding box of the full silhouette in centimetres.
 * The measured span (object.cm) maps to `fraction` of the measured axis.
 */
export function boxDimensionsForAxis(
  axis: MeasureAxis,
  aspect: number,
  measuredCm: number,
  fraction = 1,
  coverage = 1,
): Dimensions {
  const safeCm = Math.max(0.01, measuredCm);
  const safeFraction = Math.min(1, Math.max(0.15, fraction));
  const safeAspect = aspect > 0 ? aspect : 1;

  if (axis === 'area') {
    // `measuredCm` is square kilometres. Keep the painted area — not the
    // bounding box — proportional to it, so islands and concave coastlines
    // compare honestly. Width/height are linear equivalents (km).
    const safeCoverage = Math.min(1, Math.max(0.05, coverage));
    const paintedArea = safeCm / safeFraction;
    const boxArea = paintedArea / safeCoverage;
    const widthCm = Math.sqrt(boxArea * safeAspect);
    const heightCm = Math.sqrt(boxArea / safeAspect);
    return { widthCm, heightCm };
  }

  if (axis === 'height') {
    const heightCm = safeCm / safeFraction;
    const widthCm = safeCm * Math.min(safeAspect, MAX_HEIGHT_ASPECT);
    return { widthCm, heightCm };
  }

  if (axis === 'diameter') {
    const size = safeCm / safeFraction;
    return { widthCm: size, heightCm: size };
  }

  // length, wingspan, width — measured axis is horizontal
  const widthCm = safeCm / safeFraction;
  const heightCm = safeCm / safeAspect;
  return { widthCm, heightCm };
}

export function dimensionsForAxis(axis: MeasureAxis, aspect: number, measuredCm: number): Dimensions {
  return boxDimensionsForAxis(axis, aspect, measuredCm, 1);
}

export function dimensionsCm(
  object: Pick<GameObject, 'axis' | 'aspect'>,
  measuredCm: number,
): Dimensions {
  return dimensionsForAxis(object.axis, object.aspect, measuredCm);
}

export function visualDimensionsCm(
  object: GeometryObject,
  measuredCm: number,
  frame: ImageContentFrame | null,
): Dimensions {
  const { fraction } = measureSpan(object);
  const aspect = resolveDisplayAspect(object, frame);
  return boxDimensionsForAxis(object.axis, aspect, measuredCm, fraction, frame?.coverage ?? 1);
}

/** Pixel length of the compared span (the honest ruler). */
export function measuredSpanPx(object: GeometryObject, box: Pick<Box, 'w' | 'h'>): number {
  const { fraction } = measureSpan(object);
  return (isVerticalAxis(object.axis) ? box.h : box.w) * fraction;
}

export function isVerticalAxis(axis: MeasureAxis) {
  return axis === 'height';
}

export function isHorizontalAxis(axis: MeasureAxis) {
  return axis === 'length' || axis === 'wingspan' || axis === 'width' || axis === 'diameter';
}

/** Sub-rectangle of the silhouette that the unitless bracket should mark. */
export function measuredBox(object: GeometryObject, box: Box): Box {
  const { start, end } = measureSpan(object);
  if (isVerticalAxis(object.axis)) {
    const height = box.h * (end - start);
    const top = box.top + box.h * (1 - end);
    return { left: box.left, top, w: box.w, h: height };
  }
  return {
    left: box.left + box.w * start,
    top: box.top,
    w: box.w * (end - start),
    h: box.h,
  };
}

export function estimateRange(actualCm: number): EstimateRange {
  return { min: actualCm / 10, max: actualCm * 10 };
}

export function clampToRange(value: number, range: EstimateRange) {
  return Math.min(range.max, Math.max(range.min, value));
}
