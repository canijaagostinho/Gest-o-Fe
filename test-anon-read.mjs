import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRead() {
    console.log("Testing ANON read on 'accounts'...");
    const { data, error } = await supabase.from('accounts').select('id').limit(1);
    if (error) {
        console.error("ANON Read Failed:", error.message, error.code);
    } else {
        console.log("ANON Read Succeeded:", data);
    }
}

testRead();
