/** Server-side ceiling for an online room. Solo play uses the full field. */
export const MAX_ONLINE_ROUNDS = 200;

export const ZOOM_LEVELS = [0.25, 0.35, 0.5, 0.75, 1, 1.5, 2, 3] as const;
export const DEFAULT_ZOOM_INDEX = 4;

export const ACCURATE_ERROR = 0.2;
export const ZERO_SCORE_ERROR = 0.7;
export const MAX_ROUND_SCORE = 100;
