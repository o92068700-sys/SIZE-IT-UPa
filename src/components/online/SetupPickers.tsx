import { Check, Clock3, Timer } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import { useLanguage } from '@/i18n/LanguageProvider';
import { onlineRoundCount } from '@/lib/online';
import type { CategoryId } from '@/types/game';

const SECONDS_OPTIONS = [5, 10, 20] as const;

interface CategoryPickerProps {
  value: CategoryId;
  onChange: (categoryId: CategoryId) => void;
  disabled?: boolean;
}

export function CategoryPicker({ value, onChange, disabled = false }: CategoryPickerProps) {
  const { t, lang } = useLanguage();

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const selected = category.id === value;
        const name = lang === 'ar' ? category.nameAr ?? category.name : category.name;
        const rounds = onlineRoundCount(category.id);

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            disabled={disabled}
            aria-pressed={selected}
            className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border p-3 text-start transition disabled:cursor-not-allowed disabled:opacity-60 ${
              selected
                ? 'border-reference bg-reference/10 shadow-[0_0_0_1px_rgba(91,140,255,0.35)]'
                : 'border-line bg-night/40 hover:border-paper/30'
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                selected ? 'border-reference/40 bg-reference/15 text-reference' : 'border-line text-ink-muted'
              }`}
            >
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-sm font-bold text-ink">{name}</span>
              <span className="mt-0.5 block text-[11px] text-ink-muted">
                {t('onlineRoundsLabel', { count: rounds })}
              </span>
            </span>
            {selected && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-reference text-night">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface SecondsPickerProps {
  value: number;
  onChange: (seconds: number) => void;
  disabled?: boolean;
}

export function SecondsPicker({ value, onChange, disabled = false }: SecondsPickerProps) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {SECONDS_OPTIONS.map((seconds) => {
          const selected = value === seconds;
          return (
            <button
              key={seconds}
              type="button"
              onClick={() => onChange(seconds)}
              disabled={disabled}
              aria-pressed={selected}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                selected
                  ? 'border-reference bg-reference/10 text-ink'
                  : 'border-line bg-night/40 text-ink-muted hover:border-paper/30 hover:text-ink'
              }`}
            >
              <span className="font-display text-lg font-extrabold tabular-nums">{seconds}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {t('onlineUnitSeconds')}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-muted">
        <Clock3 size={12} className="mt-0.5 shrink-0" />
        {t('onlineSecondsHint')}
      </p>
    </div>
  );
}

interface RoundSummaryProps {
  categoryId: CategoryId;
  seconds: number;
  revealSeconds?: number;
}

export function RoundSummary({ categoryId, seconds, revealSeconds = 5 }: RoundSummaryProps) {
  const { t } = useLanguage();
  const rounds = onlineRoundCount(categoryId);

  return (
    <div className="grid gap-2 rounded-xl border border-line bg-night/40 p-3 text-xs text-ink-muted sm:grid-cols-3">
      <span className="flex items-center gap-1.5">
        <Timer size={13} className="text-reference" />
        {t('onlineRoundsLabel', { count: rounds })}
      </span>
      <span className="flex items-center gap-1.5">
        <Clock3 size={13} className="text-reference" />
        {seconds} {t('onlineUnitSeconds')}
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-mystery" aria-hidden="true" />
        {t('onlineAutoReveal', { seconds: revealSeconds })}
      </span>
    </div>
  );
}
