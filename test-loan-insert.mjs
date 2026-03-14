import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testLoanInsert() {
    console.log("Testing loan insertion (exact action payload)...");

    // Need to get valid IDs for the required foreign keys (institution_id, etc.)
    const { data: inst } = await supabase.from('institutions').select('id').limit(1).single();
    const { data: user } = await supabase.from('users').select('id').limit(1).single();
    const { data: client } = await supabase.from('clients').select('id').limit(1).single();

    if (!inst || !user || !client) {
        console.log("Missing required referenced data to test:", { inst, user, client });
        return;
    }

    // Exact payload createLoanAction sends:
    const payloadToInsert = {
        institution_id: inst.id,
        client_id: client.id,
        contract_number: "TEST-0002",
        loan_amount: 1000,
        interest_rate: 10,
        interest_type: "fixed",
        frequency: "monthly",
        installments_count: 10,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 10)).toISOString().split('T')[0],

        status: "active",
        created_by: user.id,
        agent_id: null,
        commission_amount: 0,
        total_amount: 1100,
        total_to_pay: 1100,
        installment_amount: 110,
        late_fee_rate: 2,
        mora_rate: 1,
    };

    const { data, error } = await supabase
        .from("loans")
        .insert(payloadToInsert)
        .select()
        .single();

    if (error) {
        console.error("Loan Creation Error Details:");
        console.error(JSON.stringify(error, null, 2));
    } else {
        console.log("Inserted loan successfully:", data.id);
        await supabase.from("loans").delete().eq("id", data.id);
    }
}

testLoanInsert();
