import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testSimpleInsert() {
    const { data: users } = await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY).from('users').select('*').not('institution_id', 'is', null).limit(1);
    const testUser = users[0];
    const password = 'TempPassword123!';

    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData } = await supabaseAnon.auth.signInWithPassword({
        email: testUser.email,
        password: password
    });

    const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } }
    });

    console.log("Attempting simple insert WITHOUT .select()...");
    const { error } = await client
        .from("accounts")
        .insert({
            name: "Test Simple Insert",
            balance: 0,
            bank_provider: "outro",
            is_default: false,
            institution_id: testUser.institution_id,
        });

    if (error) {
        console.error("Simple Insert Failed:", error.message, error.code);
    } else {
        console.log("✅ Simple Insert Succeeded!");
        // Clean up
        await createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY).from('accounts').delete().eq('name', 'Test Simple Insert');
    }
}

testSimpleInsert();
