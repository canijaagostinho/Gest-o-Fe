import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const { data: rows, error: err2 } = await supabase.from('loans').select('*').limit(1);
    if (rows && rows.length > 0) {
        fs.writeFileSync('cols.json', JSON.stringify(Object.keys(rows[0])));
    } else {
        // Just send a bogus insert to get the error, but we want the keys of a successful row if we can.
        // If table is empty, we must use a different approach.
        console.log("Table is empty, sending bogus insert to get error details...");
        const payloadToInsert = {
            institution_id: "00000000-0000-0000-0000-000000000000",
            client_id: "00000000-0000-0000-0000-000000000000",
            contract_number: "TEST-0002",
            loan_amount: 1000,
            total_amount: 1100,
            status: "active",
            created_by: "00000000-0000-0000-0000-000000000000"
        };
        const { error } = await supabase.from("loans").insert(payloadToInsert);
        fs.writeFileSync('cols.json', JSON.stringify(error));
    }
}
test();
