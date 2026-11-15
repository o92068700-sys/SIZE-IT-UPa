import { Trash2, Trophy } from 'lucide-react';
import { useState } from 'react';
import { CATEGORIES } from '@/data/categories';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useLanguage } from '@/i18n/LanguageProvider';
import { formatPoints, formatShortDate } from '@/lib/format';
import type { CategoryId } from '@/types/game';

type Filter = 'all' | CategoryId;

export default function LeaderboardSection() {
  const { t, lang } = useLanguage();
  const { scores, reset } = useLeaderboard();
  const [filter, setFilter] = useState<Filter>('all');
  const [confirming, setConfirming] = useState(false);

  const filtered = filter === 'all' ? scores : scores.filter((entry) => entry.categoryId === filter);
  const categoryName = (id: CategoryId) => {
    const category = CATEGORIES.find((item) => item.id === id);
    if (!category) return id;
    return lang === 'ar' ? category.nameAr ?? category.name : category.name;
  };

  // The locally saved run is stored as "You"/"أنت"; keep it localized when the language changes.
  const displayName = (name: string) => (name === 'You' || name === 'أنت' ? t('leaderboardYou') : name);

  return (
    <section id="leaderboard" className="relative border-b border-line py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold text-ink sm:text-5xl">{t('leaderboardTitle')}</h2>
            <p className="mt-4 text-base leading-[1.7] text-ink-muted sm:text-lg">{t('leaderboardSubtitle')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label={t('leaderboardAll')} />
            {CATEGORIES.map((category) => (
              <FilterChip
                key={category.id}
                active={filter === category.id}
                onClick={() => setFilter(category.id)}
                label={lang === 'ar' ? category.nameAr ?? category.name : category.name}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-studio/70">
          {filtered.length === 0 ? (
            <div className="relative flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="absolute inset-0 bg-blueprint opacity-40" aria-hidden="true" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-line bg-night text-ink-muted">
                <Trophy size={22} />
              </span>
              <p className="relative mt-5 font-display text-xl font-bold text-paper">{t('leaderboardEmpty')}</p>
              <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">{t('leaderboardEmptyBody')}</p>
              <a
                href="#categories"
                className="relative mt-6 inline-flex items-center gap-2 rounded-lg bg-paper px-5 py-2.5 text-sm font-bold text-night transition hover:bg-white"
              >
                {t('leaderboardEmptyCta')}
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] font-medium text-ink-muted">
                    <th scope="col" className="w-10 px-3 py-3 text-start font-medium sm:w-14 sm:px-4">
                      {t('rank')}
                    </th>
                    <th scope="col" className="px-3 py-3 text-start font-medium">
                      {t('player')}
                    </th>
                    <th scope="col" className="hidden px-3 py-3 text-start font-medium sm:table-cell">
                      {t('categories')}
                    </th>
                    <th scope="col" className="hidden px-3 py-3 text-start font-medium sm:table-cell">
                      {t('accuracy')}
                    </th>
                    <th scope="col" className="hidden px-3 py-3 text-start font-medium sm:table-cell">
                      {t('date')}
                    </th>
                    <th scope="col" className="px-3 py-3 text-end font-medium sm:px-4">
                      {t('score')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry, index) => (
                    <tr key={entry.id} className="border-b border-line/60 last:border-0">
                      <td className="px-3 py-3 sm:px-4">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md font-display text-xs font-bold tabular-nums ${
                            index === 0
                              ? 'bg-paper text-night'
                              : index === 1
                                ? 'bg-paper/80 text-night'
                                : index === 2
                                  ? 'bg-paper/60 text-night'
                                  : 'border border-line text-ink-muted'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="max-w-[10rem] px-3 py-3 sm:max-w-[12rem]">
                        <span className="block truncate font-semibold text-paper">{displayName(entry.name)}</span>
                        <span className="mt-0.5 block truncate text-[11px] text-ink-muted sm:hidden">
                          {categoryName(entry.categoryId)} · {entry.accuracy}%
                        </span>
                      </td>
                      <td className="hidden px-3 py-3 text-ink-muted sm:table-cell">{categoryName(entry.categoryId)}</td>
                      <td className="hidden px-3 py-3 tabular-nums text-ink-muted sm:table-cell">{entry.accuracy}%</td>
                      <td className="hidden px-3 py-3 tabular-nums text-ink-muted sm:table-cell">{formatShortDate(entry.playedAt, lang)}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-end font-display font-bold tabular-nums text-paper sm:px-4">
                        {formatPoints(entry.score)}
                        <span className="ms-1 text-[10px] font-normal text-ink-muted">/ {formatPoints(entry.maxScore)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {scores.length > 0 && (
          <div className="mt-4 flex justify-end">
            {confirming ? (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-ink-muted">{t('clearConfirm')}</span>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setConfirming(false);
                  }}
                  className="rounded border border-onair/50 bg-onair/10 px-2.5 py-1 font-semibold text-onair"
                >
                  {t('confirmClear')}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded border border-line px-2.5 py-1 font-medium text-ink-muted"
                >
                  {t('cancel')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted transition hover:text-onair"
              >
                <Trash2 size={13} />
                {t('clearBoard')}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active ? 'border-paper/60 bg-paper text-night' : 'border-line text-ink-muted hover:border-ink-muted hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}
