import { Check, Clock3, Loader2, Lock, ShieldCheck, Timer, Users } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import AreaDuel from '@/components/AreaDuel';
import GameStage from '@/components/GameStage';
import PlayerAvatar from '@/components/online/PlayerAvatar';
import TimerRing from '@/components/online/TimerRing';
import { useLanguage } from '@/i18n/LanguageProvider';
import { formatPoints } from '@/lib/format';
import { clampToRange } from '@/lib/geometry';
import { DEFAULT_ZOOM_INDEX, ZOOM_LEVELS } from '@/lib/gameConfig';
import { onlineEstimateRange } from '@/lib/online';
import type { Room, RoomPlayer, RoomSubmission } from '@/types/online';

interface PlayViewProps {
  room: Room;
  players: RoomPlayer[];
  submissions: RoomSubmission[];
  myPlayerId: string;
  secondsLeft: number;
  now: number;
  starting: boolean;
  submitting: boolean;
  onSubmit: (estimateCm: number) => Promise<RoomSubmission | null>;
}

function StartingGate({
  room,
  players,
  myPlayerId,
  now,
}: {
  room: Room;
  players: RoomPlayer[];
  myPlayerId: string;
  now: number;
}) {
  const { t } = useLanguage();
  const readyCount = players.filter((player) => player.ready_round >= room.current_round).length;
  const total = Math.max(1, players.length);
  const progress = Math.round((readyCount / total) * 100);
  const deadline = room.round_starts_by ? new Date(room.round_starts_by).getTime() : null;
  const secondsToStart =
    deadline !== null && Number.isFinite(deadline) ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0;

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="rounded-2xl border border-line bg-studio/85 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-reference">
          {t('onlineRoundOf', { current: room.current_round + 1, total: room.rounds_count })}
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
          {t('onlineGetReady')}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">{t('onlineReadyBody')}</p>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Users size={13} className="text-reference" />
              {t('onlineReadyCount', { ready: readyCount, total: players.length })}
            </span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-gradient-to-r from-reference to-kick transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {players.map((player) => {
            const ready = player.ready_round >= room.current_round;
            const you = player.id === myPlayerId;
            return (
              <li
                key={player.id}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 ${
                  ready ? 'border-kick/35 bg-kick/[0.06]' : 'border-line bg-night/35'
                }`}
              >
                <PlayerAvatar name={player.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">
                    {player.name}
                    {you && (
                      <span className="ms-1.5 text-[9px] font-bold uppercase text-reference">
                        {t('onlineYou')}
                      </span>
                    )}
                  </p>
                  <p className={`text-[10px] ${ready ? 'text-kick' : 'text-ink-muted'}`}>
                    {ready ? t('onlineReady') : t('onlineLoading')}
                  </p>
                </div>
                {ready ? (
                  <Check size={15} className="shrink-0 text-kick" />
                ) : (
                  <Loader2 size={14} className="shrink-0 animate-spin text-ink-muted" />
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-center text-[11px] text-ink-muted">
          {secondsToStart > 0
            ? t('onlineStartingIn', { seconds: secondsToStart })
            : t('onlineStartingNow')}
        </p>
      </div>
    </section>
  );
}

function FrozenStage({ frozen, children }: { frozen: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (frozen) node.setAttribute('inert', '');
    else node.removeAttribute('inert');
  }, [frozen]);

  return (
    <div ref={ref} className={frozen ? 'pointer-events-none select-none' : ''}>
      {children}
    </div>
  );
}

export default function PlayView({
  room,
  players,
  submissions,
  myPlayerId,
  secondsLeft,
  now,
  starting,
  submitting,
  onSubmit,
}: PlayViewProps) {
  const { lang, t } = useLanguage();
  const challenge = room.rounds[room.current_round];
  const isArea = challenge?.target.unit === 'area';
  const range = onlineEstimateRange(challenge?.target.cm ?? 100);

  const [estimateCm, setEstimateCm] = useState(() =>
    challenge
      ? clampToRange(
          challenge.startCm ?? challenge.reference.cm,
          onlineEstimateRange(challenge.target.cm),
        )
      : 100,
  );
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [pending, setPending] = useState(false);
  const [scoreSnapshot, setScoreSnapshot] = useState<Record<string, number>>({});
  const lastChallengeIdRef = useRef<string | null>(null);
  const playersRef = useRef(players);
  playersRef.current = players;

  // Reset the local estimate whenever a new object arrives. The component stays
  // mounted across rounds, so without this the previous answer would carry over.
  useEffect(() => {
    if (!challenge) return;
    if (lastChallengeIdRef.current === challenge.id) return;
    lastChallengeIdRef.current = challenge.id;
    setEstimateCm(
      clampToRange(
        challenge.startCm ?? challenge.reference.cm,
        onlineEstimateRange(challenge.target.cm),
      ),
    );
    setZoomIndex(DEFAULT_ZOOM_INDEX);
    setPending(false);
    setScoreSnapshot(
      Object.fromEntries(playersRef.current.map((player) => [player.id, player.total_score])),
    );
  }, [challenge]);

  const mySubmission = submissions.find(
    (entry) => entry.player_id === myPlayerId && entry.round_index === room.current_round,
  );
  const locked = Boolean(mySubmission) || pending;
  const myPlayer = players.find((player) => player.id === myPlayerId) ?? null;
  const displayedScore = (playerId: string, live: number) => scoreSnapshot[playerId] ?? live;
  const submittedCount = Math.max(room.submitted_count, mySubmission ? 1 : 0);
  const totalPlayers = Math.max(1, players.length);
  const progress = Math.min(100, Math.round((submittedCount / totalPlayers) * 100));
  const urgent = secondsLeft <= 10;
  const timeUp = secondsLeft <= 0;

  if (!challenge) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-ink-muted">
        {t('onlineSyncing')}
      </div>
    );
  }

  if (starting) {
    return <StartingGate room={room} players={players} myPlayerId={myPlayerId} now={now} />;
  }

  const handleSubmit = async () => {
    if (locked || timeUp) return;
    setPending(true);
    const result = await onSubmit(clampToRange(estimateCm, range));
    if (!result) setPending(false);
  };

  const updateEstimate = (cm: number) => {
    if (locked) return;
    setEstimateCm(clampToRange(cm, range));
  };

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6">
      <div className="grid gap-3 rounded-2xl border border-line bg-studio/85 p-3.5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-4">
        <div className="flex items-center gap-3">
          <TimerRing
            secondsLeft={secondsLeft}
            totalSeconds={room.seconds_per_round}
            size={64}
          />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              {t('onlineRoundOf', {
                current: room.current_round + 1,
                total: room.rounds_count,
              })}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <span className={`h-1.5 w-1.5 rounded-full ${urgent ? 'bg-onair' : 'bg-kick'}`} aria-hidden="true" />
              {timeUp ? t('onlineTimeUp') : t('onlineTimeLeft', { seconds: Math.ceil(secondsLeft) })}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Users size={13} className="text-reference" />
              {t('onlineSubmittedCount', { count: submittedCount, total: players.length })}
            </span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-gradient-to-r from-reference to-kick transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-ink-muted">{t('onlineAutoReveal', { seconds: room.reveal_seconds })}</p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-end">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{t('onlineLiveScores')}</p>
            <p className="font-display text-xl font-extrabold tabular-nums text-ink">
              {formatPoints(displayedScore(myPlayerId, myPlayer?.total_score ?? 0))}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-onair/30 bg-onair/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-onair">
            <span className="h-1.5 w-1.5 rounded-full bg-onair" aria-hidden="true" />
            {t('onlineLive')}
          </span>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {players.map((player) => {
          const you = player.id === myPlayerId;
          return (
            <div
              key={player.id}
              className={`flex min-w-[148px] shrink-0 items-center gap-2 rounded-xl border px-2.5 py-2 ${
                you ? 'border-reference/50 bg-reference/10' : 'border-line bg-studio/70'
              }`}
            >
              <PlayerAvatar name={player.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-xs font-semibold text-ink">
                  <span className="truncate">{player.name}</span>
                  {you && <span className="shrink-0 text-[9px] font-bold uppercase text-reference">{t('onlineYou')}</span>}
                </p>
                <p className="text-[10px] tabular-nums text-ink-muted">
                  {formatPoints(displayedScore(player.id, player.total_score))} {t('onlinePoints')}
                </p>
              </div>
              {you && locked && <Check size={14} className="shrink-0 text-kick" />}
            </div>
          );
        })}
      </div>

      <div className="relative">
        <FrozenStage frozen={locked}>
          <GameStage
            key={challenge.id}
            challenge={challenge}
            estimateCm={estimateCm}
            zoomIndex={zoomIndex}
            result={undefined}
            onEstimateChange={updateEstimate}
            onZoomIn={() => setZoomIndex((index) => Math.min(ZOOM_LEVELS.length - 1, index + 1))}
            onZoomOut={() => setZoomIndex((index) => Math.max(0, index - 1))}
          />
        </FrozenStage>

        {locked && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-3">
            <div className="animate-fade-up rounded-full border border-kick/40 bg-night/90 px-4 py-2 text-xs font-bold text-kick shadow-2xl backdrop-blur">
              <span className="inline-flex items-center gap-1.5">
                <Lock size={13} />
                {t('onlineLocked')}
              </span>
            </div>
          </div>
        )}
      </div>

      {isArea && (
        <AreaDuel challenge={challenge} estimateCm={estimateCm} frozen={locked} />
      )}

      <div
        className={`flex flex-col gap-4 rounded-2xl border bg-stage/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${
          urgent && !locked ? 'border-onair/40 shadow-[0_0_0_1px_rgba(255,61,61,0.15)]' : 'border-line'
        }`}
      >
        <div className="min-w-0">
          {!isArea && (
            <div className="mb-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-medium text-ink-muted">{t('reference')}</p>
                <p className="font-semibold text-ink">
                  {lang === 'ar' ? challenge.reference.ar : challenge.reference.en}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-ink-muted">{t('mystery')}</p>
                <p className="font-semibold text-ink">
                  {lang === 'ar' ? challenge.target.ar : challenge.target.en}
                </p>
              </div>
            </div>
          )}
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {t('yourGuess')}
          </p>
          <p className="mt-1 text-sm text-ink-muted">{t('eyeHint')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck size={12} className="text-reference" />
              {t('onlineScoreFormula')}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={12} />
              {t('onlineRangeHint')}
            </span>
          </div>
        </div>

        {!locked && (
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || timeUp}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-action px-6 py-3.5 font-display text-sm font-extrabold text-white transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
            {timeUp ? t('onlineTimeUp') : t('onlineLockIn')}
          </button>
        )}

        {locked && (
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-kick/30 bg-kick/10 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-kick/15 text-kick">
              <Check size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">{t('onlineLocked')}</p>
              <p className="text-[11px] text-ink-muted">{t('onlineWaitingOthers')}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
        <Timer size={12} />
        {t('onlineAutoReveal', { seconds: room.reveal_seconds })}
      </div>
    </section>
  );
}
