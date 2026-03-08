import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
    const tables = ['accounts', 'commissions', 'agents', 'transactions', 'loans', 'installments'];
    let results = {};
    for (const t of tables) {
        const { error } = await supabaseAdmin.from(t).select('id').limit(1);
        if (error && error.code === 'PGRST204') {
            results[t] = "MISSING";
        } else if (error) {
            results[t] = "ERROR: " + error.message;
        } else {
            results[t] = "EXISTS";
        }
    }
    fs.writeFileSync(path.resolve(__dirname, 'table_results.json'), JSON.stringify(results, null, 2));
}

checkTables();
