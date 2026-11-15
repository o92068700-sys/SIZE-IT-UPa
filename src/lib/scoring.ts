import { ACCURATE_ERROR, MAX_ROUND_SCORE, ZERO_SCORE_ERROR } from '@/lib/gameConfig';

export type AccuracyLevel = 'spotOn' | 'close' | 'off' | 'wayOff';

export function relativeError(estimateCm: number, actualCm: number) {
  return Math.abs(estimateCm - actualCm) / actualCm;
}

export function roundScore(error: number) {
  return Math.round(MAX_ROUND_SCORE * Math.max(0, 1 - error / ZERO_SCORE_ERROR));
}

export function isAccurate(error: number) {
  return error <= ACCURATE_ERROR;
}

export function accuracyLevel(error: number): AccuracyLevel {
  if (error <= 0.1) return 'spotOn';
  if (error <= ACCURATE_ERROR) return 'close';
  if (error <= 0.5) return 'off';
  return 'wayOff';
}
