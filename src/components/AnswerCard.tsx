import { useLanguage } from '@/i18n/LanguageProvider';
import { formatMeasurement, offByPercent } from '@/lib/format';
import { accuracyLevel } from '@/lib/scoring';
import type { RoundResult } from '@/types/game';

interface AnswerCardProps {
  estimateCm: number;
  referenceCm: number;
  result: RoundResult;
}

/** Reveal card — numbers are allowed only after lock. */
export default function AnswerCard({ estimateCm, referenceCm, result }: AnswerCardProps) {
  const { lang, dir, t } = useLanguage();
  const percent = offByPercent(result.relativeError);

  return (
    <div
      dir={dir}
      className="w-full max-w-sm rounded-xl border border-line bg-canvas/90 p-4 shadow-xl backdrop-blur sm:w-72"
    >
      <p className="flex items-baseline gap-1 tabular-nums">
        <span className="text-5xl font-bold leading-none text-amber-300">{result.score}</span>
        <span className="text-sm font-medium text-ink-muted">/ 100</span>
      </p>
      <dl className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">{t('yourGuess')}</dt>
          <dd className="font-semibold tabular-nums text-ink">{formatMeasurement(estimateCm, result.unit, lang)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">{result.unit === 'area' ? t('actualArea') : t('actualSize')}</dt>
          <dd className="font-semibold tabular-nums text-ink">{formatMeasurement(result.actualCm, result.unit, lang)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-muted">{t('reference')}</dt>
          <dd className="font-semibold tabular-nums text-ink">{formatMeasurement(referenceCm, result.unit, lang)}</dd>
        </div>
      </dl>
      <p className="mt-3 border-t border-line pt-3 text-xs font-medium text-ink-muted">
        {percent === null ? t('exact') : t('offBy', { percent })} · {t(accuracyLevel(result.relativeError))}
      </p>
    </div>
  );
}
