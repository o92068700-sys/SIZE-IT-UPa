import { useState } from 'react';
import { Check } from 'lucide-react';
import SilhouetteObject from '@/components/SilhouetteObject';
import { useLanguage } from '@/i18n/LanguageProvider';
import { MYSTERY_COLOR, REFERENCE_COLOR } from '@/lib/colors';

const REFERENCE_HEIGHT = 118;
const MIN_HEIGHT = 26;
const MAX_HEIGHT = 168;

export default function DragDemo() {
  const { t } = useLanguage();
  const [height, setHeight] = useState(74);
  const matched = Math.abs(height - REFERENCE_HEIGHT) <= 7;

  return (
    <div>
      <div className="relative mt-4 h-52 overflow-hidden rounded-xl border border-line bg-night">
        <div className="absolute inset-0 bg-blueprint-fine opacity-50" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-8 border-t border-dashed border-ink/25" aria-hidden="true" />

        <div className="relative flex h-full items-end justify-center gap-8 pb-8 sm:gap-12">
          <div className="flex flex-col items-center">
            <div style={{ height: REFERENCE_HEIGHT, aspectRatio: 0.42, maxWidth: '30%' }}>
              <SilhouetteObject src="/assets/objects/landmarks/big-ben.svg" name={t('reference')} color={REFERENCE_COLOR} />
            </div>
            <span className="mt-1.5 text-[10px] font-medium text-ink-muted">{t('reference')}</span>
          </div>

          <div className="relative flex flex-col items-center">
            <div
              className="relative transition-[height] duration-75"
              style={{ height, aspectRatio: 0.42, maxWidth: '30%' }}
            >
              <SilhouetteObject src="/assets/objects/landmarks/big-ben.svg" name={t('mystery')} color={MYSTERY_COLOR} />
              <span className="absolute inset-y-0 -right-2 border-r border-dashed border-mystery/60" aria-hidden="true" />
              <span className="absolute -right-3.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-night bg-mystery" aria-hidden="true" />
            </div>
            <span className="mt-1.5 text-[10px] font-medium text-ink-muted">{t('mystery')}</span>
          </div>
        </div>

        {matched && (
          <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full border border-kick/40 bg-kick/10 px-2 py-1 text-[10px] font-bold text-kick">
            <Check size={11} />
            {t('demoMatch')}
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] font-medium text-ink-muted">
          <span>{t('demoSmaller')}</span>
          <span>{t('demoBigger')}</span>
        </div>
        <input
          type="range"
          min={MIN_HEIGHT}
          max={MAX_HEIGHT}
          value={height}
          onChange={(event) => setHeight(Number(event.target.value))}
          aria-label={t('howDemoLabel')}
          className="mt-1 h-2 w-full cursor-ew-resize appearance-none rounded-full bg-line accent-onair"
        />
      </div>
    </div>
  );
}
