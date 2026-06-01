import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function unlockAll() {
    console.log("Fetching all subscriptions...");
    const selectUrl = `${supabaseUrl}/rest/v1/subscriptions?select=id,institution_id,status`;
    const getResponse = await fetch(selectUrl, {
        headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
        }
    });

    if (!getResponse.ok) {
        console.error("Failed to fetch subscriptions:", getResponse.status, await getResponse.text());
        return;
    }

    const subs = await getResponse.json();
    console.log(`Found ${subs.length} subscriptions. Updating them one by one...`);

    const farFutureDate = "2030-01-01T22:00:00+00:00";

    for (const sub of subs) {
        console.log(`Updating subscription ${sub.id} (Institution: ${sub.institution_id})...`);
        const patchUrl = `${supabaseUrl}/rest/v1/subscriptions?id=eq.${sub.id}`;
        const patchResponse = await fetch(patchUrl, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                status: 'active',
                trial_end: farFutureDate,
                current_period_end: farFutureDate,
                updated_at: new Date().toISOString()
            })
        });

        if (patchResponse.ok) {
            const updatedData = await patchResponse.json();
            console.log(`Successfully unlocked subscription ${sub.id}!`, updatedData[0]);
        } else {
            console.error(`Failed to update subscription ${sub.id}:`, patchResponse.status, await patchResponse.text());
        }
    }

    console.log("\nAll subscriptions processed! Let's notify PostgREST to reload its schema cache just in case.");
    // In Supabase, if PostgREST cache reload is needed, we can also hit any simple endpoint, 
    // but since we updated data rows directly, PostgREST doesn't even need a schema cache reload 
    // because schema cache only stores table schemas, not table rows! Table rows are read live.
    console.log("Data-level unlock complete!");
}

unlockAll();
