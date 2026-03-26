
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
  console.log('--- Database Cleanup Started ---');
  
  // 1. Find the duplicates
  const { data: insts } = await supabase.from('institutions').select('*').order('created_at', { ascending: true });
  const seen = new Set();
  const toDelete = insts.filter(i => {
    if (seen.has(i.name)) return true;
    seen.add(i.name);
    return false;
  });

  console.log(`Found ${toDelete.length} institutions to delete.`);

  for (const inst of toDelete) {
    console.log(`\nProcessing duplicate: ${inst.name} (${inst.id})`);

    // Check audit_logs
    const { count: logsCount } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true }).eq('institution_id', inst.id);
    console.log(`- Found ${logsCount} audit logs.`);

    if (logsCount > 0) {
      console.log(`- Deleting logs for ${inst.id}...`);
      const { error: logErr } = await supabase.from('audit_logs').delete().eq('institution_id', inst.id);
      if (logErr) console.error(`  ! Error deleting logs:`, logErr.message);
    }

    // Attempt to delete institution
    console.log(`- Deleting institution ${inst.id}...`);
    const { error: instErr } = await supabase.from('institutions').delete().eq('id', inst.id);
    if (instErr) {
      console.error(`  ! Error deleting institution:`, instErr.message);
      console.log(`  ? Trying to RENAME instead to hide from UI...`);
      await supabase.from('institutions').update({ name: `${inst.name}_DELETED_${Date.now()}` }).eq('id', inst.id);
    } else {
      console.log(`  ✓ Successfully deleted ${inst.name}`);
    }
  }
  
  console.log('\n--- Cleanup Finished ---');
}

cleanup();
