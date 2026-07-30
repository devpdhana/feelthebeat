import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin Service Role client (only initialized in server contexts)
export const supabaseAdmin = (
  typeof window === "undefined"
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : (null as any)
) as typeof supabase;
