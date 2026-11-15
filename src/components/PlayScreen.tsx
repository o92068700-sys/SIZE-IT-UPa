import { ArrowRight, Lock, MoveDiagonal2, Trophy } from 'lucide-react';
import AnswerCard from '@/components/AnswerCard';
import AreaDuel from '@/components/AreaDuel';
import GameStage from '@/components/GameStage';
import { useLanguage } from '@/i18n/LanguageProvider';
import { isRoundLocked, type GameAction, type GameState } from '@/lib/gameReducer';
import type { GameObject } from '@/types/game';

type PlayingState = Extract<GameState, { phase: 'playing' }>;

interface PlayScreenProps {
  state: PlayingState;
  dispatch: (action: GameAction) => void;
}

export default function PlayScreen({ state, dispatch }: PlayScreenProps) {
  const { lang, t } = useLanguage();
  const challenge = state.rounds[state.index];
  const locked = isRoundLocked(state);
  const result = state.results[state.index];
  const isLastRound = state.index === state.rounds.length - 1;
  const isArea = challenge.target.unit === 'area';

  const primaryName = (object: GameObject) => (lang === 'ar' ? object.ar : object.en);
  const secondaryName = (object: GameObject) => (lang === 'ar' ? object.en : object.ar);
  const secondaryDir = lang === 'ar' ? 'ltr' : 'rtl';

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <GameStage
        key={challenge.id}
        challenge={challenge}
        estimateCm={state.estimateCm}
        zoomIndex={state.zoomIndex}
        result={result}
        onEstimateChange={(cm) => dispatch({ type: 'setEstimate', cm })}
        onZoomIn={() => dispatch({ type: 'zoomIn' })}
        onZoomOut={() => dispatch({ type: 'zoomOut' })}
      />

      {isArea && (
        <AreaDuel challenge={challenge} estimateCm={state.estimateCm} result={result} />
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-stage/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        {isArea ? (
          locked ? (
            <p className="max-w-md text-sm text-ink-muted">{t('areaLockedHint')}</p>
          ) : (
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-night/40 text-ink-muted">
                <MoveDiagonal2 size={18} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  {t('areaControlsTitle')}
                </p>
                <p className="text-sm text-ink">{t('areaControlsHint')}</p>
              </div>
            </div>
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-8">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 shrink-0 rounded-full bg-reference" />
              <div>
                <p className="text-xs font-medium text-ink-muted">{t('reference')}</p>
                <p className="font-semibold text-ink">{primaryName(challenge.reference)}</p>
                <p className="text-sm text-ink-muted" dir={secondaryDir}>
                  {secondaryName(challenge.reference)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 shrink-0 rounded-full bg-mystery" />
              <div>
                <p className="text-xs font-medium text-ink-muted">{t('mystery')}</p>
                <p className="font-semibold text-ink">{primaryName(challenge.target)}</p>
                <p className="text-sm text-ink-muted" dir={secondaryDir}>
                  {secondaryName(challenge.target)}
                </p>
                {!locked && <p className="mt-1 text-xs text-ink-muted">{t('eyeHint')}</p>}
              </div>
            </div>
          </div>
        )}

        {!locked && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'lockIn' })}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-action px-6 py-3 font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            <Lock size={18} />
            {t('lockIn')}
          </button>
        )}

        {locked && result && (
          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-end">
            <AnswerCard estimateCm={result.estimateCm} referenceCm={challenge.reference.cm} result={result} />
            <button
              type="button"
              onClick={() => dispatch({ type: 'next' })}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-action px-6 py-3 font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
            >
              {isLastRound ? (
                <Trophy size={18} />
              ) : (
                <ArrowRight size={18} className="rtl:rotate-180" />
              )}
              {isLastRound ? t('seeResults') : t('nextRound')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
