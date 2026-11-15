import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';

const KICK_URL = 'https://kick.com/maherco';

export default function Dedication() {
  const { t } = useLanguage();

  return (
    <section id="dedication" className="relative scroll-mt-20 overflow-hidden border-b border-line py-20 sm:py-24">
      <div className="absolute inset-0 bg-blueprint opacity-40" aria-hidden="true" />
      <div
        className="absolute -top-24 start-1/3 h-72 w-72 rounded-full bg-onair/10 blur-[100px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <div className="relative mx-auto w-full max-w-xs lg:mx-0">
          <div className="absolute -inset-2 rounded-2xl border border-line" aria-hidden="true" />
          <div className="corner-brackets relative aspect-square overflow-hidden rounded-xl border border-line bg-night">
            <img
              src="https://i.postimg.cc/XYZm9JxX/2064511567.png"
              alt={t('dedicationBuilder')}
              width={800}
              height={800}
              loading="lazy"
              className="h-full w-full object-cover grayscale contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-transparent to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-[10px] font-medium text-paper/80">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-kick" aria-hidden="true" />
                KICK
              </span>
              <span className="tabular-nums">1:1</span>
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] text-ink-muted lg:text-start">{t('dedicationBuilder')}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-ink-muted">{t('dedicationKicker')}</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold text-ink sm:text-6xl">{t('dedicationTitle')}</h2>
          <p className="mt-5 max-w-2xl text-base leading-[1.8] text-ink-muted sm:text-lg">{t('dedicationBody')}</p>

          <blockquote className="mt-8 border-s-2 border-onair ps-4">
            <p className="font-display text-xl font-bold leading-snug text-paper sm:text-2xl">{t('dedicationQuote')}</p>
          </blockquote>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={KICK_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-kick/40 bg-kick/10 px-5 py-3 text-sm font-bold text-kick transition hover:bg-kick/20"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-kick" aria-hidden="true" />
              {t('dedicationCta')}
              <ArrowUpRight size={15} className="rtl:-scale-x-100" />
            </a>
            <span className="inline-flex items-center gap-2 text-xs text-ink-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-onair" aria-hidden="true" />
              {t('dedicationSchedule')}
            </span>
          </div>

          <p className="mt-8 text-xs text-ink-muted">{t('dedicationSignature')}</p>
        </div>
      </div>
    </section>
  );
}
