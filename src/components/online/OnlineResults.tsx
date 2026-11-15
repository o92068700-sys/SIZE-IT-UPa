import { Crown, Loader2, Medal, RotateCcw, Sparkles, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import { CategoryPicker, SecondsPicker } from '@/components/online/SetupPickers';
import PlayerAvatar from '@/components/online/PlayerAvatar';
import { playerColor } from '@/lib/playerColor';
import { CATEGORIES } from '@/data/categories';
import { useLanguage } from '@/i18n/LanguageProvider';
import { formatMeasurement, formatPoints } from '@/lib/format';
import { ACCURATE_ERROR } from '@/lib/gameConfig';
import type { CategoryId } from '@/types/game';
import type { Room, RoomAnswer, RoomPlayer, RoomSubmission } from '@/types/online';

interface OnlineResultsProps {
  room: Room;
  players: RoomPlayer[];
  submissions: RoomSubmission[];
  answers: RoomAnswer[];
  myPlayerId: string;
  isHost: boolean;
  busy: boolean;
  onRematch: (categoryId: CategoryId, seconds: number) => void;
  onLeave: () => void;
}

const PODIUM = ['#F5B942', '#C9D1E0', '#C98B5A'];

function scoreColor(score: number) {
  if (score >= 80) return '#53FC18';
  if (score >= 50) return '#F5B942';
  return '#FF3D3D';
}

export default function OnlineResults({
  room,
  players,
  submissions,
  answers,
  myPlayerId,
  isHost,
  busy,
  onRematch,
  onLeave,
}: OnlineResultsProps) {
  const { lang, t } = useLanguage();
  const unitFor = (round: number) => room.rounds[round]?.target.unit ?? 'length';
  const [categoryId, setCategoryId] = useState<CategoryId>(() => {
    const match = CATEGORIES.find((category) => category.id === room.category_id);
    return (match?.id ?? CATEGORIES[0].id) as CategoryId;
  });
  const [seconds, setSeconds] = useState(room.seconds_per_round);

  const stats = players
    .map((player) => {
      const rounds = submissions.filter((entry) => entry.player_id === player.id);
      const best = rounds.reduce((max, entry) => Math.max(max, entry.score), 0);
      const accurate = rounds.filter((entry) => entry.relative_error <= ACCURATE_ERROR).length;
      return {
        player,
        total: player.total_score,
        rounds: rounds.length,
        best,
        accurate,
        played: rounds.length,
      };
    })
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      if (b.best !== a.best) return b.best - a.best;
      return a.player.name.localeCompare(b.player.name);
    });

  const champion = stats[0] ?? null;
  const podium = stats.slice(0, 3);
  const bestRound = submissions.reduce((max, entry) => Math.max(max, entry.score), 0);

  const submissionFor = (playerId: string, round: number) =>
    submissions.find((entry) => entry.player_id === playerId && entry.round_index === round) ?? null;
  const actualFor = (round: number) =>
    answers.find((entry) => entry.round_index === round)?.actual_cm ??
    submissions.find((entry) => entry.round_index === round && entry.actual_cm > 0)?.actual_cm ??
    null;

  const rounds = Array.from({ length: room.rounds_count }, (_, index) => index);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-blueprint opacity-30" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-32 start-1/3 h-96 w-96 rounded-full bg-amber-300/10 blur-[130px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200">
              <Sparkles size={13} />
              {t('onlineFinalTitle')}
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-5xl">
              {t('onlineFinalBody')}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-studio/80 px-3 py-1.5">
              <Users size={13} className="text-reference" />
              {t('onlinePlayersCount', { count: players.length })}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-studio/80 px-3 py-1.5">
              <span className="font-mono font-semibold text-ink">{room.code}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-studio/80 px-3 py-1.5">
              <Trophy size={13} className="text-amber-300" />
              {room.rounds_count} {t('challenges').toLowerCase()}
            </span>
          </div>
        </div>

        {champion && (
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-br from-studio via-studio to-amber-300/[0.07] p-5 sm:p-7">
            <div
              className="pointer-events-none absolute -end-16 -top-16 h-64 w-64 rounded-full bg-amber-300/15 blur-[90px]"
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <PlayerAvatar name={champion.player.name} size="xl" />
                  <span className="absolute -end-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border border-night bg-amber-300 text-night shadow-lg">
                    <Crown size={16} strokeWidth={2.5} />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200">
                    {t('onlineChampion')}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
                    <span className="truncate">{champion.player.name}</span>
                    {champion.player.id === myPlayerId && (
                      <span className="rounded bg-reference/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-reference">
                        {t('onlineYou')}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {t('onlineBestRound')}:{' '}
                    <span className="font-semibold tabular-nums text-ink">+{champion.best}</span> ·{' '}
                    {champion.accurate} {t('spotOn').toLowerCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-end gap-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                    {t('totalScore')}
                  </p>
                  <p className="font-display text-4xl font-extrabold tabular-nums text-amber-300 sm:text-5xl">
                    {formatPoints(champion.total)}
                  </p>
                </div>
                <span className="mb-1 hidden h-12 w-px bg-line sm:block" aria-hidden="true" />
                <div className="mb-1 hidden sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                    {t('onlineRoundPoints')}
                  </p>
                  <p className="font-display text-xl font-extrabold tabular-nums text-ink">
                    {formatPoints(bestRound)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {podium.map((entry, index) => {
            const color = PODIUM[index];
            const you = entry.player.id === myPlayerId;
            return (
              <div
                key={entry.player.id}
                className={`relative overflow-hidden rounded-xl border p-4 ${
                  index === 0
                    ? 'border-amber-300/40 bg-amber-300/[0.06]'
                    : you
                      ? 'border-reference/45 bg-reference/[0.06]'
                      : 'border-line bg-studio'
                }`}
              >
                <div
                  className="absolute inset-x-0 top-0 h-0.5"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-extrabold"
                    style={{ borderColor: `${color}66`, color, backgroundColor: `${color}14` }}
                  >
                    {index + 1}
                  </span>
                  <PlayerAvatar name={entry.player.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate font-display text-sm font-bold text-ink">
                      <span className="truncate">{entry.player.name}</span>
                      {index === 0 && <Crown size={12} className="shrink-0 text-amber-300" />}
                    </p>
                    <p className="text-[11px] tabular-nums text-ink-muted">
                      {formatPoints(entry.total)} {t('onlinePoints')}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-2 text-[11px] text-ink-muted">
                  <span>
                    {t('onlineBestRound')}:{' '}
                    <span className="font-semibold tabular-nums text-ink">+{entry.best}</span>
                  </span>
                  <span>
                    {entry.accurate} {t('spotOn').toLowerCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="overflow-hidden rounded-2xl border border-line bg-studio">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
                <Medal size={17} className="text-amber-300" />
                {t('onlineScoreboard')}
              </h2>
              <span className="text-[11px] text-ink-muted">{t('onlineRoundMatrix')}</span>
            </div>

            <div className="divide-y divide-line/70">
              {stats.map((entry, index) => {
                const you = entry.player.id === myPlayerId;
                return (
                  <div
                    key={entry.player.id}
                    className={`flex items-center gap-3 px-4 py-3 sm:px-5 ${
                      you ? 'bg-reference/[0.07]' : index % 2 === 0 ? 'bg-night/20' : ''
                    }`}
                  >
                    <span
                      className="w-6 shrink-0 text-center font-display text-sm font-extrabold tabular-nums"
                      style={{ color: index < 3 ? PODIUM[index] : '#A79FB8' }}
                    >
                      {index + 1}
                    </span>
                    <PlayerAvatar name={entry.player.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-ink">
                        <span className="truncate">{entry.player.name}</span>
                        {entry.player.is_host && (
                          <Crown size={11} className="shrink-0 text-amber-300" />
                        )}
                        {you && (
                          <span className="rounded bg-reference/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-reference">
                            {t('onlineYou')}
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-ink-muted">
                        {entry.rounds} / {room.rounds_count} · {t('onlineBestRound')} +{entry.best}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-display text-lg font-extrabold tabular-nums text-ink">
                        {formatPoints(entry.total)}
                      </p>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-muted">
                        {t('onlinePoints')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-studio p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
              <RotateCcw size={17} className="text-reference" />
              {t('onlineRematch')}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">{t('onlineRematchBody')}</p>

            {isHost ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    {t('onlineCategoryLabel')}
                  </p>
                  <CategoryPicker value={categoryId} onChange={setCategoryId} disabled={busy} />
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    {t('onlineSecondsLabel')}
                  </p>
                  <SecondsPicker value={seconds} onChange={setSeconds} disabled={busy} />
                </div>
                <button
                  type="button"
                  onClick={() => onRematch(categoryId, seconds)}
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-onair px-4 py-3.5 font-display text-sm font-extrabold text-night transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? <Loader2 size={17} className="animate-spin" /> : <RotateCcw size={17} />}
                  {busy ? t('onlineConnecting') : t('onlineRematch')}
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-line bg-night/40 p-4 text-center text-xs text-ink-muted">
                {t('onlineWaitingRematch')}
              </div>
            )}

            <button
              type="button"
              onClick={onLeave}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-night/40 px-4 py-2.5 text-xs font-semibold text-ink-muted transition hover:border-onair/50 hover:text-onair"
            >
              {t('onlineLeave')}
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-studio">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
            <h2 className="font-display text-lg font-extrabold text-ink">{t('onlineRoundMatrix')}</h2>
            <span className="text-[11px] text-ink-muted">{t('onlineScoreFormula')}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-night/30 text-[10px] uppercase tracking-wider text-ink-muted">
                  <th scope="col" className="sticky start-0 z-10 bg-studio px-4 py-2 text-start font-semibold">
                    {t('player')}
                  </th>
                  {rounds.map((round) => (
                    <th key={round} scope="col" className="px-1 py-2 text-center font-semibold tabular-nums">
                      {round + 1}
                    </th>
                  ))}
                  <th scope="col" className="px-3 py-2 text-end font-semibold">
                    {t('totalScore')}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-line/70 text-[10px] text-ink-muted">
                  <th scope="row" className="sticky start-0 z-10 bg-studio px-4 py-1.5 text-start font-medium">
                    {t('actualSize')}
                  </th>
                  {rounds.map((round) => {
                    const actual = actualFor(round);
                    return (
                      <td key={round} className="px-1 py-1.5 text-center tabular-nums">
                        {actual ? formatMeasurement(actual, unitFor(round), lang) : '—'}
                      </td>
                    );
                  })}
                  <td />
                </tr>

                {stats.map((entry) => {
                  const you = entry.player.id === myPlayerId;
                  return (
                    <tr
                      key={entry.player.id}
                      className={`border-t border-line/70 ${you ? 'bg-reference/[0.07]' : ''}`}
                    >
                      <th
                        scope="row"
                        className={`sticky start-0 z-10 px-4 py-2 text-start ${
                          you ? 'bg-[#171328]' : 'bg-studio'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: playerColor(entry.player.name) }}
                            aria-hidden="true"
                          />
                          <span className="max-w-[130px] truncate text-xs font-semibold text-ink">
                            {entry.player.name}
                          </span>
                        </span>
                      </th>
                      {rounds.map((round) => {
                        const submission = submissionFor(entry.player.id, round);
                        if (!submission) {
                          return (
                            <td key={round} className="px-1 py-2 text-center text-ink-muted/40">
                              —
                            </td>
                          );
                        }
                        const color = scoreColor(submission.score);
                        return (
                          <td key={round} className="px-1 py-2 text-center">
                            <span
                              className="inline-flex min-w-[30px] justify-center rounded-md px-1.5 py-1 text-[11px] font-bold tabular-nums"
                              style={{ color, backgroundColor: `${color}1a` }}
                              title={`${formatMeasurement(submission.estimate_cm, unitFor(round), lang)} → ${formatMeasurement(
                                submission.actual_cm,
                                unitFor(round),
                                lang,
                              )}`}
                            >
                              {submission.score}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-end font-display text-sm font-extrabold tabular-nums text-ink">
                        {formatPoints(entry.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
