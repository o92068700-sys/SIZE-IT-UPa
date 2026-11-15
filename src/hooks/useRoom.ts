import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  OnlineError,
  advanceOnlineRound,
  buildOnlineRounds,
  claimRoomHost,
  createOnlineRoom,
  ensureOnlineSession,
  fetchRoomSnapshot,
  joinOnlineRoom,
  leaveOnlineRoom,
  markOnlineRoundReady,
  rematchOnlineRoom,
  saveOnlineName,
  sendHeartbeat,
  serverNow,
  clearRoomCodeFromUrl,
  startOnlineRoom,
  submitOnlineEstimate,
  syncServerClock,
  toOnlineError,
} from '@/lib/online';
import { supabase } from '@/lib/supabase';
import type { CategoryId } from '@/types/game';
import type {
  JoinRoomResult,
  Room,
  RoomAnswer,
  RoomPlayer,
  RoomSnapshot,
  RoomSubmission,
} from '@/types/online';

export type RoomLoadState = 'idle' | 'connecting' | 'ready' | 'error';

export type RoomController = ReturnType<typeof useRoom>;

export function useRoom() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [submissions, setSubmissions] = useState<RoomSubmission[]>([]);
  const [answers, setAnswers] = useState<RoomAnswer[]>([]);
  const [loadState, setLoadState] = useState<RoomLoadState>('idle');
  const [error, setError] = useState<OnlineError | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [now, setNow] = useState(() => serverNow());
  const [revealSyncedKey, setRevealSyncedKey] = useState<string | null>(null);

  const roomIdRef = useRef<string | null>(null);
  const myPlayerIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const roomRef = useRef<Room | null>(null);
  const refreshSeqRef = useRef(0);
  const revealFetchedRef = useRef<string | null>(null);

  const applySnapshot = useCallback((snapshot: RoomSnapshot) => {
    roomRef.current = snapshot.room;
    setRoom(snapshot.room);
    setPlayers(snapshot.players);
    setSubmissions(snapshot.submissions);
    setAnswers(snapshot.answers);
    setLoadState('ready');
    setError(null);

    const mine =
      snapshot.players.find((player) => player.id === myPlayerIdRef.current) ??
      snapshot.players.find((player) => player.user_id === userIdRef.current);
    if (mine) {
      myPlayerIdRef.current = mine.id;
      setMyPlayerId(mine.id);
    }
  }, []);

  const refresh = useCallback(
    async (silent = false) => {
      const id = roomIdRef.current;
      if (!id) return;
      const seq = ++refreshSeqRef.current;
      try {
        const snapshot = await fetchRoomSnapshot(id);
        if (seq !== refreshSeqRef.current) return;
        applySnapshot(snapshot);
      } catch (err) {
        if (seq !== refreshSeqRef.current) return;
        const onlineError = toOnlineError(err);
        if (onlineError.code === 'ROOM_NOT_FOUND') {
          roomRef.current = null;
          setRoom(null);
          setPlayers([]);
          setSubmissions([]);
          setAnswers([]);
          setLoadState('error');
          setError(onlineError);
          return;
        }
        if (!silent) {
          setError(onlineError);
          if (!roomRef.current) setLoadState('error');
        }
      }
    },
    [applySnapshot],
  );

  const enterRoom = useCallback(
    (payload: JoinRoomResult) => {
      roomIdRef.current = payload.room.id;
      myPlayerIdRef.current = payload.player.id;
      userIdRef.current = payload.player.user_id;
      roomRef.current = payload.room;
      setRoomId(payload.room.id);
      setMyPlayerId(payload.player.id);
      setRoom(payload.room);
      setPlayers([payload.player]);
      setSubmissions([]);
      setAnswers([]);
      setLoadState('ready');
      setError(null);
      saveOnlineName(payload.player.name);
      // The room code must never sit in the address bar — a live-streamed tab
      // would expose it to everyone watching. Invite links still carry it and
      // are consumed once, then scrubbed.
      clearRoomCodeFromUrl();
      void refresh(true);
    },
    [refresh],
  );

  const create = useCallback(
    async (name: string, categoryId: CategoryId, seconds: number) => {
      setBusy(true);
      setError(null);
      setLoadState('connecting');
      try {
        await ensureOnlineSession();
        await syncServerClock().catch(() => false);
        const rounds = buildOnlineRounds(categoryId);
        if (!rounds.length) throw new OnlineError('CATEGORY_INVALID');
        const payload = await createOnlineRoom({ name, categoryId, seconds, rounds });
        enterRoom(payload);
        return payload;
      } catch (err) {
        const onlineError = toOnlineError(err);
        setError(onlineError);
        setLoadState('error');
        return null;
      } finally {
        setBusy(false);
      }
    },
    [enterRoom],
  );

  const join = useCallback(
    async (name: string, code: string) => {
      setBusy(true);
      setError(null);
      setLoadState('connecting');
      try {
        await ensureOnlineSession();
        await syncServerClock().catch(() => false);
        const payload = await joinOnlineRoom(code, name);
        enterRoom(payload);
        return payload;
      } catch (err) {
        const onlineError = toOnlineError(err);
        setError(onlineError);
        setLoadState('error');
        return null;
      } finally {
        setBusy(false);
      }
    },
    [enterRoom],
  );

  const start = useCallback(async () => {
    const current = roomRef.current;
    if (!current) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await startOnlineRoom(current.id);
      roomRef.current = updated;
      setRoom(updated);
      await refresh(true);
    } catch (err) {
      setError(toOnlineError(err));
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const submit = useCallback(
    async (estimateCm: number) => {
      const current = roomRef.current;
      if (!current) return null;
      setSubmitting(true);
      setError(null);
      try {
        const result = await submitOnlineEstimate(current.id, current.current_round, estimateCm);
        setSubmissions((previous) => {
          const next = previous.filter(
            (entry) =>
              !(
                entry.player_id === result.submission.player_id &&
                entry.round_index === result.submission.round_index
              ),
          );
          next.push(result.submission);
          return next.sort((a, b) => a.round_index - b.round_index);
        });
        await refresh(true);
        return result.submission;
      } catch (err) {
        setError(toOnlineError(err));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [refresh],
  );

  // Host-only: the reveal stays on screen until the host presses "next round".
  const advance = useCallback(async () => {
    const current = roomRef.current;
    if (!current || advancing) return;
    setAdvancing(true);
    setError(null);
    try {
      const updated = await advanceOnlineRound(current.id);
      roomRef.current = updated;
      setRoom(updated);
      await refresh(true);
    } catch (err) {
      const onlineError = toOnlineError(err);
      if (onlineError.code !== 'NOT_IN_ROOM' && onlineError.code !== 'ROOM_NOT_FOUND') {
        setError(onlineError);
      }
    } finally {
      setAdvancing(false);
    }
  }, [advancing, refresh]);

  const leave = useCallback(async () => {
    const id = roomIdRef.current;
    if (id) {
      try {
        await leaveOnlineRoom(id);
      } catch {
        // Leaving is best-effort; a stale seat is cleaned up by the host logic.
      }
    }

    refreshSeqRef.current += 1;
    roomIdRef.current = null;
    myPlayerIdRef.current = null;
    userIdRef.current = null;
    roomRef.current = null;
    revealFetchedRef.current = null;

    setRoomId(null);
    setMyPlayerId(null);
    setRoom(null);
    setPlayers([]);
    setSubmissions([]);
    setAnswers([]);
    setLoadState('idle');
    setError(null);
    setBusy(false);
    setSubmitting(false);
    setRevealSyncedKey(null);
  }, []);

  const rematch = useCallback(
    async (categoryId: CategoryId, seconds: number) => {
      const current = roomRef.current;
      if (!current) return;
      setBusy(true);
      setError(null);
      try {
        const rounds = buildOnlineRounds(categoryId);
        if (!rounds.length) throw new OnlineError('CATEGORY_INVALID');
        const updated = await rematchOnlineRoom(current.id, categoryId, seconds, rounds);
        roomRef.current = updated;
        setRoom(updated);
        setSubmissions([]);
        setAnswers([]);
        setRevealSyncedKey(null);
        revealFetchedRef.current = null;
        await refresh(true);
      } catch (err) {
        setError(toOnlineError(err));
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const claimHost = useCallback(async () => {
    const current = roomRef.current;
    if (!current) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await claimRoomHost(current.id);
      roomRef.current = updated;
      setRoom(updated);
      await refresh(true);
    } catch (err) {
      setError(toOnlineError(err));
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const clearError = useCallback(() => setError(null), []);

  // Smooth countdown driven by the corrected server clock.
  useEffect(() => {
    const id = window.setInterval(() => setNow(serverNow()), 250);
    return () => window.clearInterval(id);
  }, []);

  // Re-sync the clock periodically so long sessions stay accurate.
  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    const run = async () => {
      await syncServerClock().catch(() => false);
      if (!cancelled) setNow(serverNow());
    };
    void run();
    const id = window.setInterval(() => void run(), 60000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [roomId]);

  // Realtime changes + a slow polling fallback + heartbeat.
  useEffect(() => {
    if (!roomId) return;
    const sb = supabase;
    if (!sb) return;

    let refreshTimer: number | null = null;
    const scheduleRefresh = () => {
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        void refresh(true);
      }, 120);
    };

    const channel = sb
      .channel(`scale-clash-room:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        scheduleRefresh,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        scheduleRefresh,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_submissions', filter: `room_id=eq.${roomId}` },
        scheduleRefresh,
      )
      .subscribe();

    // Fast fallback while a round is live: the host controls the transition, so
    // guests must learn about the new round quickly even if realtime drops.
    let pollTimer: number | null = null;
    let cancelled = false;
    const poll = async () => {
      await refresh(true);
      if (cancelled) return;
      const delay = roomRef.current?.status === 'playing' ? 2000 : 15000;
      pollTimer = window.setTimeout(() => void poll(), delay);
    };
    pollTimer = window.setTimeout(() => void poll(), 15000);

    const heartbeat = () => {
      void sendHeartbeat(roomId).catch(() => undefined);
    };
    heartbeat();
    const heartbeatId = window.setInterval(heartbeat, 20000);

    return () => {
      cancelled = true;
      if (refreshTimer !== null) window.clearTimeout(refreshTimer);
      if (pollTimer !== null) window.clearTimeout(pollTimer);
      window.clearInterval(heartbeatId);
      void sb.removeChannel(channel);
    };
  }, [roomId, refresh]);

  // As soon as the timer hits zero, pull the now-visible submissions/answers.
  // The device clock can cross the deadline a few hundred ms before the database
  // clock, so retry once or twice inside the reveal window.
  useEffect(() => {
    if (!room || room.status !== 'playing' || !room.round_ends_at) return;
    const ends = new Date(room.round_ends_at).getTime();
    if (!Number.isFinite(ends) || now < ends) return;
    const key = `${room.id}:${room.current_round}`;
    if (revealFetchedRef.current === key) return;
    revealFetchedRef.current = key;
    void refresh(true).then(() => setRevealSyncedKey(key));
    [500, 1200].forEach((delay) => {
      window.setTimeout(() => void refresh(true), delay);
    });
  }, [now, room, refresh]);

  // First-round readiness gate. While the room is playing but the clock has
  // not started, every client reports that it has rendered the stage. The
  // server starts the round when all seated players are ready (or after 10s),
  // so nobody misses the first object because of a slow load.
  const startingRoomId =
    room && room.status === 'playing' && room.round_ends_at === null ? room.id : null;

  useEffect(() => {
    if (!startingRoomId) return;
    const id = startingRoomId;
    let cancelled = false;
    let inFlight = false;
    let lastRefresh = 0;

    const tick = async () => {
      if (cancelled || inFlight) return;
      inFlight = true;
      try {
        const updated = await markOnlineRoundReady(id);
        if (cancelled) return;
        if (updated.round_ends_at !== null) {
          roomRef.current = updated;
          setRoom(updated);
          await refresh(true);
          return;
        }
        // Readiness lives in room_players. Realtime usually pushes it; this
        // slow refresh is only a fallback for flaky sockets.
        if (Date.now() - lastRefresh > 2500) {
          lastRefresh = Date.now();
          await refresh(true);
        }
      } catch {
        // The next tick retries; the 10s server cap still starts the round.
      } finally {
        inFlight = false;
      }
    };

    void tick();
    const interval = window.setInterval(() => void tick(), 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [startingRoomId, refresh]);

  const myPlayer = useMemo(
    () => players.find((player) => player.id === myPlayerId) ?? null,
    [players, myPlayerId],
  );

  const isHost = myPlayer?.is_host ?? false;
  const roundEndsAt = room?.round_ends_at ? new Date(room.round_ends_at).getTime() : null;
  const revealEndsAt =
    roundEndsAt !== null && room ? roundEndsAt + room.reveal_seconds * 1000 : null;
  const secondsLeft = roundEndsAt !== null ? Math.max(0, (roundEndsAt - now) / 1000) : 0;
  const revealSecondsLeft =
    revealEndsAt !== null ? Math.max(0, (revealEndsAt - now) / 1000) : 0;
  const isReveal = Boolean(
    room && room.status === 'playing' && roundEndsAt !== null && now >= roundEndsAt,
  );
  const isStarting = Boolean(
    room && room.status === 'playing' && room.round_ends_at === null,
  );
  const revealSynced = Boolean(
    room && revealSyncedKey === `${room.id}:${room.current_round}`,
  );

  return {
    roomId,
    myPlayerId,
    room,
    players,
    submissions,
    answers,
    myPlayer,
    isHost,
    loadState,
    error,
    busy,
    submitting,
    advancing,
    now,
    roundEndsAt,
    revealEndsAt,
    secondsLeft,
    revealSecondsLeft,
    isReveal,
    isStarting,
    revealSynced,
    create,
    join,
    start,
    submit,
    leave,
    rematch,
    claimHost,
    advance,
    refresh,
    clearError,
  };
}
