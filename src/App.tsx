import { useEffect, useReducer, useRef, useState } from 'react';
import OnlineScreen from '@/components/online/OnlineScreen';
import PlayScreen from '@/components/PlayScreen';
import ResultsView from '@/components/ResultsView';
import TopNav from '@/components/TopNav';
import LandingPage from '@/components/landing/LandingPage';
import { useLanguage } from '@/i18n/LanguageProvider';
import { dealChallenges, getCategory } from '@/lib/challenges';
import { MAX_ROUND_SCORE } from '@/lib/gameConfig';
import { gameReducer, initialGameState } from '@/lib/gameReducer';
import { submitScore } from '@/lib/leaderboard';
import { roomCodeFromUrl } from '@/lib/online';
import { isAccurate } from '@/lib/scoring';
import type { CategoryId } from '@/types/game';

type Screen = 'solo' | 'online';

function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [screen, setScreen] = useState<Screen>(() => (roomCodeFromUrl() ? 'online' : 'solo'));
  const { t, lang } = useLanguage();
  const runIdRef = useRef(0);
  const savedRunRef = useRef(-1);

  useEffect(() => {
    if (state.phase !== 'select') window.scrollTo({ top: 0, behavior: 'auto' });
  }, [state.phase]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [screen]);

  // Record the finished run on the local board. Gameplay and scoring are untouched.
  useEffect(() => {
    if (state.phase !== 'results') return;
    if (savedRunRef.current === runIdRef.current) return;
    savedRunRef.current = runIdRef.current;

    const accurate = state.results.filter((result) => isAccurate(result.relativeError)).length;
    submitScore({
      name: t('leaderboardYou'),
      score: state.results.reduce((sum, result) => sum + result.score, 0),
      maxScore: MAX_ROUND_SCORE * state.results.length,
      accuracy: state.results.length ? Math.round((accurate / state.results.length) * 100) : 0,
      categoryId: state.categoryId,
    });
  }, [state, t]);

  const startCategory = (categoryId: CategoryId) => {
    runIdRef.current += 1;
    dispatch({
      type: 'start',
      categoryId,
      rounds: dealChallenges(categoryId),
    });
  };

  const exitToCategories = () => dispatch({ type: 'exit' });

  const totalScore = (results: { score: number }[]) =>
    results.reduce((sum, result) => sum + result.score, 0);

  const category = state.phase === 'select' ? null : getCategory(state.categoryId);
  const categoryName = category ? (lang === 'ar' ? category.nameAr ?? category.name : category.name) : '';

  if (screen === 'online') {
    return <OnlineScreen onExit={() => setScreen('solo')} />;
  }

  return (
    <div className="min-h-screen bg-night text-ink">
      {state.phase === 'select' && (
        <>
          <TopNav showSections onOnline={() => setScreen('online')} />
          <LandingPage onSelect={startCategory} onOnline={() => setScreen('online')} />
        </>
      )}

      {state.phase === 'playing' && (
        <>
          <TopNav
            roundLabel={t('round', { current: state.index + 1, total: state.rounds.length })}
            score={totalScore(state.results)}
            onExit={exitToCategories}
          />
          <PlayScreen state={state} dispatch={dispatch} />
        </>
      )}

      {state.phase === 'results' && (
        <>
          <TopNav score={totalScore(state.results)} onExit={exitToCategories} />
          <ResultsView
            categoryName={categoryName}
            results={state.results}
            onPlayAgain={() => startCategory(state.categoryId)}
            onChangeCategory={exitToCategories}
          />
        </>
      )}
    </div>
  );
}

export default App;
