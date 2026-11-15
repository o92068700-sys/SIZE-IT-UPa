import { Minus, Plus } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { ZOOM_LEVELS } from '@/lib/gameConfig';

interface ZoomControlsProps {
  zoomIndex: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({ zoomIndex, onZoomIn, onZoomOut }: ZoomControlsProps) {
  const { t } = useLanguage();
  const canZoomIn = zoomIndex < ZOOM_LEVELS.length - 1;
  const canZoomOut = zoomIndex > 0;
  const buttonClass =
    'flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B0C14]/80 text-ink transition hover:bg-line hover:text-white disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex items-center gap-1 rounded-xl border border-line bg-stage/90 p-1 shadow-lg backdrop-blur">
      <button
        type="button"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        aria-label={t('zoomOut')}
        className={buttonClass}
      >
        <Minus size={18} />
      </button>
      <span className="w-14 text-center text-xs font-semibold tabular-nums text-ink-muted">
        {Math.round(ZOOM_LEVELS[zoomIndex] * 100)}%
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        aria-label={t('zoomIn')}
        className={buttonClass}
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
