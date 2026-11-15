import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { directionFor, translations, type Dir, type Lang, type TranslationKey } from '@/i18n/translations';

const STORAGE_KEY = 'scale-clash:lang';

type InterpolationVars = Record<string, string | number>;

interface LanguageContextValue {
  lang: Lang;
  dir: Dir;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: TranslationKey, vars?: InterpolationVars) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLang(): Lang | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
  } catch {
    // Ignore storage access errors (private mode, disabled storage, ...).
  }
  return null;
}

function detectLang(): Lang {
  const stored = readStoredLang();
  if (stored) return stored;
  return window.navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

function persistLang(lang: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Ignore storage access errors.
  }
}

function interpolate(template: string, vars?: InterpolationVars) {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (text, [name, value]) => text.split(`{${name}}`).join(String(value)),
    template,
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);
  const dir = directionFor(lang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    persistLang(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((previous) => {
      const next: Lang = previous === 'ar' ? 'en' : 'ar';
      persistLang(next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: InterpolationVars) =>
      interpolate(translations[lang][key] ?? translations.en[key] ?? key, vars),
    [lang],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    document.title = translations[lang].appTitle;
  }, [lang, dir]);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, dir, setLang, toggleLang, t }),
    [lang, dir, setLang, toggleLang, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// The hook lives next to its provider on purpose; the fast-refresh trade-off is acceptable.
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside a LanguageProvider');
  return context;
}
