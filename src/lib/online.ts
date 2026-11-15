import { buildChallenges, dealChallenges } from '@/lib/challenges';
import { MAX_ONLINE_ROUNDS } from '@/lib/gameConfig';
import { supabase } from '@/lib/supabase';
import type { Challenge, CategoryId } from '@/types/game';
import type {
  CreateRoomInput,
  JoinRoomResult,
  Room,
  RoomAnswer,
  RoomPlayer,
  RoomSnapshot,
  RoomSubmission,
  SubmitResult,
} from '@/types/online';

export type OnlineErrorCode =
  | 'SUPABASE_NOT_CONFIGURED'
  | 'ANON_DISABLED'
  | 'RATE_LIMIT'
  | 'AUTH_REQUIRED'
  | 'NAME_INVALID'
  | 'NAME_TAKEN'
  | 'CATEGORY_INVALID'
  | 'TIME_INVALID'
  | 'ROUNDS_INVALID'
  | 'ROOM_NOT_FOUND'
  | 'ROOM_STARTED'
  | 'ROOM_FULL'
  | 'ROOM_NOT_WAITING'
  | 'ROOM_NOT_FINISHED'
  | 'NO_PLAYERS'
  | 'HOST_ONLY'
  | 'HOST_ACTIVE'
  | 'NOT_IN_ROOM'
  | 'ROUND_NOT_ACTIVE'
  | 'ROUND_MISMATCH'
  | 'ROUND_INVALID'
  | 'TIME_UP'
  | 'ESTIMATE_INVALID'
  | 'NETWORK'
  | 'UNKNOWN';

const KNOWN_CODES = new Set<string>([
  'AUTH_REQUIRED',
  'NAME_INVALID',
  'NAME_TAKEN',
  'CATEGORY_INVALID',
  'TIME_INVALID',
  'ROUNDS_INVALID',
  'ROOM_NOT_FOUND',
  'ROOM_STARTED',
  'ROOM_FULL',
  'ROOM_NOT_WAITING',
  'ROOM_NOT_FINISHED',
  'NO_PLAYERS',
  'HOST_ONLY',
  'HOST_ACTIVE',
  'NOT_IN_ROOM',
  'ROUND_NOT_ACTIVE',
  'ROUND_MISMATCH',
  'ROUND_INVALID',
  'TIME_UP',
  'ESTIMATE_INVALID',
]);

export class OnlineError extends Error {
  code: OnlineErrorCode;

  constructor(code: OnlineErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'OnlineError';
    this.code = code;
  }
}

export function toOnlineError(error: unknown): OnlineError {
  if (error instanceof OnlineError) return error;

  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: unknown }).message)
      : String(error ?? '');
  const lower = message.toLowerCase();

  if (lower.includes('anonymous') && (lower.includes('disabled') || lower.includes('not enabled'))) {
    return new OnlineError('ANON_DISABLED', message);
  }
  if (lower.includes('anonymous_provider_disabled')) {
    return new OnlineError('ANON_DISABLED', message);
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return new OnlineError('RATE_LIMIT', message);
  }
  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('load failed')) {
    return new OnlineError('NETWORK', message);
  }
  if (lower.includes('jwt') || lower.includes('session') || lower.includes('not authenticated')) {
    return new OnlineError('AUTH_REQUIRED', message);
  }

  const token = message.match(/\b([A-Z][A-Z0-9_]{2,})\b/);
  if (token && KNOWN_CODES.has(token[1])) {
    return new OnlineError(token[1] as OnlineErrorCode, message);
  }

  return new OnlineError('UNKNOWN', message);
}

function client() {
  if (!supabase) throw new OnlineError('SUPABASE_NOT_CONFIGURED');
  return supabase;
}

/** Creates the invisible anonymous session, or reuses the persisted one. */
export async function ensureOnlineSession() {
  const sb = client();
  const { data, error } = await sb.auth.getSession();
  if (error) throw toOnlineError(error);
  if (data.session) return data.session;

  const { data: signedIn, error: signInError } = await sb.auth.signInAnonymously();
  if (signInError) throw toOnlineError(signInError);
  if (!signedIn.session) throw new OnlineError('AUTH_REQUIRED');
  return signedIn.session;
}

// ---------------------------------------------------------------------------
// Server clock
// ---------------------------------------------------------------------------

let clockOffsetMs = 0;
let clockSynced = false;

/**
 * The database is the clock authority. A single round trip gives us the offset
 * between the device clock and the server clock, including half the latency.
 */
export async function syncServerClock(): Promise<boolean> {
  if (!supabase) return false;
  const started = Date.now();
  const { data, error } = await supabase.rpc('get_server_now');
  const finished = Date.now();
  if (error || typeof data !== 'string') return false;
  const serverMs = new Date(data).getTime();
  if (!Number.isFinite(serverMs)) return false;
  clockOffsetMs = serverMs - (started + (finished - started) / 2);
  clockSynced = true;
  return true;
}

export function serverNow() {
  return Date.now() + clockOffsetMs;
}

export function isClockSynced() {
  return clockSynced;
}

// ---------------------------------------------------------------------------
// Rounds and room helpers
// ---------------------------------------------------------------------------

export function buildOnlineRounds(categoryId: CategoryId): Challenge[] {
  return dealChallenges(categoryId).slice(0, MAX_ONLINE_ROUNDS);
}

export function onlineRoundCount(categoryId: string) {
  try {
    return buildChallenges(categoryId as CategoryId).length;
  } catch {
    return 0;
  }
}

/**
 * The exact answer is not public during play. The stored target size is only
 * an order of magnitude, so use a generous range around it. The server clamps
 * the submitted value to 10%-1000% of the exact size anyway.
 */
export function onlineEstimateRange(publicCm: number) {
  const center = Number.isFinite(publicCm) && publicCm > 0 ? publicCm : 100;
  return { min: center / 10, max: center * 10 };
}

const NAME_KEY = 'scale-clash:online-name';
const ROOM_CODE_LENGTH = 6;

export function readOnlineName(): string {
  try {
    return (window.localStorage.getItem(NAME_KEY) ?? '').slice(0, 18);
  } catch {
    return '';
  }
}

export function saveOnlineName(name: string) {
  try {
    window.localStorage.setItem(NAME_KEY, name.trim().slice(0, 18));
  } catch {
    // Ignore storage errors.
  }
}

export function normalizeRoomCode(raw: string) {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, ROOM_CODE_LENGTH);
}

export function roomCodeFromUrl(): string {
  try {
    const code = normalizeRoomCode(new URL(window.location.href).searchParams.get('room') ?? '');
    return code.length === ROOM_CODE_LENGTH ? code : '';
  } catch {
    return '';
  }
}

export function clearRoomCodeFromUrl() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('room')) return;
    url.searchParams.delete('room');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  } catch {
    // Ignore history errors.
  }
}

export function inviteLink(code: string) {
  try {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('room', normalizeRoomCode(code));
    return url.toString();
  } catch {
    return `${window.location.origin}${window.location.pathname}?room=${normalizeRoomCode(code)}`;
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path.
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// RPC wrappers
// ---------------------------------------------------------------------------

export async function createOnlineRoom(input: CreateRoomInput): Promise<JoinRoomResult> {
  const { data, error } = await client().rpc('create_room', {
    p_name: input.name,
    p_category: input.categoryId,
    p_seconds: input.seconds,
    p_rounds: input.rounds,
  });
  if (error) throw toOnlineError(error);
  return data as JoinRoomResult;
}

export async function joinOnlineRoom(code: string, name: string): Promise<JoinRoomResult> {
  const { data, error } = await client().rpc('join_room', {
    p_code: normalizeRoomCode(code),
    p_name: name,
  });
  if (error) throw toOnlineError(error);
  return data as JoinRoomResult;
}

export async function startOnlineRoom(roomId: string): Promise<Room> {
  const { data, error } = await client().rpc('start_room', { p_room_id: roomId });
  if (error) throw toOnlineError(error);
  return data as Room;
}

/**
 * First-round readiness gate. Every client reports that it has rendered the
 * stage; the server starts the clock when everyone is ready or after 10s.
 */
export async function markOnlineRoundReady(roomId: string): Promise<Room> {
  const { data, error } = await client().rpc('mark_round_ready', { p_room_id: roomId });
  if (error) throw toOnlineError(error);
  return data as Room;
}

export async function submitOnlineEstimate(
  roomId: string,
  round: number,
  estimateCm: number,
): Promise<SubmitResult> {
  const { data, error } = await client().rpc('submit_estimate', {
    p_room_id: roomId,
    p_round: round,
    p_estimate: estimateCm,
  });
  if (error) throw toOnlineError(error);
  return data as SubmitResult;
}

export async function advanceOnlineRound(roomId: string): Promise<Room> {
  const { data, error } = await client().rpc('advance_round', { p_room_id: roomId });
  if (error) throw toOnlineError(error);
  return data as Room;
}

export async function leaveOnlineRoom(roomId: string): Promise<void> {
  const { error } = await client().rpc('leave_room', { p_room_id: roomId });
  if (error) throw toOnlineError(error);
}

export async function rematchOnlineRoom(
  roomId: string,
  categoryId: string,
  seconds: number,
  rounds: Challenge[],
): Promise<Room> {
  const { data, error } = await client().rpc('rematch_room', {
    p_room_id: roomId,
    p_category: categoryId,
    p_seconds: seconds,
    p_rounds: rounds,
  });
  if (error) throw toOnlineError(error);
  return data as Room;
}

export async function sendHeartbeat(roomId: string): Promise<void> {
  const { error } = await client().rpc('heartbeat', { p_room_id: roomId });
  if (error) throw toOnlineError(error);
}

export async function claimRoomHost(roomId: string): Promise<Room> {
  const { data, error } = await client().rpc('claim_host', { p_room_id: roomId });
  if (error) throw toOnlineError(error);
  return data as Room;
}

export async function fetchRoomSnapshot(roomId: string): Promise<RoomSnapshot> {
  const sb = client();
  const [roomResult, playersResult, submissionsResult, answersResult, revealedResult] = await Promise.all([
    sb.from('rooms').select('*').eq('id', roomId).maybeSingle(),
    sb.from('room_players').select('*').eq('room_id', roomId).order('joined_at', { ascending: true }),
    sb
      .from('room_submissions')
      .select('*')
      .eq('room_id', roomId)
      .order('round_index', { ascending: true }),
    sb
      .from('room_round_answers')
      .select('*')
      .eq('room_id', roomId)
      .order('round_index', { ascending: true }),
    // The RPC is the reliable path: it applies the reveal rule itself instead of
    // depending on the answers RLS policy being up to date.
    sb.rpc('get_revealed_answers', { p_room_id: roomId }),
  ]);

  if (roomResult.error) throw toOnlineError(roomResult.error);
  if (!roomResult.data) throw new OnlineError('ROOM_NOT_FOUND');
  if (playersResult.error) throw toOnlineError(playersResult.error);
  if (submissionsResult.error) throw toOnlineError(submissionsResult.error);

  const fromRpc = revealedResult.error
    ? []
    : ((revealedResult.data ?? []) as Array<{ round_index: number; actual_cm: number }>).map((row) => ({
        room_id: roomId,
        round_index: row.round_index,
        actual_cm: row.actual_cm,
      }));

  const answers = fromRpc.length > 0 ? fromRpc : ((answersResult.data ?? []) as RoomAnswer[]);

  return {
    room: roomResult.data as Room,
    players: (playersResult.data ?? []) as RoomPlayer[],
    submissions: (submissionsResult.data ?? []) as RoomSubmission[],
    answers,
  };
}
