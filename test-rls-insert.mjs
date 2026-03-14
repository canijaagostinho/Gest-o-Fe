import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function testRLSInsert() {
    console.log("Finding a test user...");
    const { data: users, error: userError } = await supabaseAdmin.from('users').select('*').not('institution_id', 'is', null).limit(1);
    if (userError || !users || users.length === 0) {
        console.error("No valid users found:", userError);
        return;
    }
    const testUser = users[0];
    const newPassword = 'TempPassword123!';

    console.log(`Resetting password for user ${testUser.email}...`);
    const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(testUser.id, { password: newPassword });
    if (resetError) {
        console.error("Failed to reset password:", resetError);
        return;
    }

    console.log(`Logging in as ${testUser.email}...`);
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
        email: testUser.email,
        password: newPassword
    });

    if (authError || !authData.session) {
        console.error("Failed to log in:", authError);
        return;
    }

    // DEBUG ROLE DATA
    const supabaseDebug = createClient(supabaseUrl, supabaseServiceKey);
    const { data: userData, error: userErrorDebug } = await supabaseDebug
        .from("users")
        .select("institution_id, role:roles(name)")
        .eq("id", authData.session.user.id)
        .single();

    console.log("DEBUG User Data from query:", JSON.stringify(userData, null, 2));
    console.log("Role Type:", typeof userData.role);
    console.log("Is Array?", Array.isArray(userData.role));

    console.log("Authenticated. Attempting to insert an account...");
    // Use the authenticated client
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${authData.session.access_token}`
            }
        }
    });

    const { data: account, error: insertError } = await supabaseClient
        .from("accounts")
        .insert({
            name: "Test Account RLS UI Replication",
            balance: 100,
            bank_provider: "outro",
            is_default: false,
            institution_id: testUser.institution_id,
        })
        .select()
        .single();

    if (insertError) {
        console.error("❌ UI Insert Error Captured:");
        console.error(JSON.stringify(insertError, null, 2));
    } else {
        console.log("✅ Insert Succeeded!");
        await supabaseAdmin.from("accounts").delete().eq("id", account.id);
    }
}

testRLSInsert();
