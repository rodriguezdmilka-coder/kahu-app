import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

// Strip all whitespace — JWT tokens are base64url and never contain spaces or newlines.
// This defends against env vars pasted with accidental line breaks.
const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rzmlzedlzfxcmgaloczh.supabase.co"
).replace(/\s/g, "");

const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bWx6ZWRsemZ4Y21nYWxvY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQwNjUsImV4cCI6MjA4NzAyMDA2NX0.ghh-x7cMuYaaMrI6_qUo6RTY_xXpCCmUuMGr0vqPTls"
).replace(/\s/g, "");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any>;

let _client: AnySupabaseClient | null = null;

export function createClient(): AnySupabaseClient {
  if (_client) return _client;

  _client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return _client;
}
