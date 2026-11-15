-- ============================================================================
-- Scale Clash — Online multiplayer schema
-- Run this file once in Supabase Dashboard → SQL Editor.
-- The app only ever uses the publishable key; service_role is never used here.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_user_id uuid not null references auth.users (id) on delete cascade,
  category_id text not null,
  status text not null default 'waiting',
  rounds_count integer not null default 15,
  seconds_per_round integer not null default 45,
  reveal_seconds integer not null default 5,
  current_round integer not null default 0,
  round_started_at timestamptz,
  round_ends_at timestamptz,
  -- First-round readiness gate: the round starts when every seated player has
  -- loaded the stage, or when this deadline passes (10s), whichever is first.
  round_starts_by timestamptz,
  rounds jsonb not null default '[]'::jsonb,
  submitted_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_code_format check (code ~ '^[A-Z0-9]{6}$'),
  constraint rooms_status_check check (status in ('waiting', 'playing', 'finished', 'abandoned')),
  constraint rooms_rounds_count_check check (rounds_count between 1 and 200),
  constraint rooms_seconds_check check (seconds_per_round between 5 and 300),
  constraint rooms_reveal_check check (reveal_seconds between 3 and 15),
  constraint rooms_current_round_check check (current_round between 0 and 200),
  constraint rooms_submitted_count_check check (submitted_count >= 0)
);

-- Existing installs: widen the allowed round time to include 5-second rounds
-- and add the first-round readiness deadline.
alter table public.rooms drop constraint if exists rooms_seconds_check;
alter table public.rooms add constraint rooms_seconds_check
  check (seconds_per_round between 5 and 300);
alter table public.rooms add column if not exists round_starts_by timestamptz;

create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  is_host boolean not null default false,
  total_score integer not null default 0,
  -- Highest round index this player has confirmed they loaded. The first round
  -- starts only when every seated player has reached it (or the 10s cap).
  ready_round integer not null default -1,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint room_players_name_check check (char_length(name) between 2 and 18),
  constraint room_players_total_score_check check (total_score >= 0),
  unique (room_id, user_id)
);

alter table public.room_players add column if not exists ready_round integer not null default -1;

create unique index if not exists room_players_room_name_key
  on public.room_players (room_id, lower(name));

create index if not exists room_players_room_id_idx
  on public.room_players (room_id);

create table if not exists public.room_submissions (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.rooms (id) on delete cascade,
  player_id uuid not null references public.room_players (id) on delete cascade,
  round_index integer not null,
  estimate_cm numeric(14, 4) not null,
  actual_cm numeric(14, 4) not null,
  relative_error numeric(10, 6) not null,
  score integer not null,
  submitted_at timestamptz not null default now(),
  constraint room_submissions_round_check check (round_index >= 0),
  constraint room_submissions_estimate_check check (estimate_cm > 0),
  constraint room_submissions_actual_check check (actual_cm > 0),
  constraint room_submissions_error_check check (relative_error >= 0),
  constraint room_submissions_score_check check (score between 0 and 100),
  unique (room_id, player_id, round_index)
);

create index if not exists room_submissions_room_round_idx
  on public.room_submissions (room_id, round_index);

create index if not exists room_submissions_player_idx
  on public.room_submissions (player_id);

-- Exact answers live outside the room row. They are only readable after the
-- round ends, so a player cannot read the answer from the public round JSON.
create table if not exists public.room_round_answers (
  room_id uuid not null references public.rooms (id) on delete cascade,
  round_index integer not null,
  actual_cm numeric(14, 4) not null,
  primary key (room_id, round_index),
  constraint room_round_answers_index_check check (round_index >= 0),
  constraint room_round_answers_actual_check check (actual_cm > 0)
);

-- ----------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER so RLS never recurses)
-- ----------------------------------------------------------------------------

create or replace function public.is_room_member(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.room_players
    where room_id = p_room_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_my_player(p_player_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.room_players
    where id = p_player_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.generate_room_code()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  i integer;
begin
  loop
    candidate := '';
    for i in 1..6 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::integer, 1);
    end loop;
    exit when not exists (select 1 from public.rooms where code = candidate);
  end loop;
  return candidate;
end;
$$;

-- Public rounds keep only the order of magnitude of the answer. It gives the
-- client a sane drag range without revealing the exact size. The exact answer
-- is stored in room_round_answers and used only by the server and the reveal.
create or replace function public.coarse_cm(p_cm numeric)
returns numeric
language sql
immutable
set search_path = public
as $$
  select power(10::numeric, round(log(10::numeric, p_cm)))::numeric;
$$;

-- ----------------------------------------------------------------------------
-- RPC: create a room and its host player
-- ----------------------------------------------------------------------------

create or replace function public.create_room(
  p_name text,
  p_category text,
  p_seconds integer,
  p_rounds jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_name text := btrim(coalesce(p_name, ''));
  v_room public.rooms;
  v_player public.room_players;
  v_rounds_count integer;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 18 then
    raise exception 'NAME_INVALID';
  end if;

  if p_category is null or char_length(p_category) < 1 or char_length(p_category) > 40 then
    raise exception 'CATEGORY_INVALID';
  end if;

  if p_seconds is null or p_seconds < 5 or p_seconds > 300 then
    raise exception 'TIME_INVALID';
  end if;

  if p_rounds is null or jsonb_typeof(p_rounds) <> 'array' then
    raise exception 'ROUNDS_INVALID';
  end if;

  v_rounds_count := jsonb_array_length(p_rounds);
  if v_rounds_count < 1 or v_rounds_count > 200 then
    raise exception 'ROUNDS_INVALID';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_rounds) as entry
    where entry -> 'target' ->> 'cm' is null
      or (entry -> 'target' ->> 'cm')::numeric <= 0
  ) then
    raise exception 'ROUNDS_INVALID';
  end if;

  -- Best-effort cleanup: a room with no activity for 12 hours is stale.
  delete from public.rooms
  where updated_at < now() - interval '12 hours';

  insert into public.rooms (
    code,
    host_user_id,
    category_id,
    seconds_per_round,
    rounds_count,
    rounds
  )
  values (
    public.generate_room_code(),
    v_uid,
    p_category,
    p_seconds,
    v_rounds_count,
    (
      select jsonb_agg(
        jsonb_set(
          entry,
          '{target,cm}',
          to_jsonb(public.coarse_cm((entry -> 'target' ->> 'cm')::numeric))
        )
        order by ordinality
      )
      from jsonb_array_elements(p_rounds) with ordinality as rounds(entry, ordinality)
    )
  )
  returning * into v_room;

  insert into public.room_round_answers (room_id, round_index, actual_cm)
  select
    v_room.id,
    (ordinality - 1)::integer,
    (entry -> 'target' ->> 'cm')::numeric
  from jsonb_array_elements(p_rounds) with ordinality as rounds(entry, ordinality);

  insert into public.room_players (room_id, user_id, name, is_host)
  values (v_room.id, v_uid, v_name, true)
  returning * into v_player;

  return jsonb_build_object(
    'room', to_jsonb(v_room),
    'player', to_jsonb(v_player)
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: join (or rejoin) a room by code
-- ----------------------------------------------------------------------------

create or replace function public.join_room(
  p_code text,
  p_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_name text := btrim(coalesce(p_name, ''));
  v_room public.rooms;
  v_player public.room_players;
  v_count integer;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 18 then
    raise exception 'NAME_INVALID';
  end if;

  select *
  into v_room
  from public.rooms
  where code = upper(btrim(coalesce(p_code, '')))
  for update;

  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  -- Reconnect: the same anonymous user keeps the same seat.
  select *
  into v_player
  from public.room_players
  where room_id = v_room.id
    and user_id = v_uid;

  if found then
    update public.room_players
    set last_seen_at = now()
    where id = v_player.id
    returning * into v_player;

    return jsonb_build_object(
      'room', to_jsonb(v_room),
      'player', to_jsonb(v_player),
      'rejoined', true
    );
  end if;

  if v_room.status <> 'waiting' then
    raise exception 'ROOM_STARTED';
  end if;

  select count(*)
  into v_count
  from public.room_players
  where room_id = v_room.id;

  if v_count >= 8 then
    raise exception 'ROOM_FULL';
  end if;

  if exists (
    select 1
    from public.room_players
    where room_id = v_room.id
      and lower(name) = lower(v_name)
  ) then
    raise exception 'NAME_TAKEN';
  end if;

  begin
    insert into public.room_players (room_id, user_id, name)
    values (v_room.id, v_uid, v_name)
    returning * into v_player;
  exception
    when unique_violation then
      raise exception 'NAME_TAKEN';
  end;

  update public.rooms
  set updated_at = now()
  where id = v_room.id;

  return jsonb_build_object(
    'room', to_jsonb(v_room),
    'player', to_jsonb(v_player),
    'rejoined', false
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: host starts the rounds
-- ----------------------------------------------------------------------------

create or replace function public.start_room(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
  v_count integer;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into v_room
  from public.rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if v_room.host_user_id <> v_uid then
    raise exception 'HOST_ONLY';
  end if;

  if v_room.status <> 'waiting' then
    raise exception 'ROOM_NOT_WAITING';
  end if;

  select count(*)
  into v_count
  from public.room_players
  where room_id = v_room.id;

  if v_count < 1 then
    raise exception 'NO_PLAYERS';
  end if;

  update public.room_players
  set ready_round = -1,
      last_seen_at = now()
  where room_id = v_room.id;

  -- Do not start the clock yet. The first round waits for every seated player
  -- to load the stage, with a hard 10-second cap so one stalled device cannot
  -- freeze the room.
  update public.rooms
  set status = 'playing',
      current_round = 0,
      round_started_at = null,
      round_ends_at = null,
      round_starts_by = now() + interval '10 seconds',
      submitted_count = 0,
      updated_at = now()
  where id = v_room.id
  returning * into v_room;

  return to_jsonb(v_room);
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: first-round readiness gate
-- Every client calls this once it has rendered the first round. The round
-- starts when all seated players are ready, or when the 10s cap passes.
-- The call is idempotent and safe to retry while the room is starting.
-- ----------------------------------------------------------------------------

create or replace function public.mark_round_ready(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
  v_total integer;
  v_ready integer;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into v_room
  from public.rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if not public.is_room_member(p_room_id) then
    raise exception 'NOT_IN_ROOM';
  end if;

  -- Already started (or not playing): nothing to gate.
  if v_room.status <> 'playing' or v_room.round_ends_at is not null then
    return to_jsonb(v_room);
  end if;

  update public.room_players
  set ready_round = v_room.current_round,
      last_seen_at = now()
  where room_id = p_room_id
    and user_id = v_uid;

  select count(*)
  into v_total
  from public.room_players
  where room_id = p_room_id;

  select count(*)
  into v_ready
  from public.room_players
  where room_id = p_room_id
    and ready_round >= v_room.current_round;

  if (v_total > 0 and v_ready >= v_total)
    or v_room.round_starts_by is null
    or now() >= v_room.round_starts_by then
    update public.rooms
    set round_started_at = now(),
        round_ends_at = now() + make_interval(secs => v_room.seconds_per_round),
        round_starts_by = null,
        submitted_count = 0,
        updated_at = now()
    where id = p_room_id
    returning * into v_room;
  end if;

  return to_jsonb(v_room);
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: submit an estimate for the current round
-- The score formula is identical to src/lib/scoring.ts:
--   round(100 * max(0, 1 - relativeError / 0.7))
-- ----------------------------------------------------------------------------

create or replace function public.submit_estimate(
  p_room_id uuid,
  p_round integer,
  p_estimate numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
  v_player public.room_players;
  v_actual numeric;
  v_estimate numeric;
  v_error numeric;
  v_score integer;
  v_submission public.room_submissions;
  v_submitted integer;
  v_seated integer;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_estimate is null
    or p_estimate = 'NaN'::numeric
    or p_estimate = 'Infinity'::numeric
    or p_estimate = '-Infinity'::numeric
    or p_estimate <= 0 then
    raise exception 'ESTIMATE_INVALID';
  end if;

  select *
  into v_room
  from public.rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if v_room.status <> 'playing' then
    raise exception 'ROUND_NOT_ACTIVE';
  end if;

  if p_round is null or p_round <> v_room.current_round then
    raise exception 'ROUND_MISMATCH';
  end if;

  -- 2 seconds of network grace; the server clock is the authority.
  if v_room.round_ends_at is null or now() > v_room.round_ends_at + interval '2 seconds' then
    raise exception 'TIME_UP';
  end if;

  select *
  into v_player
  from public.room_players
  where room_id = p_room_id
    and user_id = v_uid;

  if not found then
    raise exception 'NOT_IN_ROOM';
  end if;

  select actual_cm
  into v_actual
  from public.room_round_answers
  where room_id = p_room_id
    and round_index = p_round;

  if not found or v_actual is null or v_actual <= 0 then
    raise exception 'ROUND_INVALID';
  end if;

  -- Clamp exactly like the client does: between 10% and 1000% of the real size.
  v_estimate := least(greatest(p_estimate, v_actual / 10.0), v_actual * 10.0);
  v_error := abs(v_estimate - v_actual) / v_actual;
  v_score := round(100 * greatest(0, 1 - v_error / 0.7))::integer;

  insert into public.room_submissions (
    room_id,
    player_id,
    round_index,
    estimate_cm,
    actual_cm,
    relative_error,
    score
  )
  values (
    p_room_id,
    v_player.id,
    p_round,
    v_estimate,
    v_actual,
    v_error,
    v_score
  )
  on conflict (room_id, player_id, round_index) do nothing
  returning * into v_submission;

  -- Retry after a timeout: return the existing row, never double-count the score.
  if v_submission.id is null then
    select *
    into v_submission
    from public.room_submissions
    where room_id = p_room_id
      and player_id = v_player.id
      and round_index = p_round;

    return jsonb_build_object(
      'submission', to_jsonb(v_submission),
      'duplicate', true
    );
  end if;

  update public.room_players
  set total_score = total_score + v_score,
      last_seen_at = now()
  where id = v_player.id;

  select count(*)
  into v_submitted
  from public.room_submissions
  where room_id = p_room_id
    and round_index = p_round;

  select count(*)
  into v_seated
  from public.room_players
  where room_id = p_room_id;

  -- When every seated player has locked in, close the round immediately so
  -- the reveal starts for everyone at the same instant instead of waiting
  -- out the remaining timer.
  if v_submitted >= greatest(v_seated, 1) then
    update public.rooms
    set submitted_count = v_submitted,
        round_ends_at = least(coalesce(round_ends_at, now()), now()),
        updated_at = now()
    where id = p_room_id;
  else
    update public.rooms
    set submitted_count = v_submitted,
        updated_at = now()
    where id = p_room_id;
  end if;

  return jsonb_build_object(
    'submission', to_jsonb(v_submission),
    'duplicate', false
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: host advances to the next round (host only, idempotent)
-- The reveal stays on screen until the host presses the next-round button.
-- ----------------------------------------------------------------------------

create or replace function public.advance_round(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into v_room
  from public.rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if not public.is_room_member(p_room_id) then
    raise exception 'NOT_IN_ROOM';
  end if;

  if v_room.host_user_id <> v_uid then
    raise exception 'HOST_ONLY';
  end if;

  if v_room.status <> 'playing' then
    return to_jsonb(v_room);
  end if;

  -- A one-second tolerance absorbs clock skew between the host device and the
  -- database without shortening the reveal for everyone else.
  if v_room.round_ends_at is null
    or now() < v_room.round_ends_at + make_interval(secs => v_room.reveal_seconds) - interval '1 second' then
    return to_jsonb(v_room);
  end if;

  if v_room.current_round + 1 >= v_room.rounds_count then
    update public.rooms
    set status = 'finished',
        current_round = v_room.rounds_count,
        round_starts_by = null,
        updated_at = now()
    where id = v_room.id
    returning * into v_room;
  else
    update public.rooms
    set current_round = v_room.current_round + 1,
        round_started_at = now(),
        round_ends_at = now() + make_interval(secs => v_room.seconds_per_round),
        round_starts_by = null,
        submitted_count = 0,
        updated_at = now()
    where id = v_room.id
    returning * into v_room;
  end if;

  return to_jsonb(v_room);
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: leave a room (host transfers to the earliest remaining player)
-- ----------------------------------------------------------------------------

create or replace function public.leave_room(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
  v_player public.room_players;
  v_next public.room_players;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into v_room
  from public.rooms
  where id = p_room_id
  for update;

  if not found then
    return jsonb_build_object('left', true, 'room_closed', true);
  end if;

  select *
  into v_player
  from public.room_players
  where room_id = p_room_id
    and user_id = v_uid;

  if not found then
    return jsonb_build_object('left', true, 'room_closed', false);
  end if;

  delete from public.room_players where id = v_player.id;

  if v_player.is_host then
    select *
    into v_next
    from public.room_players
    where room_id = p_room_id
    order by joined_at asc
    limit 1;

    if found then
      update public.room_players
      set is_host = true
      where id = v_next.id;

      update public.rooms
      set host_user_id = v_next.user_id,
          updated_at = now()
      where id = p_room_id;
    else
      delete from public.rooms where id = p_room_id;
      return jsonb_build_object('left', true, 'room_closed', true);
    end if;
  end if;

  update public.rooms
  set updated_at = now()
  where id = p_room_id;

  return jsonb_build_object('left', true, 'room_closed', false);
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: host restarts a finished room with fresh rounds
-- ----------------------------------------------------------------------------

create or replace function public.rematch_room(
  p_room_id uuid,
  p_category text,
  p_seconds integer,
  p_rounds jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
  v_rounds_count integer;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into v_room
  from public.rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if v_room.host_user_id <> v_uid then
    raise exception 'HOST_ONLY';
  end if;

  if v_room.status <> 'finished' then
    raise exception 'ROOM_NOT_FINISHED';
  end if;

  if p_category is null or char_length(p_category) < 1 or char_length(p_category) > 40 then
    raise exception 'CATEGORY_INVALID';
  end if;

  if p_seconds is null or p_seconds < 5 or p_seconds > 300 then
    raise exception 'TIME_INVALID';
  end if;

  if p_rounds is null or jsonb_typeof(p_rounds) <> 'array' then
    raise exception 'ROUNDS_INVALID';
  end if;

  v_rounds_count := jsonb_array_length(p_rounds);
  if v_rounds_count < 1 or v_rounds_count > 200 then
    raise exception 'ROUNDS_INVALID';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_rounds) as entry
    where entry -> 'target' ->> 'cm' is null
      or (entry -> 'target' ->> 'cm')::numeric <= 0
  ) then
    raise exception 'ROUNDS_INVALID';
  end if;

  delete from public.room_submissions where room_id = p_room_id;
  delete from public.room_round_answers where room_id = p_room_id;

  insert into public.room_round_answers (room_id, round_index, actual_cm)
  select
    p_room_id,
    (ordinality - 1)::integer,
    (entry -> 'target' ->> 'cm')::numeric
  from jsonb_array_elements(p_rounds) with ordinality as rounds(entry, ordinality);

  update public.room_players
  set total_score = 0,
      ready_round = -1,
      last_seen_at = now()
  where room_id = p_room_id;

  update public.rooms
  set category_id = p_category,
      seconds_per_round = p_seconds,
      rounds_count = v_rounds_count,
      rounds = (
        select jsonb_agg(
          jsonb_set(
            entry,
            '{target,cm}',
            to_jsonb(public.coarse_cm((entry -> 'target' ->> 'cm')::numeric))
          )
          order by ordinality
        )
        from jsonb_array_elements(p_rounds) with ordinality as rounds(entry, ordinality)
      ),
      status = 'waiting',
      current_round = 0,
      round_started_at = null,
      round_ends_at = null,
      round_starts_by = null,
      submitted_count = 0,
      updated_at = now()
  where id = p_room_id
  returning * into v_room;

  return to_jsonb(v_room);
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: heartbeat + host takeover when the host disappears
-- ----------------------------------------------------------------------------

create or replace function public.heartbeat(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  update public.room_players
  set last_seen_at = now()
  where room_id = p_room_id
    and user_id = auth.uid();
end;
$$;

create or replace function public.claim_host(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
  v_host public.room_players;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
  into v_room
  from public.rooms
  where id = p_room_id
  for update;

  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  if not public.is_room_member(p_room_id) then
    raise exception 'NOT_IN_ROOM';
  end if;

  if v_room.host_user_id = v_uid then
    return to_jsonb(v_room);
  end if;

  select *
  into v_host
  from public.room_players
  where room_id = p_room_id
    and is_host
  limit 1;

  if found and v_host.last_seen_at > now() - interval '45 seconds' then
    raise exception 'HOST_ACTIVE';
  end if;

  update public.room_players
  set is_host = false
  where room_id = p_room_id
    and is_host;

  update public.room_players
  set is_host = true,
      last_seen_at = now()
  where room_id = p_room_id
    and user_id = v_uid;

  update public.rooms
  set host_user_id = v_uid,
      updated_at = now()
  where id = p_room_id
  returning * into v_room;

  return to_jsonb(v_room);
end;
$$;

-- ----------------------------------------------------------------------------
-- RPC: server clock (used by clients to correct device clock skew)
-- ----------------------------------------------------------------------------

create or replace function public.get_server_now()
returns timestamptz
language sql
stable
as $$
  select now();
$$;

-- ----------------------------------------------------------------------------
-- RPC: revealed answers (exact sizes for rounds that are already over)
-- This mirrors the answers_revealed_read policy but does not depend on RLS, so
-- the reveal always has the exact answer even if policies were not re-applied.
-- ----------------------------------------------------------------------------

create or replace function public.get_revealed_answers(p_room_id uuid)
returns table (round_index integer, actual_cm numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not public.is_room_member(p_room_id) then
    raise exception 'NOT_A_MEMBER';
  end if;

  select * into v_room from public.rooms where id = p_room_id;
  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;

  return query
  select a.round_index, a.actual_cm
  from public.room_round_answers a
  where a.room_id = p_room_id
    and (
      v_room.status = 'finished'
      or v_room.current_round > a.round_index
      or (
        v_room.current_round = a.round_index
        and v_room.round_ends_at is not null
        and now() >= v_room.round_ends_at
      )
    )
  order by a.round_index;
end;
$$;

-- ----------------------------------------------------------------------------
-- Grants: only authenticated (including anonymous) users can call the RPCs.
-- Direct table writes are never granted.
-- ----------------------------------------------------------------------------

revoke all on function public.is_room_member(uuid) from public;
revoke all on function public.is_my_player(uuid) from public;
revoke all on function public.generate_room_code() from public;
revoke all on function public.coarse_cm(numeric) from public;
revoke all on function public.create_room(text, text, integer, jsonb) from public;
revoke all on function public.join_room(text, text) from public;
revoke all on function public.start_room(uuid) from public;
revoke all on function public.mark_round_ready(uuid) from public;
revoke all on function public.submit_estimate(uuid, integer, numeric) from public;
revoke all on function public.advance_round(uuid) from public;
revoke all on function public.leave_room(uuid) from public;
revoke all on function public.rematch_room(uuid, text, integer, jsonb) from public;
revoke all on function public.heartbeat(uuid) from public;
revoke all on function public.claim_host(uuid) from public;
revoke all on function public.get_server_now() from public;
revoke all on function public.get_revealed_answers(uuid) from public;

grant execute on function public.is_room_member(uuid) to authenticated;
grant execute on function public.is_my_player(uuid) to authenticated;
grant execute on function public.create_room(text, text, integer, jsonb) to authenticated;
grant execute on function public.join_room(text, text) to authenticated;
grant execute on function public.start_room(uuid) to authenticated;
grant execute on function public.mark_round_ready(uuid) to authenticated;
grant execute on function public.submit_estimate(uuid, integer, numeric) to authenticated;
grant execute on function public.advance_round(uuid) to authenticated;
grant execute on function public.leave_room(uuid) to authenticated;
grant execute on function public.rematch_room(uuid, text, integer, jsonb) to authenticated;
grant execute on function public.heartbeat(uuid) to authenticated;
grant execute on function public.claim_host(uuid) to authenticated;
grant execute on function public.get_server_now() to authenticated;
grant execute on function public.get_revealed_answers(uuid) to authenticated;

revoke all on public.rooms from anon;
revoke all on public.room_players from anon;
revoke all on public.room_submissions from anon;
revoke all on public.room_round_answers from anon;

revoke insert, update, delete on public.rooms from authenticated;
revoke insert, update, delete on public.room_players from authenticated;
revoke insert, update, delete on public.room_submissions from authenticated;
revoke insert, update, delete on public.room_round_answers from authenticated;

grant select on public.rooms to authenticated;
grant select on public.room_players to authenticated;
grant select on public.room_submissions to authenticated;
grant select on public.room_round_answers to authenticated;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- Non-members cannot read a room at all: there are no spectators.
-- Submissions and exact answers stay hidden until the round is revealed;
-- players can always read their own submission (needed to resume after a
-- refresh).
-- ----------------------------------------------------------------------------

alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.room_submissions enable row level security;
alter table public.room_round_answers enable row level security;

drop policy if exists "rooms_members_read" on public.rooms;
create policy "rooms_members_read"
on public.rooms
for select
to authenticated
using (public.is_room_member(id));

drop policy if exists "players_members_read" on public.room_players;
create policy "players_members_read"
on public.room_players
for select
to authenticated
using (public.is_room_member(room_id));

drop policy if exists "submissions_revealed_read" on public.room_submissions;
create policy "submissions_revealed_read"
on public.room_submissions
for select
to authenticated
using (
  public.is_room_member(room_id)
  and (
    public.is_my_player(player_id)
    or exists (
      select 1
      from public.rooms r
      where r.id = room_submissions.room_id
        and (
          r.status = 'finished'
          or r.current_round > room_submissions.round_index
          or (
            r.current_round = room_submissions.round_index
            and r.round_ends_at is not null
            and now() >= r.round_ends_at
          )
        )
    )
  )
);

drop policy if exists "answers_revealed_read" on public.room_round_answers;
create policy "answers_revealed_read"
on public.room_round_answers
for select
to authenticated
using (
  public.is_room_member(room_id)
  and exists (
    select 1
    from public.rooms r
    where r.id = room_round_answers.room_id
      and (
        r.status = 'finished'
        or r.current_round > room_round_answers.round_index
        or (
          r.current_round = room_round_answers.round_index
          and r.round_ends_at is not null
          and now() >= r.round_ends_at
        )
      )
  )
);

-- ----------------------------------------------------------------------------
-- Realtime: publish the three tables. Full replica identity keeps UPDATE
-- payloads complete for the clients.
-- ----------------------------------------------------------------------------

alter table public.rooms replica identity full;
alter table public.room_players replica identity full;
alter table public.room_submissions replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.rooms;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.room_players;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.room_submissions;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- ----------------------------------------------------------------------------
-- Optional housekeeping (run manually when needed):
-- delete from auth.users
-- where is_anonymous is true
--   and created_at < now() - interval '30 days';
-- ----------------------------------------------------------------------------

-- Raise the round cap on databases that already ran an older copy of this file.
alter table public.rooms drop constraint if exists rooms_rounds_count_check;
alter table public.rooms add constraint rooms_rounds_count_check check (rounds_count between 1 and 200);
alter table public.rooms drop constraint if exists rooms_current_round_check;
alter table public.rooms add constraint rooms_current_round_check check (current_round between 0 and 200);
