import type { Challenge } from '@/types/game';

export type RoomStatus = 'waiting' | 'playing' | 'finished' | 'abandoned';

export interface Room {
  id: string;
  code: string;
  host_user_id: string;
  category_id: string;
  status: RoomStatus;
  rounds_count: number;
  seconds_per_round: number;
  reveal_seconds: number;
  current_round: number;
  round_started_at: string | null;
  round_ends_at: string | null;
  /** First-round readiness deadline. Null once the round has actually started. */
  round_starts_by: string | null;
  /**
   * Public round data. `target.cm` is intentionally only an order of magnitude,
   * not the exact answer. Exact sizes come from `room_round_answers` after the
   * round is revealed.
   */
  rounds: Challenge[];
  submitted_count: number;
  created_at: string;
  updated_at: string;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  user_id: string;
  name: string;
  is_host: boolean;
  total_score: number;
  /** Highest round index this player has confirmed loading. -1 before round 1. */
  ready_round: number;
  joined_at: string;
  last_seen_at: string;
}

export interface RoomSubmission {
  id: number;
  room_id: string;
  player_id: string;
  round_index: number;
  estimate_cm: number;
  actual_cm: number;
  relative_error: number;
  score: number;
  submitted_at: string;
}

export interface RoomAnswer {
  room_id: string;
  round_index: number;
  actual_cm: number;
}

export interface RoomSnapshot {
  room: Room;
  players: RoomPlayer[];
  submissions: RoomSubmission[];
  answers: RoomAnswer[];
}

export interface CreateRoomInput {
  name: string;
  categoryId: string;
  seconds: number;
  rounds: Challenge[];
}

export interface JoinRoomResult {
  room: Room;
  player: RoomPlayer;
  rejoined?: boolean;
}

export interface SubmitResult {
  submission: RoomSubmission;
  duplicate: boolean;
}
