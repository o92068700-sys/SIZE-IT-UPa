import { ArrowRight, Crown, Loader2, Sparkles, Timer, Trophy } from 'lucide-react';
import { useState } from 'react';
import PlayerAvatar from '@/components/online/PlayerAvatar';
import RevealStage, { type RevealStageRow } from '@/components/online/RevealStage';
import { useLanguage } from '@/i18n/LanguageProvider';
import { formatMeasurement, formatPoints, offByPercent } from '@/lib/format';
import { playerColor } from '@/lib/playerColor';
import { accuracyLevel } from '@/lib/scoring';
import type { Room, RoomAnswer, RoomPlayer, RoomSubmission } from '@/types/online';

interface RoundRevealProps {
  room: Room;
  players: RoomPlayer[];
  submissions: RoomSubmission[];
  answers: RoomAnswer[];
  myPlayerId: string;
  revealSecondsLeft: number;
  revealSynced: boolean;
  isHost: boolean;
  advancing: boolean;
  onAdvance: () => void;
}

const MEDALS = ['#F5B942', '#C9D1E0', '#C98B5A'];

function scoreColor(score: number) {
  if (score >= 80) return '#53FC18';
  if (score >= 50) return '#F5B942';
  return '#FF3D3D';
}

export default function RoundReveal({
  room,
  players,
  submissions,
  answers,
  myPlayerId,
  revealSecondsLeft,
  revealSynced,
  isHost,
  advancing,
  onAdvance,
}: RoundRevealProps) {
  const { lang, t } = useLanguage();
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);

  const challenge = room.rounds[room.current_round];
  const answer = answers.find((entry) => entry.round_index === room.current_round);
  const target = challenge?.target;
  const targetName = target ? (lang === 'ar' ? target.ar : target.en) : '';
  const roundSubmissions = submissions.filter((entry) => entry.round_index === room.current_round);
  // The answers table is the canonical source. A submitted row also carries the
  // exact size, so the reveal still works if the answers policy is not applied.
  const actualCm =
    answer?.actual_cm ?? roundSubmissions.find((entry) => entry.actual_cm > 0)?.actual_cm ?? 0;

  if (!challenge || !revealSynced || actualCm <= 0) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-studio/80 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-reference/30 bg-reference/10 text-reference">
            <Loader2 size={22} className="animate-spin" />
          </span>
          <p className="mt-4 font-display text-lg font-extrabold text-ink">{t('onlineSyncing')}</p>
          {targetName && <p className="mt-1 text-sm text-ink-muted">{targetName}</p>}
        </div>
      </section>
    );
  }

  const rows: RevealStageRow[] = players
    .map((player) => {
      const submission = roundSubmissions.find((entry) => entry.player_id === player.id);
      return {
        player,
        submission,
        score: submission?.score ?? 0,
        estimate: submission?.estimate_cm ?? null,
        error: submission?.relative_error ?? null,
        total: player.total_score,
        color: playerColor(player.name),
        you: player.id === myPlayerId,
        best: false,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const errorA = a.error ?? Number.POSITIVE_INFINITY;
      const errorB = b.error ?? Number.POSITIVE_INFINITY;
      if (errorA !== errorB) return errorA - errorB;
      return a.player.name.localeCompare(b.player.name);
    });

  const bestId = rows[0]?.score > 0 ? rows[0].player.id : null;
  rows.forEach((row) => {
    row.best = row.player.id === bestId;
  });

  const best = rows.find((row) => row.best) ?? null;
  const secondsLeft = Math.max(0, Math.ceil(revealSecondsLeft));
  const revealOver = revealSecondsLeft <= 0;
  const isLastRound = room.current_round + 1 >= room.rounds_count;
  const drain = Math.max(0, Math.min(100, (revealSecondsLeft / Math.max(1, room.reveal_seconds)) * 100));

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200">
            <Sparkles size={13} />
            {t('onlineRevealTitle', { round: room.current_round + 1 })}
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            {t('onlineRevealBody')}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-studio/80 px-4 py-3">
          <Timer size={16} className={revealOver ? 'text-amber-300' : 'text-reference'} />
          <div className="min-w-[150px]">
            {revealOver ? (
              <p className="text-[11px] font-semibold text-ink">
                {isHost
                  ? t('onlineRevealDone')
                  : isLastRound
                    ? t('onlineWaitingHostFinal')
                    : t('onlineWaitingHostNext')}
              </p>
            ) : (
              <>
                <p className="text-[11px] font-medium text-ink-muted">
                  {t('onlineNextIn', { seconds: secondsLeft })}
                </p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-reference transition-[width] duration-300 ease-linear"
                    style={{ width: `${drain}%` }}
                  />
                </div>
              </>
            )}
          </div>

          {revealOver && isHost && (
            <button
              type="button"
              onClick={onAdvance}
              disabled={advancing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-reference px-4 py-2.5 text-xs font-extrabold text-night transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {advancing ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <ArrowRight size={15} className="rtl:rotate-180" />
              )}
              {isLastRound ? t('onlineSeeResults') : t('onlineNextRound')}
            </button>
          )}

          {revealOver && !isHost && (
            <Loader2 size={15} className="shrink-0 animate-spin text-ink-muted" />
          )}
        </div>
      </div>

      <div className="mt-5">
        <RevealStage
          challenge={challenge}
          actualCm={actualCm}
          rows={rows}
          activePlayerId={activePlayerId}
          onActivate={setActivePlayerId}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
          {t('roundResults')}
          {best && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
              <Crown size={12} />
              {best.player.name}
            </span>
          )}
        </h2>
        <p className="text-[10px] text-ink-muted">
          {t('onlineRoundPoints')}: 100 · {t('onlineScoreFormula')}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        {rows.map((row, index) => {
          const active = row.player.id === activePlayerId;
          const color = scoreColor(row.score);
          const percent = row.error !== null ? offByPercent(row.error) : null;
          const accuracy = row.error !== null ? t(accuracyLevel(row.error)) : t('onlineMissed');
          const border = row.best
            ? 'border-amber-300/50'
            : active
              ? 'border-paper/40'
              : row.you
                ? 'border-reference/45'
                : 'border-line';
          const background = row.best
            ? 'bg-amber-300/[0.06]'
            : active
              ? 'bg-paper/[0.05]'
              : row.you
                ? 'bg-reference/[0.06]'
                : 'bg-night/35';

          return (
            <button
              key={row.player.id}
              type="button"
              onClick={() => setActivePlayerId(active ? null : row.player.id)}
              onMouseEnter={() => setActivePlayerId(row.player.id)}
              onMouseLeave={() => setActivePlayerId(null)}
              onFocus={() => setActivePlayerId(row.player.id)}
              onBlur={() => setActivePlayerId(null)}
              className={`group relative overflow-hidden rounded-xl border p-3 text-start transition ${border} ${background}`}
            >
              <div
                className="absolute inset-x-0 bottom-0 h-0.5 opacity-80"
                style={{ width: `${Math.max(2, row.score)}%`, backgroundColor: color }}
                aria-hidden="true"
              />

              <div className="flex items-start gap-2.5">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-extrabold tabular-nums"
                  style={{
                    borderColor: index < 3 ? `${MEDALS[index]}66` : '#332A4D',
                    color: index < 3 ? MEDALS[index] : '#A79FB8',
                    backgroundColor: index < 3 ? `${MEDALS[index]}14` : 'transparent',
                  }}
                >
                  {index + 1}
                </span>

                <PlayerAvatar name={row.player.name} size="sm" />

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-semibold text-ink">{row.player.name}</span>
                    {row.player.is_host && <Crown size={10} className="shrink-0 text-amber-300" />}
                    {row.you && (
                      <span className="shrink-0 rounded bg-reference/20 px-1 py-0.5 text-[8px] font-bold uppercase text-reference">
                        {t('onlineYou')}
                      </span>
                    )}
                    {row.best && <Trophy size={10} className="shrink-0 text-amber-300" />}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-ink-muted">
                    {row.estimate ? formatMeasurement(row.estimate, challenge.target.unit, lang) : t('onlineNoGuess')}
                    <span className="mx-1 text-line">·</span>
                    <span className={row.error === null ? 'text-onair/80' : ''}>{accuracy}</span>
                    {percent !== null && (
                      <>
                        <span className="mx-1 text-line">·</span>
                        {t('offBy', { percent })}
                      </>
                    )}
                  </p>
                </div>

                <div className="shrink-0 text-end">
                  <p className="font-display text-lg font-extrabold tabular-nums" style={{ color }}>
                    +{row.score}
                  </p>
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-ink-muted">
                    {t('onlinePoints')}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-line/60 pt-1.5 text-[10px] text-ink-muted">
                <span>
                  {t('totalScore')}:{' '}
                  <span className="font-semibold tabular-nums text-ink">{formatPoints(row.total)}</span>
                </span>
                <span>
                  {t('onlineBestRound')}:{' '}
                  <span className="font-semibold tabular-nums text-ink">
                    +{submissions
                      .filter((entry) => entry.player_id === row.player.id)
                      .reduce((max, entry) => Math.max(max, entry.score), 0)}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
