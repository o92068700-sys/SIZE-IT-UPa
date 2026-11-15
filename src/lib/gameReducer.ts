import { clampToRange, estimateRange } from '@/lib/geometry';
import { DEFAULT_ZOOM_INDEX, ZOOM_LEVELS } from '@/lib/gameConfig';
import { relativeError, roundScore } from '@/lib/scoring';
import type { CategoryId, Challenge, RoundResult } from '@/types/game';

export type GameState =
  | { phase: 'select' }
  | {
      phase: 'playing';
      categoryId: CategoryId;
      rounds: Challenge[];
      index: number;
      estimateCm: number;
      zoomIndex: number;
      results: RoundResult[];
    }
  | { phase: 'results'; categoryId: CategoryId; results: RoundResult[] };

export type GameAction =
  | { type: 'start'; categoryId: CategoryId; rounds: Challenge[] }
  | { type: 'setEstimate'; cm: number }
  | { type: 'zoomIn' }
  | { type: 'zoomOut' }
  | { type: 'lockIn' }
  | { type: 'next' }
  | { type: 'exit' };

export const initialGameState: GameState = { phase: 'select' };

function startingEstimate(challenge: Challenge) {
  // The wrong-footed spawn is baked into every dealt challenge. Rounds stored
  // by online rooms created before it keep the old neutral opening.
  return clampToRange(
    challenge.startCm ?? challenge.reference.cm,
    estimateRange(challenge.target.cm),
  );
}

export function isRoundLocked(state: Extract<GameState, { phase: 'playing' }>) {
  return state.results.length > state.index;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'exit') return { phase: 'select' };

  if (action.type === 'start') {
    const rounds = action.rounds;
    if (!rounds.length) return state;
    return {
      phase: 'playing',
      categoryId: action.categoryId,
      rounds,
      index: 0,
      estimateCm: startingEstimate(rounds[0]),
      zoomIndex: DEFAULT_ZOOM_INDEX,
      results: [],
    };
  }

  if (state.phase !== 'playing') return state;
  const locked = isRoundLocked(state);
  const challenge = state.rounds[state.index];

  switch (action.type) {
    case 'setEstimate':
      if (locked) return state;
      return {
        ...state,
        estimateCm: clampToRange(action.cm, estimateRange(challenge.target.cm)),
      };
    case 'zoomIn':
      return { ...state, zoomIndex: Math.min(ZOOM_LEVELS.length - 1, state.zoomIndex + 1) };
    case 'zoomOut':
      return { ...state, zoomIndex: Math.max(0, state.zoomIndex - 1) };
    case 'lockIn': {
      if (locked) return state;
      const error = relativeError(state.estimateCm, challenge.target.cm);
      const result: RoundResult = {
        challengeId: challenge.id,
        estimateCm: state.estimateCm,
        actualCm: challenge.target.cm,
        relativeError: error,
        score: roundScore(error),
        unit: challenge.target.unit ?? 'length',
      };
      return { ...state, results: [...state.results, result] };
    }
    case 'next': {
      if (!locked) return state;
      const nextIndex = state.index + 1;
      if (nextIndex >= state.rounds.length) {
        return { phase: 'results', categoryId: state.categoryId, results: state.results };
      }
      return {
        ...state,
        index: nextIndex,
        estimateCm: startingEstimate(state.rounds[nextIndex]),
      };
    }
    default:
      return state;
  }
}
