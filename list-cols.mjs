import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function listColumns() {
    console.log("Checking columns for 'accounts' and 'transactions'...");

    const { data: accounts, error: accError } = await supabaseAdmin.from('accounts').select('*').limit(1);
    if (!accError && accounts.length > 0) {
        console.log("Accounts columns:", Object.keys(accounts[0]));
    } else if (accError) {
        console.error("Error fetching accounts:", accError.message);
    }

    const { data: transactions, error: txError } = await supabaseAdmin.from('transactions').select('*').limit(1);
    if (!txError && transactions.length > 0) {
        console.log("Transactions columns:", Object.keys(transactions[0]));
    } else if (txError) {
        console.error("Error fetching transactions:", txError.message);
    }

    const { data: columns, error: colError } = await supabaseAdmin.rpc('get_table_columns', { table_name: 'accounts' });
    if (colError) {
        console.log("RPC get_table_columns failed, trying information_schema via select...");
        const { data: infoSchema, error: infoError } = await supabaseAdmin
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', 'accounts');

        if (infoError) {
            console.error("Info schema fallback failed:", infoError.message);
        } else {
            console.log("Accounts columns (info_schema):", infoSchema.map(c => c.column_name));
        }
    }
}

listColumns();
