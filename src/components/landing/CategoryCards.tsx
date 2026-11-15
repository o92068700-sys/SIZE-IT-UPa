import { ArrowRight } from 'lucide-react';
import SilhouetteObject from '@/components/SilhouetteObject';
import { CATEGORIES, type Category } from '@/data/categories';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import { imagePathFor } from '@/lib/challenges';
import type { CategoryId, GameObject } from '@/types/game';

interface CategoryCardsProps {
  onSelect: (categoryId: CategoryId) => void;
}

const ACCENTS: Record<string, { color: string; chip: string }> = {
  mixed: { color: '#F5A623', chip: 'bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/25' },
  landmarks: { color: '#5B8CFF', chip: 'bg-reference/10 text-reference border-reference/25' },
  animals: { color: '#FF2D55', chip: 'bg-mystery/10 text-mystery border-mystery/25' },
  'maps-easy': { color: '#34D399', chip: 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/25' },
  'maps-medium': { color: '#22D3EE', chip: 'bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/25' },
  'maps-hard': { color: '#818CF8', chip: 'bg-[#818CF8]/10 text-[#818CF8] border-[#818CF8]/25' },
};

const DIFFICULTY_KEYS: Record<1 | 2 | 3, TranslationKey> = {
  1: 'difficultyEasy',
  2: 'difficultyMedium',
  3: 'difficultyHard',
};

export default function CategoryCards({ onSelect }: CategoryCardsProps) {
  const { t, lang } = useLanguage();

  return (
    <section id="categories" className="relative border-b border-line py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold text-ink sm:text-5xl">{t('categoriesTitle')}</h2>
          <p className="mt-4 text-base leading-[1.7] text-ink-muted sm:text-lg">{t('categoriesSubtitle')}</p>
        </div>

        <a
          href="#lab"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-onair/30 bg-onair/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-onair transition hover:bg-onair/20"
        >
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-onair" aria-hidden="true" />
          {t('labTeaser')}
        </a>

        <div className="mt-12 grid auto-rows-fr gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onSelect={onSelect}
              lang={lang}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CategoryCardProps {
  category: Category;
  lang: 'ar' | 'en';
  onSelect: (categoryId: CategoryId) => void;
}

function CategoryCard({ category, lang, onSelect }: CategoryCardProps) {
  const { t } = useLanguage();
  const accent = ACCENTS[category.id] ?? ACCENTS.landmarks;
  const name = lang === 'ar' ? category.nameAr ?? category.name : category.name;
  const description = lang === 'ar' ? category.descriptionAr ?? category.description : category.description;
  const Icon = category.icon;

  const averageDifficulty = Math.round(
    category.objects.reduce((sum, object) => sum + object.difficulty, 0) / category.objects.length,
  ) as 1 | 2 | 3;

  const tallest = category.objects.reduce((best, object) => (object.cm > best.cm ? object : best), category.objects[0]);
  const heroObject: GameObject = {
    ...tallest,
    categoryId: category.id,
    imagePath: imagePathFor(category.id, tallest),
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className="group relative overflow-hidden rounded-2xl border border-line bg-studio p-6 text-start transition duration-300 hover:border-paper/40 hover:shadow-[0_30px_70px_-40px_rgba(0,0,0,0.9)] sm:p-7"
    >
      <div className="absolute inset-0 bg-blueprint opacity-50" aria-hidden="true" />
      <div
        className="absolute -end-4 bottom-0 h-64 w-40 opacity-20 transition duration-500 group-hover:opacity-35 sm:h-72"
        style={{ color: accent.color }}
        aria-hidden="true"
      >
        <SilhouetteObject src={heroObject.imagePath} name={tallest.en} color={accent.color} />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60"
        style={{ background: `radial-gradient(80% 100% at 80% 0%, ${accent.color}22, transparent 70%)` }}
        aria-hidden="true"
      />

      <div className="relative">
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border"
          style={{ borderColor: `${accent.color}44`, backgroundColor: `${accent.color}18`, color: accent.color }}
        >
          <Icon size={21} />
        </span>

        <h3 className="mt-6 font-display text-2xl font-extrabold text-ink sm:text-3xl">{name}</h3>
        <p className="mt-3 max-w-sm text-sm leading-[1.7] text-ink-muted">{description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <span className="font-semibold text-paper">{t('objectsCount', { count: category.objects.length })}</span>
          <span className="text-ink-muted">{t('statRounds', { count: category.objects.length })}</span>
          <span className="text-ink-muted">
            {t('difficulty')}: <span className="font-semibold text-ink">{t(DIFFICULTY_KEYS[averageDifficulty])}</span>
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {(category.sampleIds
            ? category.sampleIds
                .map((id) => category.objects.find((object) => object.id === id))
                .filter((object): object is NonNullable<typeof object> => object !== undefined)
            : category.objects.slice(0, 4)
          ).map((object) => (
            <span
              key={object.id}
              className={`rounded border px-2 py-0.5 text-[11px] font-medium ${accent.chip}`}
            >
              {lang === 'ar' ? object.ar : object.en}
            </span>
          ))}
        </div>

        <span className="mt-8 inline-flex items-center gap-1.5 font-display text-sm font-bold text-ink transition group-hover:gap-2.5">
          {t('startCategory')}
          <ArrowRight size={15} className="rtl:rotate-180" />
        </span>
      </div>
    </button>
  );
}
