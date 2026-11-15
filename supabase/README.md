# Scale Clash — Online multiplayer setup

The app uses **only** the Supabase publishable key (`sb_publishable_...`). The
`service_role` key must never be placed in the frontend or committed.

## 1. Apply the SQL

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the full contents of `supabase/online-multiplayer.sql`.
3. Run it once. It is safe to re-run: tables use `if not exists`, policies are
   dropped and recreated, and functions use `create or replace`.

## 2. Enable anonymous sessions (required)

Online play uses invisible Supabase anonymous sessions. Players never see a
sign-up form: a session is created automatically on first visit.

1. Supabase Dashboard → **Authentication** → **Providers**.
2. Enable **Anonymous Sign-Ins**.
3. Save.

If this toggle is off, the online screen shows a clear setup message instead of
a broken lobby.

> The default anonymous rate limit is 30 sign-ins per hour per IP. A room of 8
> friends on the same Wi-Fi is fine. If you test heavily, raise it under
> Authentication → Rate Limits.

## 3. Realtime

The SQL adds `rooms`, `room_players`, and `room_submissions` to the
`supabase_realtime` publication. Verify under **Database → Replication** that the
three tables are enabled. Realtime is on by default for new projects.

`room_round_answers` is intentionally **not** in the publication: it holds the
exact answer for every round and is fetched on demand only after the reveal
window. Publishing it would broadcast answers to every subscribed client before
the round ends.

## 4. Environment variables

`.env.local` (already created locally, not committed):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

Restart the dev server after changing env values.

## 5. How the room works

- The host creates a room and picks a field + seconds per round (5/10/20).
- The room code is 6 characters; the invite link is `?room=CODE`.
- Up to 8 players. There is no spectator view: a non-member cannot read the
  room, and an invite link only opens the join form. Joining is closed once the
  room starts; an existing player can still reconnect to their seat.
- Every player sees the same challenge at the same time.
- The first round does **not** start the clock immediately. Every client reports
  `mark_round_ready` after it has loaded the stage; the server starts the round
  when all seated players are ready, or after a 10-second cap so one stalled
  device cannot freeze the room. The lobby-to-first-object transition is
  therefore synchronized.
- The public `rooms.rounds` JSON only carries a coarse target size (an order of
  magnitude), which gives the slider a sane range without leaking the answer.
  The exact size lives in `room_round_answers` and is readable only after the
  round ends.
- The timer is driven by the **database clock**. Clients fetch `get_server_now`
  once and every 30 seconds to correct device clock skew.
- A guess is accepted until `round_ends_at + 2s` (network grace). The score is
  computed on the server with the same formula as the solo game:
  `round(100 * max(0, 1 - relativeError / 0.7))`.
- When the timer ends, everyone sees the reveal for 5 seconds: the real object at
  its true size, every player's estimate on the same measurement stage, and each
  player's error, round points, and total.
- The reveal stays on screen after those 5 seconds. Only the host can start the
  next round (`advance_round` rejects every other member with `HOST_ONLY`). Other
  players see a "waiting for the host" state.
- The host can rematch after the final results; scores and submissions reset and
  fresh rounds are generated.

## 6. Security model

- `rooms`, `room_players`, `room_submissions`, and `room_round_answers` have RLS
  enabled.
- Direct table writes are revoked; all mutations go through `SECURITY DEFINER`
  RPCs that validate membership, host rights, the current round, and the server
  deadline.
- Other players' submissions and the exact answers are hidden by RLS until the
  round ends. Each player can always read their own submission, so a refresh
  mid-round restores the "locked in" state.
- The score is calculated in SQL, not trusted from the client.

> If the reveal ever shows the "reading the ruler" spinner for the full 5
> seconds, the `answers_revealed_read` policy is missing. Re-run
> `supabase/online-multiplayer.sql`; it drops and recreates every policy.

## 7. Testing with two players

Anonymous sessions are stored per browser profile. To simulate two players, use
two different Chrome profiles, one normal window + one incognito window, or two
different browsers. Two tabs in the same profile share the same anonymous user
and therefore the same seat.

## 8. Rotate the shared secret

The `service_role` key was shared in chat. Rotate it from **Settings → API →
Rotate** after setup. Nothing in this project uses it.
