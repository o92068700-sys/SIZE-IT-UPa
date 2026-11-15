import { ArrowDownRight, ArrowUpRight, Equal, Ruler } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { Challenge, RoundResult } from '@/types/game';

interface AreaDuelProps {
  challenge: Challenge;
  estimateCm: number;
  /** Present only in solo mode after lock. Online keeps the answer secret. */
  result?: RoundResult;
  /** Online play: the estimate was submitted and is now frozen. */
  frozen?: boolean;
}

/** The dial is logarithmic: equal distances are equal ratios, not equal km². */
const DIAL_MIN = 0.1;
const DIAL_MAX = 10;
const DIAL_TICKS = [0.1, 0.2, 0.5, 1, 2, 5, 10];
const DIAL_ARC = 'M 28.89 91.11 A 44 44 0 1 1 91.11 91.11';

function dialAngle(ratio: number) {
  const clamped = Math.min(DIAL_MAX, Math.max(DIAL_MIN, ratio));
  return Math.log10(clamped) * 135;
}

function areaDigits(value: number) {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: value >= 1000 ? 0 : value >= 10 ? 1 : 2,
  });
}

function percentText(value: number) {
  const percent = Math.abs(value) * 100;
  return percent >= 10 ? percent.toFixed(0) : percent.toFixed(1);
}

/**
 * Numeric companion to the map silhouettes.
 *
 * During play it shows the reference's real area and the player's live
 * estimate. The target's real area is never read here until `result` exists,
 * so the guessing phase stays a guessing phase. After lock the estimate turns
 * into a ghost marker and the real area takes over the dial and the number.
 */
export default function AreaDuel({ challenge, estimateCm, result, frozen = false }: AreaDuelProps) {
  const { lang, t } = useLanguage();
  const { reference, target } = challenge;
  const revealed = Boolean(result);
  const held = frozen && !revealed;
  const referenceArea = reference.cm;
  const estimateArea = result ? result.estimateCm : estimateCm;
  const shownArea = result ? target.cm : estimateCm;
  const ratio = referenceArea > 0 ? shownArea / referenceArea : 1;
  const estimateRatio = referenceArea > 0 ? estimateArea / referenceArea : 1;
  const diff = ratio - 1;
  const referenceName = lang === 'ar' ? reference.ar : reference.en;
  const targetName = lang === 'ar' ? target.ar : target.en;
  const DiffIcon = Math.abs(diff) < 0.005 ? Equal : diff > 0 ? ArrowUpRight : ArrowDownRight;

  const diffTone = revealed
    ? 'border-amber-300/30 bg-amber-300/10 text-amber-300'
    : Math.abs(diff) < 0.005
      ? 'border-kick/30 bg-kick/10 text-kick'
      : diff > 0
        ? 'border-mystery/30 bg-mystery/10 text-mystery'
        : 'border-reference/30 bg-reference/10 text-reference';

  const diffLabel =
    Math.abs(diff) < 0.005
      ? t('areaEqual')
      : t(diff > 0 ? 'areaLarger' : 'areaSmaller', { percent: percentText(diff) });

  return (
    <section
      data-testid="area-duel"
      data-state={revealed ? 'revealed' : held ? 'held' : 'live'}
      className="relative overflow-hidden rounded-2xl border border-line bg-studio/90 p-4 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.9)] sm:p-5"
    >
      <div className="pointer-events-none absolute inset-0 bg-blueprint-fine opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-reference/70 to-transparent" />
      <div className="pointer-events-none absolute -end-16 -top-20 h-44 w-44 rounded-full bg-reference/10 blur-3xl" />
      <div className="pointer-events-none absolute -start-16 -bottom-24 h-48 w-48 rounded-full bg-mystery/10 blur-3xl" />

      <div className="relative">
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-reference/30 bg-reference/10 text-reference">
              <Ruler size={15} strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[9px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                {t(revealed ? 'areaDuelKickerRevealed' : 'areaDuelKicker')}
              </p>
              <h2 className="truncate font-display text-sm font-extrabold text-ink sm:text-base">
                {t('areaDuelTitle')}
              </h2>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] ${
              revealed
                ? 'border-amber-300/30 bg-amber-300/10 text-amber-300'
                : held
                  ? 'border-line bg-night/40 text-ink-muted'
                  : 'border-kick/30 bg-kick/10 text-kick'
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${
                revealed ? 'bg-amber-300' : held ? 'bg-ink-muted' : 'bg-kick animate-pulse-dot'
              }`}
            />
            {revealed ? t('areaRevealed') : held ? t('onlineLocked') : t('areaLive')}
          </span>
        </header>

        <div className="mt-3 grid grid-cols-2 items-center gap-x-3 gap-y-3 sm:mt-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-6">
          <AreaValue
            label={t('areaReference')}
            value={referenceArea}
            name={referenceName}
            color="#5B8CFF"
            unit={t('unitKm2')}
            align="start"
            className="order-1"
          />

          <div className="order-3 col-span-2 flex items-center justify-center sm:order-2 sm:col-span-1">
            <AreaDial ratio={ratio} estimateRatio={estimateRatio} revealed={revealed} />
          </div>

          <AreaValue
            label={revealed ? t('areaActual') : t('areaEstimate')}
            value={shownArea}
            name={targetName}
            color={revealed ? '#F5B942' : '#FF2D55'}
            unit={t('unitKm2')}
            align="end"
            live={!revealed && !held}
            className="order-2 sm:order-3"
          />
        </div>

        <footer className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line/70 pt-2.5 sm:mt-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${diffTone}`}
            >
              <DiffIcon size={12} aria-hidden="true" />
              {diffLabel}
            </span>
            {revealed && (
              <span className="truncate text-[10px] text-ink-muted">
                {t('areaYourEstimateWas', {
                  value: `${areaDigits(estimateArea)} ${t('unitKm2')}`,
                })}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-muted">
            {revealed ? (
              <>
                <Legend
                  color="#FF2D55"
                  label={`${t('areaEstimateLegend')} ×${estimateRatio.toFixed(2)}`}
                />
                <Legend color="#F5B942" label={`${t('areaActualLegend')} ×${ratio.toFixed(2)}`} />
              </>
            ) : (
              <span>{held ? t('onlineLocked') : t('areaLiveHint')}</span>
            )}
          </div>
        </footer>
      </div>
    </section>
  );
}

function AreaValue({
  label,
  value,
  name,
  color,
  unit,
  align,
  live = false,
  className = '',
}: {
  label: string;
  value: number;
  name: string;
  color: string;
  unit: string;
  align: 'start' | 'end';
  live?: boolean;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${align === 'end' ? 'text-end' : 'text-start'} ${className}`}>
      <p
        className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.16em] text-ink-muted sm:text-[10px] ${
          align === 'end' ? 'justify-end' : ''
        }`}
      >
        {live && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mystery animate-pulse-dot" aria-hidden="true" />
        )}
        <span className="truncate">{label}</span>
      </p>
      <p
        className={`mt-1 flex flex-col gap-0.5 font-display font-extrabold leading-none sm:flex-row sm:items-baseline sm:gap-1 ${
          align === 'end' ? 'items-end justify-end' : 'items-start'
        }`}
      >
        <span
          dir="ltr"
          className="text-[1.4rem] tabular-nums sm:text-4xl"
          style={{ color, textShadow: `0 0 18px ${color}33` }}
        >
          {areaDigits(value)}
        </span>
        <span className="text-[10px] font-semibold text-ink-muted sm:text-xs">{unit}</span>
      </p>
      <p className="mt-1 truncate text-[10px] text-ink-muted sm:text-[11px]">{name}</p>
    </div>
  );
}

function AreaDial({
  ratio,
  estimateRatio,
  revealed,
}: {
  ratio: number;
  estimateRatio: number;
  revealed: boolean;
}) {
  const { t } = useLanguage();
  const angle = dialAngle(ratio);
  const estimateAngle = dialAngle(estimateRatio);
  const needleStyle = (degrees: number, duration: number) => ({
    transform: `rotate(${degrees}deg)`,
    transformOrigin: '60px 60px',
    transformBox: 'view-box' as const,
    transition: `transform ${duration}ms ease-out`,
  });

  return (
    <div className="relative h-20 w-20 shrink-0 sm:h-28 sm:w-28">
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="area-dial-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5B8CFF" />
            <stop offset="100%" stopColor="#FF2D55" />
          </linearGradient>
        </defs>

        <path d={DIAL_ARC} fill="none" stroke="#332A4D" strokeWidth="4.5" strokeLinecap="round" />
        <path
          d={DIAL_ARC}
          fill="none"
          stroke="url(#area-dial-arc)"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.6"
        />

        {DIAL_TICKS.map((tick) => {
          const major = tick === 1;
          return (
            <line
              key={tick}
              x1="60"
              y1={major ? 24 : 21}
              x2="60"
              y2="17"
              stroke={major ? '#F6F2EA' : '#6B7AA8'}
              strokeWidth={major ? 1.6 : 1}
              strokeLinecap="round"
              transform={`rotate(${dialAngle(tick)} 60 60)`}
              opacity={major ? 0.9 : 0.5}
            />
          );
        })}

        {/* The reference sits at 1×, fixed at the top of the dial. */}
        <path d="M60 3 L55.5 10 L64.5 10 Z" fill="#5B8CFF" opacity="0.9" />

        {/* Live estimate: becomes a dashed ghost once the answer is revealed. */}
        <g style={needleStyle(estimateAngle, 120)}>
          <line
            x1="60"
            y1="25"
            x2="60"
            y2="17"
            stroke="#FF2D55"
            strokeWidth={revealed ? 1.4 : 2.6}
            strokeLinecap="round"
            strokeDasharray={revealed ? '2.5 3' : undefined}
            opacity={revealed ? 0.55 : 1}
          />
          <circle
            cx="60"
            cy="15.5"
            r={revealed ? 2.4 : 3.6}
            fill="#FF2D55"
            opacity={revealed ? 0.55 : 1}
          />
        </g>

        {revealed && (
          <g style={needleStyle(angle, 240)}>
            <line x1="60" y1="26" x2="60" y2="17" stroke="#F5B942" strokeWidth="3" strokeLinecap="round" />
            <circle cx="60" cy="15.5" r="4" fill="#F5B942" />
            <circle cx="60" cy="15.5" r="7" fill="none" stroke="#F5B942" strokeWidth="1" opacity="0.35" />
          </g>
        )}

        <circle cx="60" cy="60" r="2.6" fill="#120E1C" stroke="#332A4D" strokeWidth="1.4" />
      </svg>

      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p
            dir="ltr"
            className={`font-display text-sm font-extrabold leading-none tabular-nums sm:text-xl ${
              revealed ? 'text-amber-300' : 'text-ink'
            }`}
            style={{
              textShadow: revealed
                ? '0 0 18px rgba(245,185,66,0.35)'
                : '0 0 18px rgba(246,242,234,0.18)',
            }}
          >
            ×{ratio.toFixed(2)}
          </p>
          <p className="mt-0.5 text-[6px] font-bold uppercase tracking-[0.1em] text-ink-muted sm:text-[8px]">
            {revealed ? t('areaActualRatioLabel') : t('areaRatioLabel')}
          </p>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      {label}
    </span>
  );
}
