import DragDemo from '@/components/landing/DragDemo';
import { useLanguage } from '@/i18n/LanguageProvider';

const STEPS = [
  { title: 'howStep1Title', body: 'howStep1Body' },
  { title: 'howStep2Title', body: 'howStep2Body' },
  { title: 'howStep3Title', body: 'howStep3Body' },
] as const;

export default function HowToPlay() {
  const { t } = useLanguage();

  return (
    <section id="how" className="relative scroll-mt-20 border-b border-line py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-balance font-display text-3xl font-extrabold text-ink sm:text-5xl">{t('howTitle')}</h2>
          <p className="mt-4 text-base leading-[1.7] text-ink-muted sm:text-lg">{t('howSubtitle')}</p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <ol className="relative space-y-8">
            <span className="absolute bottom-4 top-4 start-[19px] w-px bg-line" aria-hidden="true" />
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative flex gap-5">
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-night font-display text-sm font-bold tabular-nums text-paper">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="pt-0.5">
                  <h3 className="font-display text-lg font-bold text-ink sm:text-xl">{t(step.title)}</h3>
                  <p className="mt-1.5 max-w-md text-sm leading-[1.7] text-ink-muted">{t(step.body)}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="rounded-2xl border border-line bg-studio/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
              <p className="font-display text-sm font-bold text-paper">{t('howDemoLabel')}</p>
              <p className="text-[11px] text-ink-muted">{t('howDemoHint')}</p>
            </div>

            <DragDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
