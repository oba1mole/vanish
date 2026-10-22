import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// Configuration is checked when messaging is used, not during app startup.
export function getMessagingConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Secure messaging is temporarily unavailable. Please try again later."
    );
  }

  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

let client;

export function getSupabase() {
  const { url, anonKey } = getMessagingConfig();

  if (!client) {
    client = createClient(
      url,
      anonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        },

        global: {
          headers: {
            "X-Client-Info": "vanish-web"
          }
        }
      }
    );
  }

  return client;
}
