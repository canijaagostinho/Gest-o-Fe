import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkAccounts() {
    console.log("Fetching from accounts...");
    const { data: accounts, error: errorAccounts } = await supabaseAdmin.from('accounts').select('*').limit(1);

    if (errorAccounts) {
        console.error("Failed to fetch accounts:", errorAccounts);
    } else {
        console.log("Accounts fetched successfully:", accounts);
    }
}

checkAccounts();
