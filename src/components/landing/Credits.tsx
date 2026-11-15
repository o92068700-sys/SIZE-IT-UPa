import { useLanguage } from '@/i18n/LanguageProvider';

/** The builder's portrait, hosted remotely — no image files in the repo. */
const BUILDER_PHOTO = 'https://i.postimg.cc/XYZm9JxX/2064511567.png';

/**
 * Final section: credits for the designer/programmer, presented in the
 * game's own language — the builder shown as the "mystery object", framed
 * in the measuring brackets, with a reveal badge, a live-measurement stat
 * board and the ratio dial reading ×1.00 (designer ÷ programmer).
 */
export default function Credits() {
  const { t } = useLanguage();

  const stats = [
    { label: t('creditsStatsScope'), value: t('creditsStatsScopeValue') },
    { label: t('creditsStatsTemplates'), value: t('creditsStatsTemplatesValue') },
    { label: t('creditsStatsObsession'), value: t('creditsStatsObsessionValue') },
  ];

  return (
    <section id="credits" className="relative overflow-hidden border-b border-line py-20 sm:py-24">
      <div className="absolute inset-0 bg-blueprint opacity-40" aria-hidden="true" />
      <div
        className="absolute -bottom-24 end-1/4 h-72 w-72 rounded-full bg-kick/10 blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        {/* The "mystery object" — identified at last */}
        <div className="relative mx-auto w-full max-w-xs lg:mx-0">
          <div className="absolute -inset-2 rounded-2xl border border-line" aria-hidden="true" />
          <div className="corner-brackets relative aspect-square overflow-hidden rounded-xl border border-line bg-night">
            <img
              src={BUILDER_PHOTO}
              alt={t('creditsAlt')}
              width={800}
              height={800}
              loading="lazy"
              className="h-full w-full object-cover grayscale contrast-110 transition duration-500 hover:grayscale-0"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-night/90 via-transparent to-transparent"
              aria-hidden="true"
            />
            <div className="absolute inset-x-3 top-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-onair/50 bg-onair/15 px-2 py-1 text-[10px] font-medium text-onair">
                <span className="h-1.5 w-1.5 rounded-full bg-onair" aria-hidden="true" />
                {t('creditsMysteryTag')}
              </span>
              <span className="text-[10px] font-medium text-paper/80 tabular-nums">1:1</span>
            </div>
          </div>

          {/* The measurement bracket under the portrait, like on the stage */}
          <div className="mt-5 px-2" aria-hidden="true">
            <div className="relative h-3 border-x border-b border-line">
              <span className="absolute inset-x-7 bottom-0 h-1.5 border-x border-onair/70" />
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-muted">{t('creditsRole')}</p>
        </div>

        {/* The reveal board */}
        <div>
          <p className="text-xs font-medium text-ink-muted">{t('creditsKicker')}</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-ink sm:text-6xl">{t('creditsTitle')}</h2>
          <p className="mt-5 max-w-2xl text-base leading-[1.8] text-ink-muted sm:text-lg">{t('creditsBody')}</p>

          <dl className="mt-8 grid max-w-2xl grid-cols-3 overflow-hidden rounded-xl border border-line bg-night/60 text-center">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={index < stats.length - 1 ? 'border-e border-line p-4 sm:p-5' : 'p-4 sm:p-5'}
              >
                <dd className="font-display text-xl font-extrabold text-paper sm:text-2xl">{stat.value}</dd>
                <dt className="mt-1.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted sm:text-[11px]">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex items-center gap-4">
            <span
              className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-onair/70 bg-night"
              aria-hidden="true"
            >
              <span className="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-onair" />
              <span className="font-display text-sm font-extrabold text-paper tabular-nums">×1.00</span>
            </span>
            <p className="text-xs leading-relaxed text-ink-muted">{t('creditsRatioCaption')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
