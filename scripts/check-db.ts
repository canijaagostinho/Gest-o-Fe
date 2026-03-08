import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
    console.log('Checking connection to:', supabaseUrl)

    // Try to list tables (using a common query or just checking if we can query public schema)
    const { data, error } = await supabase
        .from('profiles') // Assuming there might be a profiles table
        .select('*')
        .limit(1)

    if (error) {
        console.log('Error or table "profiles" missing:', error.message)

        // Try to get all tables via RPC or standard metadata if possible, 
        // but usually anon key can't do that easily unless allowed.
        // Let's just try to see if we can execute a basic count on a table we expect.
    } else {
        console.log('Successfully connected to "profiles" table.')
    }

    // List schemas/tables if we had service role, but we only have anon.
    // We can try to see what's in the project by checking other common table names.
    const commonTables = ['clients', 'loans', 'payments', 'institutions', 'users']
    for (const table of commonTables) {
        const { error: tableError } = await supabase.from(table).select('count').limit(0)
        if (tableError) {
            console.log(`Table "${table}": ${tableError.message}`)
        } else {
            console.log(`Table "${table}": Exists`)
        }
    }
}

checkDatabase()
