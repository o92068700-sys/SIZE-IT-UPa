import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { CategoryId } from '@/types/game';

interface CategorySelectProps {
  onSelect: (categoryId: CategoryId) => void;
}

export default function CategorySelect({ onSelect }: CategorySelectProps) {
  const { lang, t } = useLanguage();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-action">{t('kicker')}</p>
        <h1 className="mt-3 text-3xl font-bold leading-[1.2] text-ink sm:text-5xl">{t('heroTitle')}</h1>
        <p className="mt-4 text-base leading-[1.5] text-ink-muted sm:text-lg">{t('heroSubtitle')}</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const name = lang === 'ar' ? category.nameAr ?? category.name : category.name;
          const description =
            lang === 'ar' ? category.descriptionAr ?? category.description : category.description;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className="group flex flex-col rounded-2xl border border-line bg-stage p-6 text-start transition duration-200 hover:-translate-y-1 hover:border-reference/70 hover:shadow-[0_20px_40px_-20px_rgba(57,142,255,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reference"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-reference/15 text-reference transition group-hover:bg-reference group-hover:text-canvas">
                <Icon size={22} />
              </span>
              <span className="mt-5 text-lg font-semibold text-ink">{name}</span>
              <span className="mt-2 text-sm leading-[1.5] text-ink-muted">{description}</span>
              <span className="mt-6 flex items-center justify-between text-xs font-medium text-ink-muted">
                <span>{t('objectCount', { count: category.objects.length })}</span>
                <span className="flex items-center gap-1 text-ink transition group-hover:text-reference">
                  {t('play')}
                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
