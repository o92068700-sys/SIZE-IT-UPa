import { RotateCcw, LayoutGrid } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { formatMeasurement, formatPoints } from '@/lib/format';
import { MAX_ROUND_SCORE } from '@/lib/gameConfig';
import { isAccurate } from '@/lib/scoring';
import type { RoundResult } from '@/types/game';

interface ResultsViewProps {
  categoryName: string;
  results: RoundResult[];
  onPlayAgain: () => void;
  onChangeCategory: () => void;
}

export default function ResultsView({ categoryName, results, onPlayAgain, onChangeCategory }: ResultsViewProps) {
  const { lang, t } = useLanguage();
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  const accurateCount = results.filter((result) => isAccurate(result.relativeError)).length;
  const accuracy = results.length ? Math.round((accurateCount / results.length) * 100) : 0;
  const averageError = results.length
    ? Math.round((results.reduce((sum, result) => sum + result.relativeError, 0) / results.length) * 100)
    : 0;
  const maxScore = MAX_ROUND_SCORE * results.length;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-3xl border border-line bg-stage p-6 text-center shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-action">{t('roundComplete')}</p>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">{categoryName}</h1>

        <p className="mt-8 text-sm font-medium text-ink-muted">{t('totalScore')}</p>
        <p className="mt-2 animate-fade-up text-6xl font-bold tabular-nums text-ink sm:text-7xl">
          {formatPoints(totalScore)}
        </p>
        <p className="mt-2 text-sm text-ink-muted">{t('outOf', { max: formatPoints(maxScore) })}</p>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SummaryStat
            label={t('accuracy')}
            value={`${accuracy}%`}
            hint={t('accuracyHint', { count: accurateCount, total: results.length })}
          />
          <SummaryStat label={t('averageError')} value={`${averageError}%`} />
          <SummaryStat label={t('challenges')} value={String(results.length)} />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2" aria-label={t('roundResults')}>
          {results.map((result, index) => (
            <span
              key={result.challengeId}
              title={t('roundTooltip', {
                round: index + 1,
                estimate: formatMeasurement(result.estimateCm, result.unit, lang),
                actual: formatMeasurement(result.actualCm, result.unit, lang),
              })}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold tabular-nums ${
                isAccurate(result.relativeError) ? 'bg-reference/20 text-reference' : 'bg-mystery/15 text-mystery'
              }`}
            >
              {index + 1}
            </span>
          ))}
        </div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-action px-6 py-3 text-sm font-bold text-canvas transition hover:-translate-y-0.5 hover:brightness-110"
          >
            <RotateCcw size={18} />
            {t('playAgain')}
          </button>
          <button
            type="button"
            onClick={onChangeCategory}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink-muted"
          >
            <LayoutGrid size={18} />
            {t('chooseCategory')}
          </button>
        </div>
      </div>
    </section>
  );
}

function SummaryStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-canvas/60 p-4">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
