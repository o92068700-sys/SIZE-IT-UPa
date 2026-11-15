import { ArrowRight, Check, Link2, Radio, ShieldCheck, Timer, Trophy, Users } from 'lucide-react';
import PlayerAvatar from '@/components/online/PlayerAvatar';
import TimerRing from '@/components/online/TimerRing';
import { useLanguage } from '@/i18n/LanguageProvider';

interface OnlineSectionProps {
  onOnline: () => void;
}

const DEMO_PLAYERS = [
  { name: 'Omar', score: 812, you: true },
  { name: 'Lina', score: 764, you: false },
  { name: 'Yousef', score: 690, you: false },
];

const FEATURES = [
  { icon: Timer, key: 'onlineFeatureClock' },
  { icon: Trophy, key: 'onlineFeatureReveal' },
  { icon: Link2, key: 'onlineFeatureLink' },
] as const;

export default function OnlineSection({ onOnline }: OnlineSectionProps) {
  const { t } = useLanguage();

  return (
    <section id="online" className="relative scroll-mt-20 overflow-hidden border-b border-line py-20 sm:py-24">
      <div className="absolute inset-0 bg-blueprint opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-24 start-1/4 h-72 w-72 rounded-full bg-reference/10 blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 end-0 h-64 w-64 rounded-full bg-mystery/10 blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-onair/30 bg-onair/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-onair">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-onair opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-onair" />
            </span>
            {t('onlineKicker')}
          </p>

          <h2 className="mt-4 text-balance font-display text-3xl font-extrabold text-ink sm:text-5xl">
            {t('onlineTitle')}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-[1.7] text-ink-muted sm:text-lg">
            {t('onlineSubtitle')}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onOnline}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-onair px-6 py-3.5 font-display text-sm font-bold text-night transition hover:brightness-110 active:scale-[0.99]"
            >
              <Radio size={17} />
              {t('onlineSectionCta')}
              <ArrowRight size={16} className="rtl:rotate-180" />
            </button>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
              <ShieldCheck size={13} className="text-kick" />
              {t('onlineSectionNote')}
            </span>
          </div>

          <ul className="mt-8 grid gap-3 border-t border-line pt-6 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, key }) => (
              <li key={key} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-night/50 text-reference">
                  <Icon size={15} />
                </span>
                <span className="text-xs font-medium leading-snug text-ink-muted">{t(key)}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 flex items-start gap-2 rounded-xl border border-line bg-studio/60 p-3 text-[11px] leading-relaxed text-ink-muted">
            <Check size={14} className="mt-0.5 shrink-0 text-kick" />
            {t('onlineAutoReveal', { seconds: 5 })}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:mx-0">
          <div className="rounded-2xl border border-line bg-studio p-3 shadow-[0_40px_100px_-45px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between px-1 pb-2.5 text-[10px] font-semibold text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-onair" aria-hidden="true" />
                {t('onlineLive')}
              </span>
              <span className="font-mono tracking-[0.12em] text-ink">{t('onlineDemoRoom')}</span>
              <span className="tracking-[0.16em]">1:1</span>
            </div>

            <div className="rounded-xl border border-line bg-night/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                    {t('onlineDemoRound')}
                  </p>
                  <p className="mt-1 font-display text-lg font-extrabold text-ink">{t('onlineSameRound')}</p>
                </div>
                <TimerRing secondsLeft={42} totalSeconds={60} size={58} />
              </div>

              <div className="mt-4 space-y-2">
                {DEMO_PLAYERS.map((player) => (
                  <div
                    key={player.name}
                    className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 ${
                      player.you ? 'border-reference/50 bg-reference/10' : 'border-line bg-studio/60'
                    }`}
                  >
                    <PlayerAvatar name={player.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-xs font-semibold text-ink">
                        <span className="truncate">{player.name}</span>
                        {player.you && (
                          <span className="rounded bg-reference/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-reference">
                            {t('onlineDemoYou')}
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] tabular-nums text-ink-muted">
                        {player.score} {t('onlinePoints')}
                      </p>
                    </div>
                    {player.you ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-kick/30 bg-kick/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-kick">
                        <Check size={10} />
                        {t('onlineSubmitted')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink-muted">
                        <Users size={10} />
                        {t('onlineWaiting')}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-night/60 px-3 py-2 text-[10px] text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-kick" aria-hidden="true" />
                  {t('onlinePlayersCount', { count: 3 })}
                </span>
                <span>{t('onlineInviteOnly')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 pt-2.5 text-[10px] text-ink-muted">
              <span className="tracking-[0.14em]">SIZE IT UP · ONLINE</span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-kick" aria-hidden="true" />
                {t('onlineNoSignup')}
              </span>
            </div>
          </div>

          <span
            className="absolute -bottom-3 -start-3 hidden rotate-[-4deg] rounded-lg border border-line bg-night/95 px-3 py-2 text-[10px] font-semibold text-ink-muted shadow-xl backdrop-blur sm:block"
            aria-hidden="true"
          >
            {t('onlineScoreFormula')}
          </span>
        </div>
      </div>
    </section>
  );
}
