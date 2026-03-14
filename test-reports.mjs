import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Checking database counts for reports...');

  const { data: loans, error: loansError } = await supabase
    .from('loans')
    .select('id, loan_amount, status, created_at')
    .neq('status', 'cancelled');
  
  if (loansError) console.error('Loans Error:', loansError);
  console.log(`Found ${loans?.length || 0} active loans.`);
  
  const totalLent = loans?.reduce((sum, l) => sum + Number(l.loan_amount), 0) || 0;
  console.log(`Total Lent Amount: ${totalLent}`);

  console.log('---');

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('id, amount, status, payment_date')
    .eq('status', 'paid');
    
  if (paymentsError) console.error('Payments Error:', paymentsError);
  console.log(`Found ${payments?.length || 0} paid payments.`);

  const totalReceived = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  console.log(`Total Received Amount: ${totalReceived}`);
}

checkData();
