import {
  ArrowRight,
  Clock3,
  Link2,
  Loader2,
  LogIn,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { CategoryPicker, RoundSummary, SecondsPicker } from '@/components/online/SetupPickers';
import { CATEGORIES } from '@/data/categories';
import { useLanguage } from '@/i18n/LanguageProvider';
import { normalizeRoomCode, readOnlineName } from '@/lib/online';
import type { CategoryId } from '@/types/game';

interface OnlineLobbyProps {
  initialCode: string;
  busy: boolean;
  onCreate: (name: string, categoryId: CategoryId, seconds: number) => Promise<unknown>;
  onJoin: (name: string, code: string) => Promise<unknown>;
}

const FEATURES = [
  { icon: Users, key: 'onlinePlayers' },
  { icon: Clock3, key: 'onlineFeatureClock' },
  { icon: Link2, key: 'onlineFeatureLink' },
] as const;

export default function OnlineLobby({ initialCode, busy, onCreate, onJoin }: OnlineLobbyProps) {
  const { t } = useLanguage();
  const [name, setName] = useState(() => readOnlineName());
  const [categoryId, setCategoryId] = useState<CategoryId>(CATEGORIES[0].id);
  const [seconds, setSeconds] = useState(10);
  const [code, setCode] = useState(initialCode);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (initialCode) setCode(initialCode);
  }, [initialCode]);

  const trimmedName = name.trim();
  const nameValid = trimmedName.length >= 2 && trimmedName.length <= 18;
  const codeValid = code.length === 6;

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!nameValid || busy) return;
    void onCreate(trimmedName, categoryId, seconds);
  };

  const handleJoin = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!nameValid || !codeValid || busy) return;
    void onJoin(trimmedName, code);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-blueprint opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-24 end-0 h-72 w-72 rounded-full bg-reference/15 blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 start-1/4 h-56 w-56 rounded-full bg-mystery/10 blur-[90px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-onair/30 bg-onair/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-onair">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-onair opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-onair" />
              </span>
              {t('onlineKicker')}
            </p>
            <h1 className="mt-4 text-balance font-display text-3xl font-extrabold text-ink sm:text-5xl">
              {t('onlineLobbyTitle')}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-[1.7] text-ink-muted sm:text-base">
              {t('onlineLobbyBody')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {FEATURES.map(({ icon: Icon, key }) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-studio/70 px-3 py-1.5 text-xs font-medium text-ink-muted"
              >
                <Icon size={13} className="text-reference" />
                {t(key)}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-line bg-studio/80 p-4 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.9)] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-night/60 text-reference">
              <UserRound size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <label htmlFor="online-name" className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                {t('onlineNameLabel')}
              </label>
              <input
                id="online-name"
                value={name}
                onChange={(event) => setName(event.target.value.slice(0, 18))}
                onBlur={() => setTouched(true)}
                placeholder={t('onlineNamePlaceholder')}
                maxLength={18}
                autoComplete="nickname"
                className={`mt-1 w-full rounded-lg border bg-night/60 px-3 py-2 text-sm font-semibold text-ink outline-none transition placeholder:font-normal placeholder:text-ink-muted/50 focus:border-reference ${
                  touched && !nameValid ? 'border-onair/60' : 'border-line'
                }`}
              />
              <p className={`mt-1 text-[11px] ${touched && !nameValid ? 'text-onair' : 'text-ink-muted'}`}>
                {touched && !nameValid ? t('onlineNameRequired') : t('onlineNameHint')}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start rounded-lg border border-kick/25 bg-kick/5 px-3 py-2 text-[11px] font-medium text-ink-muted sm:self-auto">
            <ShieldCheck size={14} className="text-kick" />
            <span>
              {t('onlineNoSignup')} · {t('onlineNoAccount')}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <form
            onSubmit={handleCreate}
            className="relative overflow-hidden rounded-2xl border border-line bg-studio p-5 sm:p-6"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-reference/70 to-transparent" aria-hidden="true" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-reference">
                  <Plus size={13} />
                  01
                </span>
                <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">{t('onlineCreateTitle')}</h2>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-muted">{t('onlineCreateBody')}</p>
              </div>
              <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-reference/30 bg-reference/10 text-reference sm:flex">
                <Radio size={20} />
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  {t('onlineCategoryLabel')}
                </p>
                <CategoryPicker value={categoryId} onChange={setCategoryId} disabled={busy} />
              </div>

              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  {t('onlineSecondsLabel')}
                </p>
                <SecondsPicker value={seconds} onChange={setSeconds} disabled={busy} />
              </div>

              <RoundSummary categoryId={categoryId} seconds={seconds} />

              <button
                type="submit"
                disabled={!nameValid || busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-onair px-5 py-3.5 font-display text-sm font-extrabold text-night transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
                {busy ? t('onlineConnecting') : t('onlineCreateCta')}
                <ArrowRight size={16} className="rtl:rotate-180" />
              </button>
            </div>
          </form>

          <form
            onSubmit={handleJoin}
            className="relative flex flex-col overflow-hidden rounded-2xl border border-line bg-studio p-5 sm:p-6"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mystery/70 to-transparent" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-mystery">
              <LogIn size={13} />
              02
            </span>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-ink">{t('onlineJoinTitle')}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{t('onlineJoinBody')}</p>

            <div className="mt-5 flex-1">
              <label htmlFor="room-code" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                {t('onlineCodeLabel')}
              </label>
              <input
                id="room-code"
                value={code}
                onChange={(event) => setCode(normalizeRoomCode(event.target.value))}
                placeholder={t('onlineCodePlaceholder')}
                maxLength={6}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                inputMode="text"
                className={`w-full rounded-xl border bg-night/60 px-3 py-4 text-center font-mono text-2xl font-extrabold uppercase tracking-[0.35em] text-ink outline-none transition placeholder:text-ink-muted/30 focus:border-mystery ${
                  code.length > 0 && !codeValid ? 'border-onair/60' : 'border-line'
                }`}
              />
              <p className="mt-2 text-[11px] text-ink-muted">
                {code.length > 0 && !codeValid ? t('onlineCodeRequired') : t('onlineInviteHint')}
              </p>

              <div className="mt-4 flex items-start gap-2 rounded-lg border border-line bg-night/40 p-3 text-[11px] leading-relaxed text-ink-muted">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-reference" />
                <span>{t('onlineInviteOnlyBody')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!nameValid || !codeValid || busy}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-mystery/50 bg-mystery/15 px-5 py-3.5 font-display text-sm font-extrabold text-ink transition hover:bg-mystery/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
              {busy ? t('onlineConnecting') : t('onlineJoinCta')}
            </button>
          </form>
        </div>

        <div className="mt-5 grid gap-2 text-[11px] text-ink-muted sm:grid-cols-3">
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-reference" aria-hidden="true" />
            {t('onlineSameRound')}
          </p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-mystery" aria-hidden="true" />
            {t('onlineRevealHint')}
          </p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-kick" aria-hidden="true" />
            {t('onlineScoreFormula')}
          </p>
        </div>
      </div>
    </section>
  );
}
