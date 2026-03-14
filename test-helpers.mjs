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

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function testHelpers() {
    const { data: users } = await supabaseAdmin.from('users').select('*').not('institution_id', 'is', null).limit(1);
    const testUser = users[0];
    const password = 'TempPassword123!';

    console.log(`Testing as User: ${testUser.id} (${testUser.email})`);

    const { data: authData } = await supabaseAnon.auth.signInWithPassword({
        email: testUser.email,
        password: password
    });

    const jwt = authData.session.access_token;

    // Use RPC to call the helper functions if they were exposed, or just run a query that uses them.
    // Since they aren't RPCs (they are just functions), we can test them by selecting from a table that uses them.

    const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${jwt}` } }
    });

    const { data, error } = await client.from('users').select('id, institution_id').eq('id', testUser.id).single();

    if (error) {
        console.error("Failed to fetch own user record via RLS:", error.message);
    } else {
        console.log("RLS SELECT on 'users' worked:", data);
    }
}

testHelpers();
