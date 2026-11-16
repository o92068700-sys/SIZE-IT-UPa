import {
  Check,
  Copy,
  Crown,
  Link2,
  Loader2,
  LogOut,
  Play,
  Plus,
  Share2,
  ShieldCheck,
  Timer,
  Users,
  WifiOff,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import PlayerAvatar from '@/components/online/PlayerAvatar';
import { CATEGORIES } from '@/data/categories';
import { useLanguage } from '@/i18n/LanguageProvider';
import { copyText, inviteLink } from '@/lib/online';
import type { Room, RoomPlayer } from '@/types/online';

interface LobbyViewProps {
  room: Room;
  players: RoomPlayer[];
  myPlayerId: string;
  now: number;
  busy: boolean;
  onStart: () => void;
  onLeave: () => void;
  onClaimHost: () => void;
}

export default function LobbyView({
  room,
  players,
  myPlayerId,
  now,
  busy,
  onStart,
  onLeave,
  onClaimHost,
}: LobbyViewProps) {
  const { t, lang } = useLanguage();
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const copyTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  const category = CATEGORIES.find((item) => item.id === room.category_id);
  const categoryName = category
    ? lang === 'ar'
      ? category.nameAr ?? category.name
      : category.name
    : room.category_id;

  const myPlayer = players.find((player) => player.id === myPlayerId) ?? null;
  const isHost = myPlayer?.is_host ?? false;
  const host = players.find((player) => player.is_host) ?? null;
  const hostOnline = host ? now - new Date(host.last_seen_at).getTime() < 45_000 : false;
  const canClaim = !isHost && Boolean(host) && !hostOnline;
  const link = inviteLink(room.code);

  const flash = (kind: 'code' | 'link') => {
    setCopied(kind);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(null), 1800);
  };

  const copyCode = async () => {
    if (await copyText(room.code)) flash('code');
  };

  const copyLink = async () => {
    if (await copyText(link)) flash('link');
  };

  const share = async () => {
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
    };
    if (nav.share) {
      try {
        await nav.share({
          title: 'SizIQ',
          text: t('onlineShareText', { code: room.code }),
          url: link,
        });
        return;
      } catch {
        // The user cancelled or sharing is unavailable; fall back to copying.
      }
    }
    await copyLink();
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-blueprint opacity-35" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-32 start-1/3 h-80 w-80 rounded-full bg-reference/15 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-kick/30 bg-kick/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-kick">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-kick opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-kick" />
              </span>
              {t('onlineWaitingTitle')}
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              {t('onlineSameRound')}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">{t('onlineWaitingBody')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-studio/80 px-3 py-1.5 text-xs font-medium text-ink-muted">
              <ShieldCheck size={13} className="text-reference" />
              {t('onlineInviteOnly')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-studio/80 px-3 py-1.5 text-xs font-medium text-ink-muted">
              <Users size={13} className="text-mystery" />
              {t('onlinePlayersCount', { count: players.length })}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-line bg-studio p-5 sm:p-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-reference/60 to-transparent" aria-hidden="true" />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                    {t('onlineRoomCode')}
                  </p>
                  <p
                    className="mt-1 font-mono text-4xl font-extrabold tracking-[0.28em] text-ink/40 sm:text-5xl"
                    aria-label={t('onlineRoomCode')}
                  >
                    {'••••••'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyCode}
                    className="inline-flex items-center gap-2 rounded-lg border border-line bg-night/50 px-3 py-2 text-xs font-semibold text-ink-muted transition hover:border-reference/50 hover:text-ink"
                  >
                    {copied === 'code' ? <Check size={14} className="text-kick" /> : <Copy size={14} />}
                    {copied === 'code' ? t('onlineCopied') : t('onlineCopyCode')}
                  </button>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex items-center gap-2 rounded-lg border border-line bg-night/50 px-3 py-2 text-xs font-semibold text-ink-muted transition hover:border-reference/50 hover:text-ink"
                  >
                    {copied === 'link' ? <Check size={14} className="text-kick" /> : <Link2 size={14} />}
                    {copied === 'link' ? t('onlineCopied') : t('onlineCopyLink')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void share()}
                    className="inline-flex items-center gap-2 rounded-lg bg-reference/15 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-reference/25"
                  >
                    <Share2 size={14} />
                    {t('onlineShare')}
                  </button>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-ink-muted">{t('onlineInviteHint')}</p>
            </div>

            <div className="rounded-2xl border border-line bg-studio p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-extrabold text-ink">{t('onlinePlayers')}</h2>
                <span className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold tabular-nums text-ink-muted">
                  {t('onlinePlayersCount', { count: players.length })}
                </span>
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {players.map((player) => {
                  const you = player.id === myPlayerId;
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                        you ? 'border-reference/50 bg-reference/10' : 'border-line bg-night/40'
                      }`}
                    >
                      <PlayerAvatar name={player.name} />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 truncate font-semibold text-ink">
                          <span className="truncate">{player.name}</span>
                          {player.is_host && <Crown size={13} className="shrink-0 text-amber-300" />}
                        </p>
                        <p className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-muted">
                          {you && <span className="rounded bg-reference/20 px-1.5 py-0.5 font-semibold text-reference">{t('onlineYou')}</span>}
                          {player.is_host ? t('onlineHost') : t('onlineWaiting')}
                        </p>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-kick" aria-hidden="true" />
                    </div>
                  );
                })}

                {Array.from({ length: Math.max(0, 8 - players.length) }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-dashed border-line/80 bg-night/20 p-3 text-ink-muted/60"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-line">
                      <Plus size={16} />
                    </span>
                    <span className="text-xs font-medium">{t('onlineOpenSeat')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-studio p-5 sm:p-6">
              <h2 className="font-display text-lg font-extrabold text-ink">{t('onlineRoomSettings')}</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-2.5">
                  <dt className="flex items-center gap-1.5 text-ink-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-reference" aria-hidden="true" />
                    {t('onlineCategoryLabel')}
                  </dt>
                  <dd className="text-end font-semibold text-ink">{categoryName}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-2.5">
                  <dt className="flex items-center gap-1.5 text-ink-muted">
                    <Timer size={13} />
                    {t('onlineSecondsLabel')}
                  </dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {room.seconds_per_round} {t('onlineUnitSeconds')}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-2.5">
                  <dt className="text-ink-muted">{t('challenges')}</dt>
                  <dd className="font-semibold tabular-nums text-ink">{room.rounds_count}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">{t('onlineRevealLabel')}</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {room.reveal_seconds} {t('onlineUnitSeconds')}
                  </dd>
                </div>
              </dl>

              {isHost ? (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={onStart}
                    disabled={busy || players.length === 0}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-onair px-4 py-3.5 font-display text-sm font-extrabold text-night transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? <Loader2 size={17} className="animate-spin" /> : <Play size={17} className="fill-night" />}
                    {busy ? t('onlineConnecting') : t('onlineStart')}
                  </button>
                  <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">{t('onlineStartHint')}</p>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-line bg-night/40 p-3 text-center">
                  <p className="text-xs font-medium text-ink-muted">{t('onlineWaitingHost')}</p>
                  {canClaim && (
                    <div className="mt-3 border-t border-line pt-3">
                      <p className="flex items-center justify-center gap-1.5 text-[11px] text-amber-300">
                        <WifiOff size={13} />
                        {t('onlineHostOffline')}
                      </p>
                      <button
                        type="button"
                        onClick={onClaimHost}
                        disabled={busy}
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-300/20 disabled:opacity-50"
                      >
                        <Crown size={13} />
                        {t('onlineClaimHost')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onLeave}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-night/40 px-4 py-3 text-sm font-semibold text-ink-muted transition hover:border-onair/50 hover:text-onair"
            >
              <LogOut size={15} className="rtl:rotate-180" />
              {t('onlineLeave')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
