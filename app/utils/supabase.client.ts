import { createBrowserClient } from "@supabase/auth-helpers-remix";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!window.ENV?.SUPABASE_URL || !window.ENV?.SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not properly initialized');
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      window.ENV.SUPABASE_URL,
      window.ENV.SUPABASE_ANON_KEY
    );
  }

  return supabaseClient;
}
