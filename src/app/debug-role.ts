import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugRole() {
  const userId = "00000000-0000-0000-0000-000000000001"; // Placeholder from user info or previous query

  console.log("Checking role for user:", userId);

  const { data: profile, error } = await supabase
    .from("users")
    .select(
      `
            role:roles(name),
            institution_id
        `,
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Profile Data:", JSON.stringify(profile, null, 2));
  console.log("Type of role:", typeof profile?.role);
  console.log("IsArray role:", Array.isArray(profile?.role));
}

debugRole();
