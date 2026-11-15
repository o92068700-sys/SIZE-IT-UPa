import { useCallback, useEffect, useState } from 'react';
import {
  clearScores,
  readScores,
  submitScore,
  type ScoreEntry,
} from '@/lib/leaderboard';

export function useLeaderboard() {
  const [scores, setScores] = useState<ScoreEntry[]>(readScores);

  useEffect(() => {
    const sync = () => setScores(readScores());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const addScore = useCallback((entry: Omit<ScoreEntry, 'id' | 'playedAt'>) => {
    const result = submitScore(entry);
    setScores(result.scores);
    return result.rank;
  }, []);

  const reset = useCallback(() => {
    setScores(clearScores());
  }, []);

  return { scores, addScore, reset };
}
