import { LogOut, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import OnlineErrorBanner from '@/components/online/OnlineErrorBanner';
import OnlineLobby from '@/components/online/OnlineLobby';
import OnlineRoom from '@/components/online/OnlineRoom';
import TopNav from '@/components/TopNav';
import { useRoom } from '@/hooks/useRoom';
import { useLanguage } from '@/i18n/LanguageProvider';
import { clearRoomCodeFromUrl, readOnlineName, roomCodeFromUrl } from '@/lib/online';

interface OnlineScreenProps {
  onExit: () => void;
}

type ConfirmMode = 'room' | 'exit';

export default function OnlineScreen({ onExit }: OnlineScreenProps) {
  const { t } = useLanguage();
  const controller = useRoom();
  const { room, error, busy, create, join, leave, clearError } = controller;

  const [initialCode, setInitialCode] = useState(() => roomCodeFromUrl());
  const [confirmMode, setConfirmMode] = useState<ConfirmMode | null>(null);
  const autoJoinRef = useRef(false);

  // Invite links carry ?room=CODE. When the device already has a name, join
  // immediately; otherwise the lobby keeps the code prefilled.
  useEffect(() => {
    if (autoJoinRef.current) return;
    autoJoinRef.current = true;
    const code = roomCodeFromUrl();
    if (!code) return;
    setInitialCode(code);
    const saved = readOnlineName().trim();
    if (saved.length >= 2) void join(saved, code);
  }, [join]);

  useEffect(() => {
    if (!confirmMode) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setConfirmMode(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmMode]);

  const confirmLeave = async () => {
    const mode = confirmMode;
    setConfirmMode(null);
    await leave();
    clearRoomCodeFromUrl();
    if (mode === 'exit') onExit();
  };

  const requestExit = () => {
    if (room) {
      setConfirmMode('exit');
      return;
    }
    clearRoomCodeFromUrl();
    onExit();
  };

  return (
    <div className="min-h-screen bg-night text-ink">
      <TopNav onExit={requestExit} exitLabel={t('onlineExit')} />

      <main id="top">
        {error && (
          <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
            <OnlineErrorBanner error={error} onDismiss={clearError} />
          </div>
        )}

        {room ? (
          <OnlineRoom controller={controller} onRequestLeave={() => setConfirmMode('room')} />
        ) : (
          <OnlineLobby
            initialCode={initialCode}
            busy={busy}
            onCreate={create}
            onJoin={join}
          />
        )}
      </main>

      {confirmMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-room-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setConfirmMode(null);
          }}
        >
          <div className="w-full max-w-md animate-fade-up rounded-2xl border border-line bg-studio p-5 shadow-2xl sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-onair/30 bg-onair/10 text-onair">
                <LogOut size={18} className="rtl:rotate-180" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="leave-room-title" className="font-display text-lg font-extrabold text-ink">
                  {t('onlineLeaveTitle')}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t('onlineLeaveBody')}</p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmMode(null)}
                aria-label={t('cancel')}
                className="rounded-md p-1 text-ink-muted transition hover:bg-line/60 hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmMode(null)}
                className="inline-flex items-center justify-center rounded-xl border border-line bg-night/40 px-4 py-2.5 text-sm font-semibold text-ink-muted transition hover:text-ink"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => void confirmLeave()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-onair px-4 py-2.5 text-sm font-bold text-night transition hover:brightness-110"
              >
                <LogOut size={15} className="rtl:rotate-180" />
                {confirmMode === 'exit' ? t('onlineExit') : t('onlineLeave')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
