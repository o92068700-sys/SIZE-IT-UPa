import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDownRight, ArrowRight, MousePointer2 } from 'lucide-react';
import RulerStrip from '@/components/landing/RulerStrip';
import { CATEGORIES } from '@/data/categories';
import { useLanguage } from '@/i18n/LanguageProvider';

interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const objectCount = CATEGORIES.reduce((sum, category) => sum + category.objects.length, 0);
  const longestField = CATEGORIES.reduce((best, category) => Math.max(best, category.objects.length), 0);

  return (
    <section id="top" className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 bg-blueprint opacity-60" aria-hidden="true" />
      <div
        className="absolute -top-40 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-onair/10 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-[-10%] h-[26rem] w-[26rem] rounded-full bg-reference/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.06fr_0.94fr] lg:gap-10 lg:pb-24 lg:pt-20">
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-ink-muted">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-onair" aria-hidden="true" />
              {t('heroKicker')}
            </span>
            <span className="h-3 w-px bg-line" aria-hidden="true" />
            <span>{t('dedicationTag')}</span>
          </div>

          <div className="relative mt-7 inline-block max-w-full pb-3 pt-4">
            <span className="absolute inset-x-0 top-0 h-px bg-paper/35" aria-hidden="true" />
            <span className="absolute inset-x-0 bottom-0 h-px bg-paper/35" aria-hidden="true" />
            <span className="absolute left-0 top-0 h-3 w-px bg-paper/35" aria-hidden="true" />
            <span className="absolute right-0 top-0 h-3 w-px bg-paper/35" aria-hidden="true" />
            <span className="absolute bottom-0 left-0 h-3 w-px bg-paper/35" aria-hidden="true" />
            <span className="absolute bottom-0 right-0 h-3 w-px bg-paper/35" aria-hidden="true" />
            <span className="absolute -top-2 end-0 bg-night px-1.5 text-[10px] font-semibold tabular-nums text-ink-muted">
              1:1
            </span>

            <h1 className="text-balance font-display text-[clamp(2.9rem,8.6vw,6.6rem)] font-extrabold leading-[0.98] tracking-[-0.03em] text-ink">
              {t('heroTitle')}
            </h1>
          </div>

          <p className="mt-7 max-w-xl text-base leading-[1.7] text-ink-muted sm:text-lg">{t('heroSubtitle')}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-onair px-6 py-3.5 font-display text-sm font-bold text-night transition hover:brightness-110 active:scale-[0.99]"
            >
              {t('ctaStart')}
              <ArrowRight size={17} className="rtl:rotate-180" />
            </button>
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-line px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-paper/50"
            >
              <MousePointer2 size={16} />
              {t('ctaHow')}
            </a>
          </div>

          <dl className="mt-11 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
            <Stat value={String(objectCount)} label={t('statObjectsLabel')} />
            <Stat value={String(longestField)} label={t('statRoundsLabel')} />
            <Stat value="0" label={t('statRulerLabel')} />
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ms-auto">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 26, rotate: 1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border border-line bg-studio p-3 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center justify-between px-1 pb-2.5 text-[10px] font-semibold text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-onair" aria-hidden="true" />
                {t('heroLive')}
              </span>
              <span className="tabular-nums">21:00</span>
              <span className="tracking-[0.16em]">STUDIO 01</span>
            </div>

            <div className="corner-brackets relative aspect-square overflow-hidden rounded-xl bg-night">
              <img
                src="/assets/maherco/maherco-raw.jpg"
                alt={t('heroPhotoCaption')}
                width={447}
                height={447}
                className="h-full w-full scale-[1.02] object-cover saturate-150 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night via-night/25 to-transparent" aria-hidden="true" />
              <div
                className="absolute inset-0 mix-blend-multiply"
                style={{ background: 'radial-gradient(circle at 50% 30%, rgba(255,61,61,0.22), transparent 65%)' }}
                aria-hidden="true"
              />
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute inset-x-0 top-0 h-16 animate-scanline bg-gradient-to-b from-transparent via-paper/10 to-transparent" />
              </div>

              <div className="absolute inset-x-4 bottom-4">
                <p className="text-[10px] font-medium text-paper/70">{t('dedicationSchedule')}</p>
                <p className="mt-1 font-display text-xl font-bold text-paper">{t('heroPhotoCaption')}</p>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 pt-2.5 text-[10px] text-ink-muted">
              <span className="tracking-[0.14em]">SIZE IT UP</span>
              <span className="tabular-nums">1:1</span>
            </div>
          </motion.div>

          <a
            href="#how"
            className="absolute -bottom-14 end-0 hidden items-center gap-1.5 text-[11px] font-medium text-ink-muted transition hover:text-ink sm:inline-flex"
          >
            {t('heroScroll')}
            <ArrowDownRight size={13} className="rtl:rotate-90" />
          </a>
        </div>
      </div>

      <RulerStrip />
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="block font-display text-2xl font-extrabold tabular-nums text-paper sm:text-3xl">{value}</span>
        <span className="mt-1 block text-[11px] leading-tight text-ink-muted">{label}</span>
      </dd>
    </div>
  );
}
