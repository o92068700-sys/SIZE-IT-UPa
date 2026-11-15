/**
 * The ruler is logarithmic: equal drag distance multiplies the guess by the
 * same factor. That is the only way a 25 cm cat and an 828 m tower can share
 * one honest control.
 */
export const RULER_MIN_CM = 1;
export const RULER_MAX_CM = 100_000; // 1 km
export const RULER_DECADES = 5;

const LOG_SPAN = Math.log10(RULER_MAX_CM / RULER_MIN_CM);

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** 0 = 1 cm, 1 = 1 km. */
export function cmToRatio(cm: number) {
  const safe = Math.min(RULER_MAX_CM, Math.max(RULER_MIN_CM, cm));
  return Math.log10(safe / RULER_MIN_CM) / LOG_SPAN;
}

export function ratioToCm(ratio: number) {
  return RULER_MIN_CM * 10 ** (clamp01(ratio) * LOG_SPAN);
}

/** Multiply / divide the guess by a factor, staying inside the ruler. */
export function nudgeCm(cm: number, factor: number) {
  return Math.min(RULER_MAX_CM, Math.max(RULER_MIN_CM, cm * factor));
}

export interface RulerTick {
  cm: number;
  ratio: number;
  major: boolean;
}

/** Major ticks at every decade, minor ticks at 2…9 of each decade. */
export function buildRulerTicks(): RulerTick[] {
  const ticks: RulerTick[] = [];
  for (let decade = 0; decade < RULER_DECADES; decade += 1) {
    for (let step = 1; step <= 9; step += 1) {
      const cm = step * 10 ** decade;
      ticks.push({ cm, ratio: cmToRatio(cm), major: step === 1 });
    }
  }
  ticks.push({ cm: RULER_MAX_CM, ratio: 1, major: true });
  return ticks;
}

export const RULER_TICKS = buildRulerTicks();

/** Quick-jump stops shown as chips under the ruler. */
export const RULER_JUMPS = [10, 100, 1_000, 10_000, 100_000] as const;
