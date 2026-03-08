import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRest() {
    console.log("Checking DB Connection and Security Tables...");

    // Test 1: Can we read roles?
    const { data: roles, error: rolesErr } = await supabase.from('roles').select('name').limit(1);
    if (rolesErr) console.log("Roles Error:", rolesErr.message);
    else console.log("Roles table reachable:", !!roles);

    // Test 2: Can we read notifications?
    const { data: notes, error: notesErr } = await supabase.from('system_notifications').select('id').limit(1);
    if (notesErr) console.log("Notifications Error:", notesErr.message);
    else console.log("Notifications table reachable:", !!notes);
}

checkRest()
