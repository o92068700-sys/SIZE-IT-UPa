import { Languages, LayoutGrid, Play, Radio } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { formatPoints } from '@/lib/format';

interface TopNavProps {
  roundLabel?: string;
  score?: number;
  onExit?: () => void;
  exitLabel?: string;
  onOnline?: () => void;
  showSections?: boolean;
}

const KICK_URL = 'https://kick.com/maherco';

export default function TopNav({
  roundLabel,
  score,
  onExit,
  exitLabel,
  onOnline,
  showSections = false,
}: TopNavProps) {
  const { lang, toggleLang, t } = useLanguage();
  const nextLanguageLabel = lang === 'ar' ? 'English' : 'العربية';

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-night/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#top" className="group flex items-center gap-2.5" aria-label="SizIQ">
          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-paper text-night">
            <span className="absolute inset-x-0 bottom-0 h-2.5 border-t border-night/40" aria-hidden="true" />
            <span className="absolute bottom-0 left-[18%] h-2 w-px bg-night/50" aria-hidden="true" />
            <span className="absolute bottom-0 left-[42%] h-3 w-px bg-night/60" aria-hidden="true" />
            <span className="absolute bottom-0 left-[66%] h-1.5 w-px bg-night/50" aria-hidden="true" />
            <span className="absolute bottom-0 left-[82%] h-3 w-px bg-onair" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[15px] font-extrabold tracking-[0.12em] text-ink">SizIQ</span>
            <span className="mt-1 text-[10px] font-medium text-ink-muted">{t('dedicationTag')}</span>
          </span>
        </a>

        {showSections && (
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-muted lg:flex">
            <a href="#how" className="transition hover:text-ink">
              {t('navHow')}
            </a>
            <a href="#categories" className="transition hover:text-ink">
              {t('navCategories')}
            </a>
            <a href="#lab" className="transition hover:text-ink">
              {t('navLab')}
            </a>
            <a href="#dedication" className="transition hover:text-ink">
              {t('dedicationKicker')}
            </a>
          </nav>
        )}

        {roundLabel && (
          <div className="flex items-center gap-2 text-sm sm:gap-5">
            <span className="rounded-full border border-line px-3 py-1 font-medium tabular-nums text-ink-muted">
              {roundLabel}
            </span>
            {score !== undefined && (
              <span className="font-display font-bold tabular-nums text-ink">
                <span className="hidden text-xs font-medium text-ink-muted sm:inline">{t('score')} </span>
                {formatPoints(score)}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {onOnline && (
            <button
              type="button"
              onClick={onOnline}
              className="inline-flex items-center gap-2 rounded-lg border border-reference/40 bg-reference/10 px-3 py-2 text-sm font-bold text-ink transition hover:border-reference hover:bg-reference/20"
            >
              <Radio size={15} className="text-reference" />
              <span className="hidden sm:inline">{t('navOnline')}</span>
            </button>
          )}

          {showSections && (
            <a
              href="#categories"
              className="hidden items-center gap-2 rounded-lg bg-onair px-3.5 py-2 text-sm font-bold text-night transition hover:brightness-110 sm:inline-flex"
            >
              <Play size={15} className="fill-night" />
              {t('navPlay')}
            </a>
          )}

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink-muted transition hover:border-ink-muted hover:text-ink"
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">{exitLabel ?? t('categories')}</span>
            </button>
          )}

          <a
            href={KICK_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink-muted transition hover:border-kick/60 hover:text-kick md:inline-flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-kick" aria-hidden="true" />
            KICK
          </a>

          <button
            type="button"
            onClick={toggleLang}
            aria-label={t('languageToggleLabel')}
            title={t('languageToggleLabel')}
            className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink-muted transition hover:border-reference hover:text-reference"
          >
            <Languages size={16} />
            <span className="hidden sm:inline">{nextLanguageLabel}</span>
            <span className="sm:hidden">{t('languageShort')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
