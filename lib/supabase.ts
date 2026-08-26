import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Public Supabase client
const globalForSupabase = globalThis as unknown as {
  supabase?: SupabaseClient;
  supabaseAdmin?: SupabaseClient;
};

export const supabase = globalForSupabase.supabase ?? createClient(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
}

// Admin Service Role client (only initialized in server contexts)
export const supabaseAdmin = globalForSupabase.supabaseAdmin ?? (
  typeof window === "undefined"
    ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
    : (null as any)
) as typeof supabase;

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabaseAdmin = supabaseAdmin;
}

