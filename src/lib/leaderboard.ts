import type { CategoryId } from '@/types/game';

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  accuracy: number;
  categoryId: CategoryId;
  playedAt: string;
}

export const LEADERBOARD_LIMIT = 10;
const STORAGE_KEY = 'scale-clash:leaderboard:v1';

function isScoreEntry(value: unknown): value is ScoreEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<ScoreEntry>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.score === 'number' &&
    typeof entry.maxScore === 'number' &&
    typeof entry.accuracy === 'number' &&
    typeof entry.categoryId === 'string' &&
    typeof entry.playedAt === 'string'
  );
}

export function readScores(): ScoreEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isScoreEntry)
      .sort((a, b) => b.score - a.score || a.playedAt.localeCompare(b.playedAt))
      .slice(0, LEADERBOARD_LIMIT);
  } catch {
    return [];
  }
}

function writeScores(scores: ScoreEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // Storage may be unavailable (private mode, quota). The game still works.
  }
}

export function qualifiesForBoard(score: number, scores = readScores()) {
  if (score <= 0) return false;
  if (scores.length < LEADERBOARD_LIMIT) return true;
  return score > scores[scores.length - 1].score;
}

export function submitScore(entry: Omit<ScoreEntry, 'id' | 'playedAt'>) {
  const scores = readScores();
  const record: ScoreEntry = {
    ...entry,
    name: entry.name.trim().slice(0, 20) || 'Player',
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    playedAt: new Date().toISOString(),
  };
  const next = [...scores, record]
    .sort((a, b) => b.score - a.score || a.playedAt.localeCompare(b.playedAt))
    .slice(0, LEADERBOARD_LIMIT);
  writeScores(next);
  const rank = next.findIndex((item) => item.id === record.id) + 1;
  return { scores: next, rank: rank === 0 ? null : rank };
}

export function clearScores() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage access errors.
  }
  return [];
}

export function bestScore(scores: ScoreEntry[], categoryId?: CategoryId) {
  const relevant = categoryId ? scores.filter((entry) => entry.categoryId === categoryId) : scores;
  return relevant.reduce((best, entry) => Math.max(best, entry.score), 0);
}
