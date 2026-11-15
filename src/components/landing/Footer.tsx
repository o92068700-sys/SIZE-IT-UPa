import { useLanguage } from '@/i18n/LanguageProvider';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded bg-paper">
            <span className="absolute inset-x-0 bottom-0 h-2 border-t border-night/40" aria-hidden="true" />
            <span className="absolute bottom-0 left-[30%] h-2.5 w-px bg-night/60" aria-hidden="true" />
            <span className="absolute bottom-0 left-[70%] h-1.5 w-px bg-onair" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-xs font-extrabold tracking-[0.14em] text-ink">SIZE IT UP</p>
            <p className="text-[10px] text-ink-muted">{t('footerTagline')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-muted">
          <a href="#how" className="transition hover:text-ink">
            {t('navHow')}
          </a>
          <a href="#categories" className="transition hover:text-ink">
            {t('navCategories')}
          </a>
          <a href="#lab" className="transition hover:text-ink">
            {t('navLab')}
          </a>
          <a href="#leaderboard" className="transition hover:text-ink">
            {t('navLeaderboard')}
          </a>
          <a href="#dedication" className="transition hover:text-ink">
            {t('footerDedication')}
          </a>
          <a href="#credits" className="transition hover:text-ink">
            {t('footerCredits')}
          </a>
        </div>

        <div className="flex flex-col gap-1.5 sm:items-end">
          <p className="text-[11px] text-ink-muted">© 2026 · {t('footerRights')}</p>
          <a
            href="https://github.com/djaiss/mapsicon"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-ink-muted/80 transition hover:text-ink"
          >
            {t('footerMapCredit')}
          </a>
        </div>
      </div>
    </footer>
  );
}
