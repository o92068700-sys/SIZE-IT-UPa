import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import type { OnlineError, OnlineErrorCode } from '@/lib/online';

const ERROR_KEYS: Partial<Record<OnlineErrorCode, TranslationKey>> = {
  SUPABASE_NOT_CONFIGURED: 'onlineErrorSetup',
  ANON_DISABLED: 'onlineErrorAuth',
  AUTH_REQUIRED: 'onlineErrorAuth',
  RATE_LIMIT: 'onlineErrorRateLimit',
  ROOM_NOT_FOUND: 'onlineErrorRoomNotFound',
  ROOM_FULL: 'onlineErrorRoomFull',
  ROOM_STARTED: 'onlineErrorRoomStarted',
  NAME_TAKEN: 'onlineErrorNameTaken',
  NAME_INVALID: 'onlineErrorNameInvalid',
  TIME_UP: 'onlineErrorTimeUp',
  HOST_ONLY: 'onlineErrorHostOnly',
  HOST_ACTIVE: 'onlineErrorHostActive',
  NOT_IN_ROOM: 'onlineErrorNotInRoom',
  NETWORK: 'onlineErrorNetwork',
};

interface OnlineErrorBannerProps {
  error: OnlineError;
  onDismiss: () => void;
}

export default function OnlineErrorBanner({ error, onDismiss }: OnlineErrorBannerProps) {
  const { t } = useLanguage();
  const key = ERROR_KEYS[error.code] ?? 'onlineErrorGeneric';
  const showSetup = error.code === 'SUPABASE_NOT_CONFIGURED' || error.code === 'ANON_DISABLED';

  return (
    <div
      role="alert"
      className="rounded-xl border border-onair/40 bg-onair/10 p-4 text-sm text-ink shadow-[0_20px_50px_-30px_rgba(255,61,61,0.7)]"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-onair/15 text-onair">
          <AlertTriangle size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{t('onlineSetupSteps')}</p>
          <p className="mt-1 leading-relaxed text-ink-muted">{t(key)}</p>

          {showSetup && (
            <ol className="mt-3 space-y-1.5 border-t border-onair/20 pt-3 text-xs text-ink-muted">
              <li className="flex gap-2">
                <span className="font-mono text-onair">01</span>
                <span>{t('onlineSetupStepSql')}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-mono text-onair">02</span>
                <span>{t('onlineSetupStepAuth')}</span>
              </li>
            </ol>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t('cancel')}
          className="rounded-md p-1 text-ink-muted transition hover:bg-onair/10 hover:text-ink"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
