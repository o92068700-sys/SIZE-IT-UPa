import { useRef } from 'react';
import SilhouetteObject from '@/components/SilhouetteObject';
import { useElementSize } from '@/hooks/useElementSize';
import { useImageContent } from '@/hooks/useImageContent';
import { useLanguage } from '@/i18n/LanguageProvider';
import { REFERENCE_COLOR } from '@/lib/colors';
import { formatMeasurement } from '@/lib/format';
import { visualDimensionsCm } from '@/lib/geometry';
import {
  REVEAL_STAGE_PADDING,
  groundY,
  pairScalePxPerCm,
  referenceCenterX,
  targetCenterX,
} from '@/lib/stageFit';
import type { Challenge } from '@/types/game';
import type { RoomPlayer } from '@/types/online';

const ANSWER_COLOR = '#929BB0';

export interface RevealStageRow {
  player: RoomPlayer;
  estimate: number | null;
  score: number;
  error: number | null;
  total: number;
  color: string;
  you: boolean;
  best: boolean;
}

interface RevealStageProps {
  challenge: Challenge;
  actualCm: number;
  rows: RevealStageRow[];
  activePlayerId: string | null;
  onActivate: (playerId: string | null) => void;
}

interface Box {
  left: number;
  top: number;
  w: number;
  h: number;
}

function boxStyle(box: Box) {
  return { left: box.left, top: box.top, width: box.w, height: box.h };
}

export default function RevealStage({
  challenge,
  actualCm,
  rows,
  activePlayerId,
  onActivate,
}: RevealStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const { width, height } = useElementSize(stageRef);
  const { lang, t } = useLanguage();
  const { reference, target } = challenge;

  const referenceName = lang === 'ar' ? reference.ar : reference.en;
  const targetName = lang === 'ar' ? target.ar : target.en;
  const referenceArt = useImageContent(reference.imagePath);
  const targetArt = useImageContent(target.imagePath);

  const referenceDims = visualDimensionsCm(reference, reference.cm, referenceArt.frame);
  const actualDims = visualDimensionsCm(target, actualCm, targetArt.frame);

  const guesses = rows.flatMap((row) => {
    if (row.estimate === null || row.estimate <= 0) return [];
    return [{ row, dims: visualDimensionsCm(target, row.estimate, targetArt.frame) }];
  });

  const extraDims = guesses.map((guess) => guess.dims);
  const scale = pairScalePxPerCm(
    width,
    height,
    referenceDims,
    actualDims,
    REVEAL_STAGE_PADDING,
    extraDims,
  );

  const baselineY = groundY(height, REVEAL_STAGE_PADDING);
  const referenceCx = referenceCenterX(width, referenceDims.widthCm * scale, REVEAL_STAGE_PADDING);
  const targetCx = targetCenterX(
    width,
    Math.max(actualDims.widthCm, ...extraDims.map((dims) => dims.widthCm)) * scale,
    REVEAL_STAGE_PADDING,
  );

  const boxFor = (dims: { widthCm: number; heightCm: number }, centerX: number): Box => {
    const w = dims.widthCm * scale;
    const h = dims.heightCm * scale;
    return { left: centerX - w / 2, top: baselineY - h, w, h };
  };

  const referenceBox = boxFor(referenceDims, referenceCx);
  const actualBox = boxFor(actualDims, targetCx);

  const activeRow = rows.find((row) => row.player.id === activePlayerId) ?? null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-studio">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-night/60 p-1.5">
            <SilhouetteObject
              src={target.imagePath}
              name={targetName}
              color={ANSWER_COLOR}
              frame={targetArt.frame}
            />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              {t('actualSize')}
            </p>
            <p className="truncate font-display text-lg font-extrabold text-ink">{targetName}</p>
          </div>
          <p className="font-display text-2xl font-extrabold tabular-nums text-amber-300 sm:text-3xl">
            {formatMeasurement(actualCm, target.unit, lang)}
          </p>
        </div>

        <p className="text-[11px] text-ink-muted">
          <span className="font-semibold text-reference">{t('reference')}</span> {referenceName}
          <span className="mx-1 text-line">·</span>
          <span className="tabular-nums">{formatMeasurement(reference.cm, reference.unit, lang)}</span>
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-x-0 top-0 z-40 flex flex-wrap gap-1.5 p-3">
          {rows.map((row) => {
            const active = row.player.id === activePlayerId;
            return (
              <button
                key={row.player.id}
                type="button"
                data-testid="reveal-chip"
                onClick={() => onActivate(active ? null : row.player.id)}
                onMouseEnter={() => onActivate(row.player.id)}
                onMouseLeave={() => onActivate(null)}
                onFocus={() => onActivate(row.player.id)}
                onBlur={() => onActivate(null)}
                className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-medium text-ink-muted transition"
                style={{
                  borderColor: active ? row.color : `${row.color}55`,
                  backgroundColor: active ? `${row.color}24` : 'rgba(18,14,28,0.72)',
                  color: active ? '#F4EBDD' : undefined,
                }}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                  aria-hidden="true"
                />
                <span className="max-w-[86px] truncate font-semibold text-ink">
                  {row.player.name}
                </span>
                <span className="tabular-nums">
                  {row.estimate ? formatMeasurement(row.estimate, target.unit, lang) : t('onlineNoGuess')}
                </span>
                <span className="font-bold tabular-nums" style={{ color: row.color }}>
                  +{row.score}
                </span>
              </button>
            );
          })}
        </div>

        <div
          ref={stageRef}
          dir="ltr"
          className="relative h-[420px] w-full sm:h-[520px]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(57,142,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(57,142,255,0.07) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        >
          <div
            className="pointer-events-none absolute inset-x-0 h-px"
            style={{ top: baselineY, backgroundColor: 'rgba(91,140,255,0.55)' }}
            aria-hidden="true"
          />

          <div
            className="absolute z-10 transition-[left,top,width,height] duration-700 ease-out"
            style={boxStyle(referenceBox)}
          >
            <SilhouetteObject
              src={reference.imagePath}
              name={referenceName}
              color={REFERENCE_COLOR}
              frame={referenceArt.frame}
            />
          </div>

          <div
            data-testid="reveal-actual"
            className="absolute z-10 transition-[left,top,width,height] duration-700 ease-out"
            style={{
              ...boxStyle(actualBox),
              opacity: 0.32,
              filter: 'drop-shadow(0 0 10px rgba(146,155,176,0.65))',
            }}
            aria-label={`${targetName}: ${formatMeasurement(actualCm, target.unit, lang)}`}
          >
            <SilhouetteObject
              src={target.imagePath}
              name={targetName}
              color={ANSWER_COLOR}
              frame={targetArt.frame}
            />
          </div>

          {scale > 0 &&
            guesses.map(({ row, dims }) => {
              const box = boxFor(dims, targetCx);
              const active = row.player.id === activePlayerId;
              const badgeStyle =
                target.axis === 'height'
                  ? {
                      left: box.left + box.w / 2,
                      top: box.top,
                      transform: 'translate(-50%, -50%)',
                    }
                  : {
                      left: box.left + box.w,
                      top: box.top + box.h / 2,
                      transform: 'translate(-50%, -50%)',
                    };

              return (
                <div key={row.player.id}>
                  <div
                    data-testid="reveal-ghost"
                    className="absolute transition-[left,top,width,height,opacity] duration-700 ease-out"
                    style={{
                      ...boxStyle(box),
                      zIndex: active ? 24 : 18,
                      opacity: active ? 0.9 : 0.42,
                    }}
                  >
                    <SilhouetteObject
                      src={target.imagePath}
                      name={`${row.player.name}: ${formatMeasurement(row.estimate ?? 0, target.unit, lang)}`}
                      color={row.color}
                      frame={targetArt.frame}
                    />
                  </div>
                  <span
                    className="absolute z-30 flex h-5 w-5 items-center justify-center rounded-full border border-night text-[9px] font-extrabold text-night shadow-lg transition-transform"
                    style={{
                      ...badgeStyle,
                      backgroundColor: row.color,
                      transform: `${badgeStyle.transform} scale(${active ? 1.35 : 1})`,
                    }}
                    aria-hidden="true"
                  >
                    {row.player.name.slice(0, 1).toUpperCase()}
                  </span>
                </div>
              );
            })}

          {scale > 0 && (
            <>
              <div
                className="pointer-events-none absolute z-20 w-36 max-w-[42%] -translate-x-1/2 text-center"
                style={{ left: referenceCx, top: Math.max(56, referenceBox.top - 40), color: REFERENCE_COLOR }}
              >
                <p className="truncate text-[11px] font-bold leading-tight">{referenceName}</p>
              </div>
              <div
                className="pointer-events-none absolute z-20 w-36 max-w-[42%] -translate-x-1/2 text-center"
                style={{ left: targetCx, top: Math.max(56, actualBox.top - 40), color: ANSWER_COLOR }}
              >
                <p className="truncate text-[11px] font-bold leading-tight">{targetName}</p>
              </div>
            </>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-wrap items-end justify-between gap-2 p-3">
          <p className="rounded-lg border border-line/70 bg-night/75 px-2.5 py-1.5 text-[10px] leading-relaxed text-ink-muted backdrop-blur">
            <span className="font-semibold text-ink">{t('onlineRealShape')}</span>{' '}
            {t('onlineStageHint')}
          </p>
          <span className="rounded-full border border-line/70 bg-night/75 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-muted backdrop-blur">
            {t('onlineAutoFit')}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-[10px] text-ink-muted sm:px-5">
        <span className="truncate">
          {activeRow ? (
            <>
              <span className="font-semibold text-ink">{activeRow.player.name}</span>
              {' · '}
              {t('onlineEstimate')}:{' '}
              <span className="tabular-nums text-ink">
                {activeRow.estimate ? formatMeasurement(activeRow.estimate, target.unit, lang) : t('onlineNoGuess')}
              </span>
              {' · '}
              <span className="tabular-nums" style={{ color: activeRow.color }}>
                +{activeRow.score}
              </span>
            </>
          ) : (
            t('onlineHoverHint')
          )}
        </span>
        <span className="shrink-0 tabular-nums">{t('onlineStageScale')}</span>
      </div>
    </div>
  );
}
