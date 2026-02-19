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
    global: {
      // @supabase/supabase-js v2.9x passes `duplex: 'half'` and AbortSignal
      // which are Node.js-only options that the browser's native fetch rejects.
      // We rebuild RequestInit with only the standard browser-compatible properties.
      fetch: (url: RequestInfo | URL, init?: RequestInit) => {
        const raw = (init ?? {}) as Record<string, unknown>;
        const urlStr =
          typeof url === "string"
            ? url
            : url instanceof URL
            ? url.href
            : (url as { url: string }).url;

        // Log exactly what is being passed so we can diagnose the issue
        console.log("[KAHU] fetch →", urlStr);
        console.log("[KAHU] init keys:", Object.keys(raw));
        for (const [k, v] of Object.entries(raw)) {
          console.log(
            `[KAHU]   ${k}:`,
            v instanceof Headers
              ? `Headers(${JSON.stringify(Object.fromEntries((v as Headers).entries()))})`
              : v instanceof ReadableStream
              ? "ReadableStream"
              : typeof v === "string"
              ? v.substring(0, 80)
              : typeof v
          );
        }

        const safeInit: RequestInit = {};
        if (raw.method) safeInit.method = raw.method as string;
        if (raw.headers) safeInit.headers = raw.headers as HeadersInit;
        if (raw.body !== undefined && raw.body !== null)
          safeInit.body = raw.body as BodyInit;
        if (raw.mode) safeInit.mode = raw.mode as RequestMode;
        if (raw.credentials)
          safeInit.credentials = raw.credentials as RequestCredentials;
        if (raw.cache) safeInit.cache = raw.cache as RequestCache;
        if (raw.redirect) safeInit.redirect = raw.redirect as RequestRedirect;
        if (raw.referrer) safeInit.referrer = raw.referrer as string;
        if (raw.integrity) safeInit.integrity = raw.integrity as string;

        console.log("[KAHU] safeInit:", JSON.stringify(safeInit, null, 2));
        return window.fetch(urlStr, safeInit);
      },
    },
  });

  return _client;
}
