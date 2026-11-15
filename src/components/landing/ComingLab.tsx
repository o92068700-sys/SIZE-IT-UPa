import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Antenna, Box, Coins, Columns3, Globe2, Medal, Network, Orbit, Sparkles, Swords } from 'lucide-react';
import { COMING_WORLDS, type ComingWorld } from '@/data/comingWorlds';
import { useLanguage } from '@/i18n/LanguageProvider';

const ICONS = {
  space: Orbit,
  maps: Globe2,
  engineering: Antenna,
  hidden: Network,
  ancient: Columns3,
  anime: Swords,
  athletes: Medal,
  fit: Box,
  price: Coins,
} as const;

const THEMES: Record<string, { glow: string; ink: string; stamp: string }> = {
  space: { glow: '#7C5CFF', ink: '#C4B5FD', stamp: 'rgba(124,92,255,0.22)' },
  maps: { glow: '#2EE6A6', ink: '#7DFFD0', stamp: 'rgba(46,230,166,0.18)' },
  engineering: { glow: '#FF8A3D', ink: '#FFC08A', stamp: 'rgba(255,138,61,0.18)' },
  hidden: { glow: '#3DDC97', ink: '#9AF5C8', stamp: 'rgba(61,220,151,0.16)' },
  ancient: { glow: '#E8C36A', ink: '#F3DEAA', stamp: 'rgba(232,195,106,0.2)' },
  anime: { glow: '#FF4FD8', ink: '#FFB3EC', stamp: 'rgba(255,79,216,0.2)' },
  athletes: { glow: '#38BDF8', ink: '#A5DCFF', stamp: 'rgba(56,189,248,0.18)' },
  fit: { glow: '#5B8CFF', ink: '#A9C4FF', stamp: 'rgba(91,140,255,0.18)' },
  price: { glow: '#F5C542', ink: '#FFE38A', stamp: 'rgba(245,197,66,0.22)' },
};

export default function ComingLab() {
  const { t, lang } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);

  const featured = COMING_WORLDS.filter((world) => world.featured);
  const rest = COMING_WORLDS.filter((world) => !world.featured);
  const showcaseFields = rest.filter((world) => world.kind === 'field' && world.showcase);
  const standardFields = rest.filter((world) => world.kind === 'field' && !world.showcase);
  const modes = rest.filter((world) => world.kind === 'mode');

  const ticker = useMemo(() => {
    const bits = COMING_WORLDS.flatMap((world) =>
      world.matchups.map((match) =>
        lang === 'ar' ? `${match.aAr}  ×  ${match.bAr}` : `${match.a}  ×  ${match.b}`,
      ),
    );
    return [...bits, ...bits];
  }, [lang]);

  return (
    <section id="lab" className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 bg-night" aria-hidden="true" />
      <div className="absolute inset-0 bg-starfield opacity-80" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-32 start-[-10%] h-[28rem] w-[28rem] rounded-full bg-[#7C5CFF]/18 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[-20%] end-[-8%] h-[26rem] w-[26rem] rounded-full bg-onair/12 blur-[120px]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-paper/50 to-transparent" />

      <div className="relative border-b border-line/70 bg-night/40 py-3">
        <div className="mask-fade-x overflow-hidden">
          <div className={`flex w-max gap-10 whitespace-nowrap text-[11px] font-semibold tracking-[0.18em] text-ink-muted ${reduceMotion ? '' : 'animate-ticker-x'}`}>
            {ticker.map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-10">
                <span>{item}</span>
                <span className="text-onair">●</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-paper/20 bg-paper/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-paper">
              <Sparkles size={12} className="text-onair" />
              {t('labKicker')}
            </p>
            <h2 className="mt-5 text-balance font-display text-3xl font-extrabold text-ink sm:text-6xl">
              {t('labTitle')}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-[1.75] text-ink-muted sm:text-lg">{t('labSubtitle')}</p>
          </div>

          <div className="flex items-center gap-4 self-start rounded-2xl border border-line bg-studio/80 px-4 py-3 lg:self-auto">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-onair opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-onair" />
            </span>
            <div>
              <p className="font-display text-xs font-extrabold tracking-[0.16em] text-ink">{t('labLive')}</p>
              <p className="text-[11px] text-ink-muted">{t('labCount', { count: COMING_WORLDS.length })}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {featured.map((world, index) => (
            <FeaturedCard
              key={world.id}
              world={world}
              index={index}
              open={openId === world.id}
              onToggle={() => setOpenId((current) => (current === world.id ? null : world.id))}
            />
          ))}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {standardFields.slice(0, 3).map((world, index) => (
            <WorldCard
              key={world.id}
              world={world}
              index={index + 2}
              open={openId === world.id}
              onToggle={() => setOpenId((current) => (current === world.id ? null : world.id))}
            />
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {showcaseFields.map((world, index) => (
            <ShowcaseCard
              key={world.id}
              world={world}
              index={index + 5}
              open={openId === world.id}
              onToggle={() => setOpenId((current) => (current === world.id ? null : world.id))}
            />
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {modes.map((world, index) => (
            <ModeCard
              key={world.id}
              world={world}
              index={index + 7}
              open={openId === world.id}
              onToggle={() => setOpenId((current) => (current === world.id ? null : world.id))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface CardProps {
  world: ComingWorld;
  index: number;
  open: boolean;
  onToggle: () => void;
}

function FeaturedCard({ world, index, open, onToggle }: CardProps) {
  const { t, lang } = useLanguage();
  const theme = THEMES[world.id];
  const Icon = ICONS[world.id as keyof typeof ICONS];
  const name = lang === 'ar' ? world.nameAr : world.name;
  const tagline = lang === 'ar' ? world.taglineAr : world.tagline;
  const description = lang === 'ar' ? world.descriptionAr : world.description;
  const measure = lang === 'ar' ? world.measureAr : world.measure;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className="group relative min-h-[340px] overflow-hidden rounded-3xl border border-line bg-studio text-start shadow-[0_40px_90px_-50px_rgba(0,0,0,0.9)]"
    >
      <WorldBackdrop id={world.id} color={theme.glow} />
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: `radial-gradient(90% 80% at 100% 0%, ${theme.glow}33, transparent 58%)` }}
      />
      <DevelopmentStamp />

      <div className="relative flex h-full flex-col p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <span
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl border"
            style={{ borderColor: `${theme.glow}55`, backgroundColor: `${theme.glow}18`, color: theme.ink }}
          >
            <Icon size={22} />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-onair/40 bg-onair/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-onair">
            <span className="h-1.5 w-1.5 rounded-full bg-onair" />
            {t('labPriority')}
          </span>
        </div>

        <p className="mt-8 font-mono text-[11px] tracking-[0.22em] text-ink-muted">{world.code}</p>
        <h3 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">{name}</h3>
        <p className="mt-2 text-sm font-medium" style={{ color: theme.ink }}>
          {tagline}
        </p>
        <p className="mt-4 max-w-md text-sm leading-[1.7] text-ink-muted">{description}</p>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/70">{measure}</p>

        <div className="mt-auto pt-6">
          <Matchups world={world} strong />
        </div>
      </div>
    </motion.button>
  );
}

function WorldCard({ world, index, open, onToggle }: CardProps) {
  const { t, lang } = useLanguage();
  const theme = THEMES[world.id];
  const Icon = ICONS[world.id as keyof typeof ICONS];
  const name = lang === 'ar' ? world.nameAr : world.name;
  const tagline = lang === 'ar' ? world.taglineAr : world.tagline;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative min-h-[280px] overflow-hidden rounded-3xl border border-line bg-studio text-start"
    >
      <WorldBackdrop id={world.id} color={theme.glow} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(80% 70% at 0% 0%, ${theme.glow}22, transparent 60%)` }}
      />
      <DevelopmentStamp compact />

      <div className="relative flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border"
            style={{ borderColor: `${theme.glow}44`, color: theme.ink }}
          >
            <Icon size={18} />
          </span>
          <span className="font-mono text-[10px] tracking-[0.18em] text-ink-muted">{world.code}</span>
        </div>
        <h3 className="mt-6 font-display text-2xl font-extrabold text-ink">{name}</h3>
        <p className="mt-2 text-sm text-ink-muted">{tagline}</p>
        <div className="mt-auto pt-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-paper/50">{t('labDuel')}</p>
          <Matchups world={world} />
        </div>
      </div>
    </motion.button>
  );
}

/**
 * The wide creative card for worlds that deserve more than a grid tile.
 * Same system as the other cards — stamp, theme, code, matchups — plus a
 * bespoke strip that already plays with the world's measuring idea.
 */
function ShowcaseCard({ world, index, open, onToggle }: CardProps) {
  const { lang } = useLanguage();
  const theme = THEMES[world.id];
  const Icon = ICONS[world.id as keyof typeof ICONS];
  const name = lang === 'ar' ? world.nameAr : world.name;
  const tagline = lang === 'ar' ? world.taglineAr : world.tagline;
  const description = lang === 'ar' ? world.descriptionAr : world.description;
  const measure = lang === 'ar' ? world.measureAr : world.measure;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className="group relative min-h-[320px] overflow-hidden rounded-3xl border border-line bg-studio text-start shadow-[0_40px_90px_-50px_rgba(0,0,0,0.9)]"
    >
      <WorldBackdrop id={world.id} color={theme.glow} />
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: `radial-gradient(90% 80% at 100% 0%, ${theme.glow}33, transparent 58%)` }}
      />
      <DevelopmentStamp />

      <div className="relative flex h-full flex-col p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <span
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl border"
            style={{ borderColor: `${theme.glow}55`, backgroundColor: `${theme.glow}18`, color: theme.ink }}
          >
            <Icon size={22} />
          </span>
          <span className="font-mono text-[11px] tracking-[0.22em] text-ink-muted">{world.code}</span>
        </div>

        <h3 className="mt-6 font-display text-3xl font-extrabold text-ink sm:text-4xl">{name}</h3>
        <p className="mt-2 text-sm font-medium" style={{ color: theme.ink }}>
          {tagline}
        </p>
        <p className="mt-3 max-w-md text-sm leading-[1.7] text-ink-muted">{description}</p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/70">{measure}</p>

        <div className="mt-auto pt-6">
          {world.id === 'anime' ? <AnimeHeightChart glow={theme.glow} ink={theme.ink} /> : <AthletesLineup glow={theme.glow} ink={theme.ink} />}
        </div>
        <div className="mt-4">
          <Matchups world={world} strong />
        </div>
      </div>
    </motion.button>
  );
}

/** Anime strip: three bars on one baseline, the tallest dwarfs the rest. */
function AnimeHeightChart({ glow, ink }: { glow: string; ink: string }) {
  const { t } = useLanguage();
  const bars = [
    { label: '×1', height: 'h-8' },
    { label: '×6', height: 'h-14' },
    { label: '×37', height: 'h-24' },
  ];

  return (
    <div className="rounded-xl border bg-night/40 px-4 pb-3 pt-3" style={{ borderColor: `${glow}40` }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: ink }}>
        {t('labAnimeScale')}
      </p>
      <div className="mt-2 flex items-end gap-6">
        {bars.map((bar, i) => (
          <div key={bar.label} className="flex flex-1 flex-col items-center gap-1">
            <span className="font-mono text-[9px] text-ink-muted">{bar.label}</span>
            <span
              className={`w-9 rounded-t-md ${bar.height} sm:w-12`}
              style={{
                backgroundColor: i === bars.length - 1 ? `${glow}80` : `${glow}40`,
                boxShadow: i === bars.length - 1 ? `0 0 24px ${glow}55` : undefined,
              }}
            />
          </div>
        ))}
        <span className="mb-0.5 hidden flex-1 border-b border-dashed sm:block" style={{ borderColor: `${glow}66` }} />
      </div>
    </div>
  );
}

/** Athletes strip: four builds — tall, short, wide, lean — on one baseline. */
function AthletesLineup({ glow, ink }: { glow: string; ink: string }) {
  const { t } = useLanguage();
  const builds = [
    { w: 'w-3', h: 'h-16', r: 'rounded-t-full' },
    { w: 'w-3', h: 'h-8', r: 'rounded-t-full' },
    { w: 'w-5', h: 'h-11', r: 'rounded-md' },
    { w: 'w-3.5', h: 'h-14', r: 'rounded-t-full' },
  ];

  return (
    <div className="rounded-xl border bg-night/40 px-4 pb-3 pt-3" style={{ borderColor: `${glow}40` }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: ink }}>
        {t('labAthletesLineup')}
      </p>
      <div className="mt-3 flex items-end justify-center gap-5 border-b sm:gap-8" style={{ borderColor: `${glow}55` }}>
        {builds.map((build, i) => (
          <span
            key={i}
            className={`${build.w} ${build.h} ${build.r} sm:w-4`}
            style={{
              backgroundColor: i === 0 ? `${glow}80` : `${glow}35`,
              boxShadow: i === 0 ? `0 0 20px ${glow}44` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ModeCard({ world, index, open, onToggle }: CardProps) {
  const { t, lang } = useLanguage();
  const theme = THEMES[world.id];
  const Icon = ICONS[world.id as keyof typeof ICONS];
  const name = lang === 'ar' ? world.nameAr : world.name;
  const description = lang === 'ar' ? world.descriptionAr : world.description;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative min-h-[240px] overflow-hidden rounded-3xl border border-line bg-studio text-start"
    >
      <WorldBackdrop id={world.id} color={theme.glow} />
      <DevelopmentStamp />
      <div className="relative flex h-full flex-col p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <span
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border"
            style={{ borderColor: `${theme.glow}55`, backgroundColor: `${theme.glow}14`, color: theme.ink }}
          >
            <Icon size={20} />
          </span>
          <span className="rounded-full border border-paper/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-paper">
            {t('labNewMode')}
          </span>
        </div>
        <h3 className="mt-6 font-display text-3xl font-extrabold text-ink">{name}</h3>
        <p className="mt-3 max-w-lg text-sm leading-[1.7] text-ink-muted">{description}</p>
        <div className="mt-6">
          {world.id === 'fit' ? <YesNoStrip /> : <GoldStrip />}
        </div>
        <div className="mt-5">
          <Matchups world={world} />
        </div>
      </div>
    </motion.button>
  );
}

function Matchups({ world, strong = false }: { world: ComingWorld; strong?: boolean }) {
  const { lang } = useLanguage();

  return (
    <div className="flex flex-wrap gap-2">
      {world.matchups.map((match) => (
        <span
          key={`${match.a}-${match.b}`}
          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            strong ? 'border-paper/25 bg-night/50 text-ink' : 'border-line bg-night/40 text-ink-muted'
          }`}
        >
          <span>{lang === 'ar' ? match.aAr : match.a}</span>
          <span className="font-display text-[10px] text-onair">VS</span>
          <span>{lang === 'ar' ? match.bAr : match.b}</span>
        </span>
      ))}
    </div>
  );
}

function DevelopmentStamp({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();

  return (
    <span
      className={`pointer-events-none absolute z-10 rotate-[-18deg] rounded-sm border-2 border-onair/80 bg-onair/10 font-display font-extrabold uppercase tracking-[0.18em] text-onair shadow-[0_0_24px_rgba(255,61,61,0.25)] ${
        compact
          ? 'end-3 top-10 px-2 py-1 text-[9px]'
          : 'end-6 top-16 px-3 py-1.5 text-[11px] sm:end-8 sm:top-20 sm:text-xs'
      }`}
    >
      {t('labStamp')}
    </span>
  );
}

function YesNoStrip() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-line">
      <span className="bg-kick/15 px-4 py-3 text-center font-display text-sm font-extrabold text-kick">{t('labYes')}</span>
      <span className="bg-onair/15 px-4 py-3 text-center font-display text-sm font-extrabold text-onair">{t('labNo')}</span>
    </div>
  );
}

function GoldStrip() {
  const { t } = useLanguage();
  return (
    <div className="overflow-hidden rounded-xl border border-[#F5C542]/30 bg-gradient-to-r from-[#F5C542]/15 via-[#fff6d5]/10 to-[#F5C542]/5 px-4 py-3">
      <p className="bg-gold-shimmer bg-[length:200%_100%] bg-clip-text font-display text-sm font-extrabold text-transparent">
        {t('labPriceLine')}
      </p>
    </div>
  );
}

function WorldBackdrop({ id, color }: { id: string; color: string }) {
  if (id === 'space') {
    return (
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="absolute start-[18%] top-[28%] h-16 w-16 rounded-full bg-[#7C5CFF]/40 blur-[2px]" />
        <span className="absolute start-[22%] top-[32%] h-10 w-10 animate-drift rounded-full bg-[#C4B5FD]" />
        <span className="absolute start-[12%] top-[18%] h-40 w-40 rounded-full border border-[#7C5CFF]/25 animate-orbit" />
        <span className="absolute start-[6%] top-[10%] h-56 w-56 rounded-full border border-dashed border-[#7C5CFF]/15 animate-orbit-slow" />
        <span className="absolute bottom-8 end-10 h-3 w-3 rounded-full bg-paper/80" />
        <span className="absolute bottom-16 end-24 h-1.5 w-1.5 rounded-full bg-paper/50" />
      </div>
    );
  }

  if (id === 'maps') {
    return (
      <div className="pointer-events-none absolute inset-0 bg-latlong opacity-40" aria-hidden="true">
        <span className="absolute end-8 top-10 h-24 w-24 rounded-full border-2 border-[#2EE6A6]/40" />
        <span className="absolute end-14 top-16 h-12 w-12 rounded-full bg-[#2EE6A6]/20" />
      </div>
    );
  }

  if (id === 'engineering') {
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" aria-hidden="true">
        <line x1="0" y1="80%" x2="100%" y2="80%" stroke={color} strokeWidth="1" />
        <polygon points="12,80 38,42 64,80" fill="none" stroke={color} strokeWidth="1.4" />
        <rect x="72%" y="46%" width="22%" height="34%" fill="none" stroke={color} strokeWidth="1.2" />
      </svg>
    );
  }

  if (id === 'hidden') {
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-25" aria-hidden="true">
        <path d="M20 180 C80 40, 160 220, 240 80 S420 40, 520 160" fill="none" stroke={color} strokeWidth="1.3" />
        <path d="M0 120 C120 200, 200 20, 360 140 S500 240, 640 90" fill="none" stroke={color} strokeWidth="1" />
      </svg>
    );
  }

  if (id === 'ancient') {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
        <span className="absolute bottom-0 end-8 h-40 w-10 bg-[#E8C36A]/40" />
        <span className="absolute bottom-0 end-20 h-28 w-8 bg-[#E8C36A]/25" />
        <span className="absolute bottom-0 end-32 h-48 w-6 bg-[#E8C36A]/20" />
      </div>
    );
  }

  if (id === 'anime') {
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" aria-hidden="true">
        <line x1="8%" y1="18%" x2="92%" y2="18%" stroke={color} strokeWidth="1" strokeDasharray="5 7" />
        <line x1="8%" y1="42%" x2="92%" y2="42%" stroke={color} strokeWidth="1" strokeDasharray="5 7" />
        <line x1="8%" y1="66%" x2="92%" y2="66%" stroke={color} strokeWidth="1" strokeDasharray="5 7" />
        <line x1="8%" y1="8%" x2="8%" y2="88%" stroke={color} strokeWidth="1.4" />
        <circle cx="92%" cy="18%" r="4" fill={color} />
      </svg>
    );
  }

  if (id === 'athletes') {
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" aria-hidden="true">
        <line x1="0" y1="38%" x2="100%" y2="38%" stroke={color} strokeWidth="1.1" />
        <line x1="0" y1="58%" x2="100%" y2="58%" stroke={color} strokeWidth="1.1" />
        <line x1="0" y1="78%" x2="100%" y2="78%" stroke={color} strokeWidth="1.1" />
        <line x1="16%" y1="28%" x2="16%" y2="88%" stroke={color} strokeWidth="2" />
        <circle cx="26%" cy="48%" r="4" fill={color} />
        <circle cx="34%" cy="68%" r="4" fill={color} opacity="0.6" />
      </svg>
    );
  }

  if (id === 'fit') {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
        <span className="absolute end-8 top-12 h-28 w-40 rounded-sm border-2 border-dashed border-[#5B8CFF]" />
        <span className="absolute end-16 top-20 h-12 w-20 rounded-sm bg-[#5B8CFF]/30" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 bg-gold-shimmer bg-[length:200%_100%] opacity-20" aria-hidden="true" />
  );
}
