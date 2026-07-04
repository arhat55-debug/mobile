import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getConfig, isConfigured } from "./config";

let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!isConfigured()) {
    throw new Error("Supabase тохиргоо хийгдээгүй байна. Vercel-ийн Environment Variables хэсэгт түлхүүрүүдээ оруулна уу.");
  }
  if (!client) {
    client = createClient<Database>(
      getConfig("SUPABASE_URL"),
      getConfig("SUPABASE_ANON_KEY"),
      {
        auth: { persistSession: true, autoRefreshToken: true },
      },
    );
  }
  return client;
}

export function resetSupabase() {
  client = null;
}
