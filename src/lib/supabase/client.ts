import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_ variables are embedded at build time in Next.js.
// These values are safe to be public (Supabase anon key is designed to be exposed).
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rzmlzedlzfxcmgaloczh.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bWx6ZWRsemZ4Y21nYWxvY3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDQwNjUsImV4cCI6MjA4NzAyMDA2NX0.ghh-x7cMuYaaMrI6_qUo6RTY_xXpCCmUuMGr0vqPTls";

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
