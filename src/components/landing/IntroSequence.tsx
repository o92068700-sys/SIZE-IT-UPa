import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';

const SEEN_KEY = 'scale-clash:intro-seen';

function shouldPlay() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return window.sessionStorage.getItem(SEEN_KEY) !== '1';
  } catch {
    return true;
  }
}

export default function IntroSequence() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(shouldPlay);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!visible) return;
    document.body.style.overflow = 'hidden';
    const readyTimer = window.setTimeout(() => setReady(true), 1500);
    const doneTimer = window.setTimeout(() => {
      setVisible(false);
      try {
        window.sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        // Ignore storage errors.
      }
    }, 2250);

    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = '';
    };
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    document.body.style.overflow = '';
    try {
      window.sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // Ignore storage errors.
    }
  };

  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t('introCalibrating')}
          className="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-night px-5 py-5 sm:px-8 sm:py-7"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex items-start justify-between text-xs font-medium text-ink-muted">
            <span className="font-display text-sm font-extrabold tracking-[0.14em] text-ink">SizIQ</span>
            <button
              type="button"
              autoFocus
              onClick={dismiss}
              className="rounded-md border border-line px-2.5 py-1 text-xs text-ink-muted transition hover:border-ink-muted hover:text-ink"
            >
              {t('introSkip')}
            </button>
          </div>

          <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center">
            <div className="absolute inset-x-0 top-1/2 h-px bg-line" aria-hidden="true" />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-1/2 h-px origin-center bg-paper/70"
              aria-hidden="true"
            />
            <div className="absolute top-1/2 h-24 w-px -translate-y-1/2 bg-paper/30" aria-hidden="true" />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex flex-col items-center bg-night px-6 py-4 text-center"
            >
              <p className="text-xs font-medium text-ink-muted">{t('appTagline')}</p>
              <p className="mt-3 font-display text-2xl font-extrabold text-paper sm:text-4xl">
                {ready ? t('introReady') : t('introCalibrating')}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-onair" aria-hidden="true" />
                <span className="text-[11px] font-medium tabular-nums text-ink-muted">
                  {ready ? '100%' : t('introHint')}
                </span>
              </div>
            </motion.div>
          </div>

          <div className="relative" aria-hidden="true">
            <div className="flex h-10 items-end justify-between border-b border-paper/30">
              {Array.from({ length: 33 }).map((_, index) => (
                <span
                  key={index}
                  className="w-px bg-paper/40"
                  style={{ height: index % 4 === 0 ? 18 : index % 2 === 0 ? 11 : 6 }}
                />
              ))}
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
              className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-onair"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
