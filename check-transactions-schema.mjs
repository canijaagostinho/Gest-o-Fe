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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    const tables = ['transactions', 'accounts'];
    for (const table of tables) {
        console.log(`Checking columns for the '${table}' table...`);
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);

        if (error) {
            console.error(`Failed to fetch ${table}:`, error.message, error.code);
        } else {
            if (data && data.length > 0) {
                console.log(`${table} columns:`, Object.keys(data[0]));
            } else {
                console.log(`No ${table} rows returned to inspect columns.`);
            }
        }
    }
}

checkSchema();
