import { DoorOpen, Loader2 } from 'lucide-react';
import LobbyView from '@/components/online/LobbyView';
import OnlineResults from '@/components/online/OnlineResults';
import PlayView from '@/components/online/PlayView';
import RoundReveal from '@/components/online/RoundReveal';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { RoomController } from '@/hooks/useRoom';

interface OnlineRoomProps {
  controller: RoomController;
  onRequestLeave: () => void;
}

export default function OnlineRoom({ controller, onRequestLeave }: OnlineRoomProps) {
  const { t } = useLanguage();
  const {
    room,
    players,
    submissions,
    answers,
    myPlayerId,
    isHost,
    busy,
    submitting,
    advancing,
    secondsLeft,
    revealSecondsLeft,
    isReveal,
    isStarting,
    revealSynced,
    now,
    submit,
    rematch,
    start,
    advance,
    claimHost,
  } = controller;

  if (!room || !myPlayerId) {
    return (
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-20">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          <Loader2 size={16} className="animate-spin" />
          {t('onlineSyncing')}
        </div>
      </div>
    );
  }

  if (room.status === 'abandoned') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-line bg-studio p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-onair/30 bg-onair/10 text-onair">
            <DoorOpen size={22} />
          </span>
          <h2 className="mt-4 font-display text-xl font-extrabold text-ink">{t('onlineRoomClosed')}</h2>
          <button
            type="button"
            onClick={onRequestLeave}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-night/40 px-4 py-2.5 text-sm font-semibold text-ink-muted transition hover:border-reference/50 hover:text-ink"
          >
            {t('onlineBackToLobby')}
          </button>
        </div>
      </div>
    );
  }

  if (room.status === 'waiting') {
    return (
      <LobbyView
        room={room}
        players={players}
        myPlayerId={myPlayerId}
        now={controller.now}
        busy={busy}
        onStart={() => void start()}
        onLeave={onRequestLeave}
        onClaimHost={() => void claimHost()}
      />
    );
  }

  if (room.status === 'playing' && isReveal) {
    return (
      <RoundReveal
        room={room}
        players={players}
        submissions={submissions}
        answers={answers}
        myPlayerId={myPlayerId}
        revealSecondsLeft={revealSecondsLeft}
        revealSynced={revealSynced}
        isHost={isHost}
        advancing={advancing}
        onAdvance={() => void advance()}
      />
    );
  }

  if (room.status === 'playing') {
    return (
      <PlayView
        room={room}
        players={players}
        submissions={submissions}
        myPlayerId={myPlayerId}
        secondsLeft={secondsLeft}
        now={now}
        starting={isStarting}
        submitting={submitting}
        onSubmit={submit}
      />
    );
  }

  return (
    <OnlineResults
      room={room}
      players={players}
      submissions={submissions}
      answers={answers}
      myPlayerId={myPlayerId}
      isHost={isHost}
      busy={busy}
      onRematch={(categoryId, seconds) => void rematch(categoryId, seconds)}
      onLeave={onRequestLeave}
    />
  );
}
