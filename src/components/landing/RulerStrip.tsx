import { useLanguage } from '@/i18n/LanguageProvider';
import type { Lang } from '@/i18n/translations';
import { formatLength } from '@/lib/format';
import { RULER_TICKS } from '@/lib/scale';

function tickLabel(cm: number, lang: Lang) {
  if (cm >= 100_000) return lang === 'ar' ? '1.00 كم' : '1.00 km';
  return formatLength(cm, lang);
}

export default function RulerStrip({ className = '' }: { className?: string }) {
  const { lang } = useLanguage();
  const majors = RULER_TICKS.filter((tick) => tick.major);

  return (
    <div className={`relative overflow-hidden border-y border-line bg-paper text-night ${className}`} aria-hidden="true">
      <div className="relative mx-auto h-14 max-w-7xl sm:h-16">
        {RULER_TICKS.map((tick) => (
          <span
            key={tick.cm}
            className="absolute bottom-0 w-px bg-night/35"
            style={{ left: `${tick.ratio * 100}%`, height: tick.major ? 22 : 8 }}
          />
        ))}
        {majors.map((tick, index) => {
          const align =
            index === 0 ? 'translateX(0)' : index === majors.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)';
          return (
            <span
              key={`major-${tick.cm}`}
              className="absolute bottom-1.5 whitespace-nowrap text-[10px] font-semibold tabular-nums text-night/70"
              style={{ left: `${tick.ratio * 100}%`, transform: align }}
            >
              {tickLabel(tick.cm, lang)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
