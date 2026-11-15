import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * The publishable credentials ship in the client bundle by design — the anon
 * key is public and row-level security (online-multiplayer.sql) is the guard.
 * Env vars still win when set, e.g. pointing a deployed build at another
 * project. Without this fallback a hosting build with no env config would
 * dead-end on the "online setup" screen.
 */
const FALLBACK_URL = 'https://anulligurlkqpcjxjuwb.supabase.co';
const FALLBACK_ANON_KEY = 'sb_publishable_n_cXa2bCo0sIhYt7n8rW_A_wtKzQGc9';

const url = import.meta.env.VITE_SUPABASE_URL?.trim() || FALLBACK_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || FALLBACK_ANON_KEY;

export const supabaseConfigured = Boolean(url && key);

/**
 * The browser client. Only the publishable key is ever used here; the
 * service_role key must never reach the frontend.
 */
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url as string, key as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'scale-clash:online-auth',
      },
    })
  : null;
