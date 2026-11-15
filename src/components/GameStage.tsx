import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { MoveDiagonal2 } from 'lucide-react';
import SilhouetteObject from '@/components/SilhouetteObject';
import ZoomControls from '@/components/ZoomControls';
import { useElementSize } from '@/hooks/useElementSize';
import { useImageContent } from '@/hooks/useImageContent';
import { useLanguage } from '@/i18n/LanguageProvider';
import { BASELINE_COLOR, MYSTERY_COLOR, REFERENCE_COLOR } from '@/lib/colors';
import { formatMeasurement } from '@/lib/format';
import { visualDimensionsCm } from '@/lib/geometry';
import { ZOOM_LEVELS } from '@/lib/gameConfig';
import {
  PLAY_STAGE_PADDING,
  groundY,
  pairScalePxPerCm,
  referenceCenterX,
  targetCenterX,
} from '@/lib/stageFit';
import type { Challenge, RoundResult } from '@/types/game';

interface GameStageProps {
  challenge: Challenge;
  estimateCm: number;
  zoomIndex: number;
  result: RoundResult | undefined;
  onEstimateChange: (cm: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const KEYBOARD_STEP = 1.05;
/** Relative size change per wheel pixel; a mouse notch is roughly 8%. */
const WHEEL_STEP = 0.001;
const ANSWER_COLOR = '#929BB0';

interface Anchor {
  x: number;
  y: number;
}

interface StageDrag {
  pointerId: number;
  mode: 'move' | 'resize';
  startX: number;
  startY: number;
  startCm: number;
  anchor: Anchor;
}

export default function GameStage({
  challenge,
  estimateCm,
  zoomIndex,
  result,
  onEstimateChange,
  onZoomIn,
  onZoomOut,
}: GameStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const mysteryRef = useRef<HTMLDivElement>(null);
  const drag = useRef<StageDrag | null>(null);
  const latestEstimateCm = useRef(estimateCm);
  latestEstimateCm.current = estimateCm;
  const changeEstimate = useRef(onEstimateChange);
  changeEstimate.current = onEstimateChange;
  // Freeze the fit to the round's starting estimate. Using the live estimate
  // would shrink the reference while the player drags the mystery, so the
  // visual anchor would move and the comparison would stop being fair.
  // GameStage is remounted per challenge (key={challenge.id}), so this value
  // belongs to the current round only.
  const startingEstimateCm = useRef(estimateCm).current;
  const [targetAnchor, setTargetAnchor] = useState<Anchor | null>(null);
  const { width, height } = useElementSize(stageRef);
  const { lang, dir, t } = useLanguage();
  const { reference, target } = challenge;
  const locked = result !== undefined;
  const referenceName = lang === 'ar' ? reference.ar : reference.en;
  const targetName = lang === 'ar' ? target.ar : target.en;
  const referenceArt = useImageContent(reference.imagePath);
  const targetArt = useImageContent(target.imagePath);
  // Do not paint the silhouettes before their opaque content frames are known.
  // Without the frame the SVG is letterboxed inside the mask, so the visible
  // shape would be smaller than its measured box for a frame or two.
  const artReady =
    (referenceArt.available || referenceArt.missing) &&
    (targetArt.available || targetArt.missing);

  const referenceDims = visualDimensionsCm(reference, reference.cm, referenceArt.frame);
  const startingDims = visualDimensionsCm(target, startingEstimateCm, targetArt.frame);
  const estimateDims = visualDimensionsCm(target, estimateCm, targetArt.frame);
  const actualDims = visualDimensionsCm(target, target.cm, targetArt.frame);
  const mysteryDims = locked ? actualDims : estimateDims;

  // Keep the reference away from the left edge. Its caption is 176 px wide
  // (half = 88 px), so a narrow tower placed at the old 24 px padding had its
  // name clipped by the stage edge. Match the right-side gutter so both
  // captions have room, and let the pair fit shrink slightly to compensate.
  const leftPadding = Math.max(
    PLAY_STAGE_PADDING.left,
    Math.min(PLAY_STAGE_PADDING.right + 4, width * 0.25),
  );
  const stagePadding = { ...PLAY_STAGE_PADDING, left: leftPadding };

  // The scale is fixed for the whole round. It covers the starting estimate
  // and the actual answer, but never the live estimate: dragging the mystery
  // must not resize the reference.
  const fitScale = pairScalePxPerCm(width, height, referenceDims, actualDims, stagePadding, [
    startingDims,
  ]);
  const scale = fitScale * ZOOM_LEVELS[zoomIndex];

  const baselineY = groundY(height, stagePadding);
  const defaultRefCx = referenceCenterX(width, referenceDims.widthCm * scale, stagePadding);
  // The target starts inside the fitted footprint. Deriving this from the
  // live estimate would move the shape while it is being resized, so the
  // pointer would chase a moving edge and the size would feel imprecise.
  const targetCx = targetCenterX(
    width,
    Math.max(startingDims.widthCm, actualDims.widthCm) * scale,
    stagePadding,
  );
  const defaultAnchor: Anchor = {
    x: targetCx / Math.max(width, 1),
    y: baselineY / Math.max(height, 1),
  };
  const mysteryAnchor = targetAnchor ?? defaultAnchor;
  const referenceCx = defaultRefCx;
  const targetBottomY = mysteryAnchor.y * height;
  const liveTargetCx = mysteryAnchor.x * width;

  const toBox = (cm: { widthCm: number; heightCm: number }, cx: number, bottomY: number) => {
    const w = cm.widthCm * scale;
    const h = cm.heightCm * scale;
    return { left: cx - w / 2, top: bottomY - h, w, h };
  };
  const referenceBox = toBox(referenceDims, referenceCx, baselineY);
  const estimateBox = toBox(estimateDims, liveTargetCx, targetBottomY);
  const mysteryBox = toBox(mysteryDims, liveTargetCx, targetBottomY);

  const clampAnchor = (anchor: Anchor, boxW: number, boxH: number): Anchor => {
    if (!width || !height || !scale) return anchor;
    const halfW = boxW / 2;
    const cx = boxW >= width ? width / 2 : Math.min(width - halfW, Math.max(halfW, anchor.x * width));
    const bottom = boxH >= height ? height : Math.min(height, Math.max(boxH, anchor.y * height));
    return { x: cx / width, y: bottom / height };
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (locked || !scale) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      mode: 'move',
      startX: event.clientX,
      startY: event.clientY,
      startCm: estimateCm,
      anchor: mysteryAnchor,
    };
  };

  const startResize = (event: PointerEvent<HTMLButtonElement>) => {
    if (locked || !scale) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      mode: 'resize',
      startX: event.clientX,
      startY: event.clientY,
      startCm: estimateCm,
      anchor: mysteryAnchor,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId || !scale || !width || !height) return;

    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;

    if (current.mode === 'resize') {
      // Work in screen ratios rather than absolute cm. Linear axes grow with
      // the span; area grows with the square of the span, keeping the visible
      // painted area proportional to the estimate for maps.
      const startDims = visualDimensionsCm(target, current.startCm, targetArt.frame);
      const startSpanPx =
        (target.axis === 'height' ? startDims.heightCm : startDims.widthCm) * scale;
      if (!startSpanPx) return;
      const spanDeltaPx = target.axis === 'height' ? -dy : 2 * dx;
      const ratio = Math.max(0.1, (startSpanPx + spanDeltaPx) / startSpanPx);
      const nextCm =
        target.axis === 'area' ? current.startCm * ratio * ratio : current.startCm * ratio;
      onEstimateChange(nextCm);
      return;
    }

    setTargetAnchor(
      clampAnchor(
        { x: current.anchor.x + dx / width, y: current.anchor.y + dy / height },
        mysteryDims.widthCm * scale,
        mysteryDims.heightCm * scale,
      ),
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    // Area is quadratic: a 5% linear step is a 10.25% area step.
    const step = target.axis === 'area' ? KEYBOARD_STEP * KEYBOARD_STEP : KEYBOARD_STEP;
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      event.preventDefault();
      onEstimateChange(estimateCm * step);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      event.preventDefault();
      onEstimateChange(estimateCm / step);
    }
  };

  const endDrag = (event: PointerEvent<HTMLElement>) => {
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  };

  useEffect(() => {
    const node = mysteryRef.current;
    if (!node || locked) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta =
        event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1);
      const factor = Math.min(1.33, Math.max(0.75, Math.exp(-delta * WHEEL_STEP)));
      // A wheel notch changes linear size by `factor`; area follows factor².
      const next =
        target.axis === 'area'
          ? latestEstimateCm.current * factor * factor
          : latestEstimateCm.current * factor;
      changeEstimate.current(next);
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => node.removeEventListener('wheel', handleWheel);
  }, [artReady, locked, target.axis]);

  const boxStyle = (box: { left: number; top: number; w: number; h: number }) => ({
    left: box.left,
    top: box.top,
    width: box.w,
    height: box.h,
  });

  // Attach the grip to the painted silhouette edge, not the bounding-box
  // corner. Curved, stretched or tailed shapes leave that corner transparent.
  const gripHorizontal = target.axis !== 'height';
  const gripLeft = gripHorizontal ? 100 : (targetArt.frame?.topAnchor ?? 0.5) * 100;
  const gripTop = gripHorizontal ? (targetArt.frame?.rightAnchor ?? 0.5) * 100 : 0;

  // Maps are the one field where the reference's real area is public during
  // play: it is the numeric anchor. The mystery line shows the player's live
  // estimate, never the answer — the actual value replaces it after lock.
  const referenceValue =
    reference.unit === 'area'
      ? formatMeasurement(reference.cm, reference.unit, lang)
      : undefined;
  const mysteryValue =
    target.unit === 'area'
      ? locked
        ? formatMeasurement(target.cm, target.unit, lang)
        : `≈ ${formatMeasurement(estimateCm, target.unit, lang)}`
      : undefined;

  // On a phone the two silhouettes sit close together, so captions centred on
  // each shape can collide. Pin them to the outer quarters instead; the colours
  // still tie each caption to its shape.
  const narrowStage = width > 0 && width < 480;
  const referenceCaptionX = narrowStage ? width * 0.25 : referenceCx;
  const targetCaptionX = narrowStage ? width * 0.75 : liveTargetCx;

  return (
    <div
      ref={stageRef}
      dir="ltr"
      data-testid="game-stage"
      data-locked={locked ? 'true' : 'false'}
      className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-line bg-stage shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)] sm:h-[520px]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(57,142,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(57,142,255,0.07) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 h-px"
        style={{ top: baselineY, backgroundColor: BASELINE_COLOR, boxShadow: `0 0 12px ${BASELINE_COLOR}` }}
      />

      {!locked && (
        <div
          className={`pointer-events-none absolute top-3 z-10 ${
            dir === 'rtl' ? 'right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2' : 'left-3 sm:left-1/2 sm:-translate-x-1/2'
          }`}
        >
          <p className="rounded-full border border-line bg-canvas/80 px-3 py-1 text-[11px] font-medium text-ink-muted shadow-lg backdrop-blur">
            {t('eyeHint')}
          </p>
        </div>
      )}

      {artReady && (
        <>
          <div
            className={`pointer-events-none absolute z-10 ${
              locked ? 'transition-[left,top,width,height] duration-700 ease-out' : ''
            }`}
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
            ref={mysteryRef}
            data-testid="mystery-object"
            className={`absolute touch-none ${
              locked
                ? 'transition-[left,top,width,height] duration-700 ease-out'
                : 'cursor-grab active:cursor-grabbing'
            }`}
            style={boxStyle(mysteryBox)}
            onPointerDown={locked ? undefined : handlePointerDown}
            onPointerMove={locked ? undefined : handlePointerMove}
            onPointerUp={locked ? undefined : endDrag}
            onPointerCancel={locked ? undefined : endDrag}
          >
            <SilhouetteObject
              src={target.imagePath}
              name={targetName}
              color={locked ? ANSWER_COLOR : MYSTERY_COLOR}
              frame={targetArt.frame}
            />
            {!locked && scale > 0 && (
              <button
                type="button"
                aria-label={t('resizeHandle')}
                onPointerDown={startResize}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={handleKeyDown}
                style={{ left: `${gripLeft}%`, top: `${gripTop}%` }}
                className={`absolute z-30 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 touch-none place-items-center rounded-md border border-white/20 bg-night/85 text-white shadow-[0_4px_16px_rgba(0,0,0,0.6)] backdrop-blur transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mystery ${
                  target.axis === 'height' ? 'cursor-ns-resize' : 'cursor-ew-resize'
                }`}
              >
                <MoveDiagonal2 size={17} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {locked && (
            <div className="pointer-events-none absolute opacity-60" style={boxStyle(estimateBox)}>
              <SilhouetteObject
                src={target.imagePath}
                name={t('yourAnswerSuffix', { name: targetName })}
                color={MYSTERY_COLOR}
                frame={targetArt.frame}
              />
            </div>
          )}
        </>
      )}

      <div className={`absolute top-3 z-20 ${dir === 'rtl' ? 'left-3 sm:left-4' : 'right-3 sm:right-4'}`}>
        <ZoomControls zoomIndex={zoomIndex} onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
      </div>

      {artReady && scale > 0 && (
        <>
          <ObjectCaption
            name={t('referenceName', { name: referenceName })}
            value={referenceValue}
            color={REFERENCE_COLOR}
            centerX={referenceCaptionX}
            top={Math.max(8, referenceBox.top - (referenceValue ? 42 : 28))}
          />
          <ObjectCaption
            name={t('mysteryName', { name: targetName })}
            value={mysteryValue}
            color={locked ? ANSWER_COLOR : MYSTERY_COLOR}
            centerX={targetCaptionX}
            top={Math.max(8, mysteryBox.top - (mysteryValue ? 42 : 28))}
          />
        </>
      )}
    </div>
  );
}

function ObjectCaption({
  name,
  value,
  color,
  centerX,
  top,
}: {
  name: string;
  value?: string;
  color: string;
  centerX: number;
  top: number;
}) {
  return (
    <div
      className={`pointer-events-none absolute z-20 w-44 max-w-[46%] -translate-x-1/2 text-center ${
        value ? 'rounded-lg border border-white/10 bg-night/75 px-2 py-1 backdrop-blur-sm' : ''
      }`}
      style={{ left: centerX, top, color }}
    >
      <p className="truncate text-[10px] font-bold leading-tight drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] sm:text-[11px]">{name}</p>
      {value && (
        <p className="whitespace-nowrap text-[9px] font-bold leading-tight tabular-nums drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] sm:text-[11px]">
          {value}
        </p>
      )}
    </div>
  );
}
