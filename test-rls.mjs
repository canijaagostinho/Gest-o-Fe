import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase env credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLS() {
    console.log("Testing RLS against 'installments' table as an anonymous/unauthenticated user...");

    const { data, error } = await supabase
        .from('installments')
        .select('*')
        .limit(10);

    if (error) {
        console.error("Query failed:", error.message);
    } else {
        console.log(`Query succeeded. Rows returned: ${data.length}`);
        if (data.length === 0) {
            console.log("✅ SUCCESS: RLS successfully blocked anonymous access. Zero rows returned.");
        } else {
            console.log("❌ FAILURE: RLS allowed anonymous access. Rows leaked!");
            fs.writeFileSync(path.resolve(__dirname, 'output.json'), JSON.stringify(data, null, 2));
            console.log("Saved specific leaked records to output.json");
        }
    }
}

testRLS();
