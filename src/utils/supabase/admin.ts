import { createClient } from "@supabase/supabase-js";

// This client bypasses RLS. ONLY use it in server actions/routes and NEVER expose it to the client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
