import type { Lang } from '@/i18n/translations';
import type { MeasureUnit } from '@/types/game';

export function formatLength(cm: number, lang: Lang = 'en') {
  const metre = lang === 'ar' ? 'م' : 'm';
  const centimetre = lang === 'ar' ? 'سم' : 'cm';
  if (cm >= 100) return `${(cm / 100).toFixed(2)} ${metre}`;
  if (cm >= 10) return `${cm.toFixed(1)} ${centimetre}`;
  return `${cm.toFixed(2)} ${centimetre}`;
}

/**
 * Areas are stored in square kilometres. Large countries keep whole numbers;
 * small ones keep enough decimals to stay readable.
 */
export function formatArea(km2: number, lang: Lang = 'en') {
  const label = lang === 'ar' ? 'كم²' : 'km²';
  const digits = km2 >= 1000 ? 0 : km2 >= 10 ? 1 : 2;
  return `${km2.toLocaleString('en-US', { maximumFractionDigits: digits })} ${label}`;
}

export function formatMeasurement(value: number, unit: MeasureUnit = 'length', lang: Lang = 'en') {
  return unit === 'area' ? formatArea(value, lang) : formatLength(value, lang);
}

export function formatPoints(points: number) {
  return points.toLocaleString('en-US');
}

/** Returns the rounded error percentage, or null when the guess is exact. */
export function offByPercent(error: number): number | null {
  const percent = Math.round(error * 100);
  return percent === 0 ? null : percent;
}

export function formatShortDate(iso: string, lang: Lang = 'en') {
  try {
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return '';
  }
}
