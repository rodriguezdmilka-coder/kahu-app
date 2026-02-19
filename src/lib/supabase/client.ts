import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any>;

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rzmlzedlzfxcmgaloczh.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bWx6ZWRsemZ4Y21nYWxvY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQwNjUsImV4cCI6MjA4NzAyMDA2NX0.ghh-x7cMuYaaMrI6_qUo6RTY_xXpCCmUuMGr0vqPTls";

// Singleton: one instance shared across all components
let _client: AnySupabaseClient | null = null;

export function createClient(): AnySupabaseClient {
  if (_client) return _client;

  _client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    global: {
      // Strip AbortSignal from fetch options — Next.js 16 production
      // builds produce a non-native AbortSignal that the browser rejects.
      fetch: (url: RequestInfo | URL, init?: RequestInit) => {
        const { signal: _signal, ...safeInit } = init ?? {};
        return fetch(url, safeInit);
      },
    },
  });

  return _client;
}
