import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function inspectTables() {
    const tables = ['clients', 'loans', 'payments', 'institutions', 'users']
    for (const table of tables) {
        console.log(`\n--- ${table} ---`)
        const { data, error } = await supabase.from(table).select('*').limit(1)
        if (error) {
            console.log(`Error: ${error.message}`)
        } else if (data && data.length > 0) {
            console.log('Columns:', Object.keys(data[0]).join(', '))
            console.log('Data sample:', JSON.stringify(data[0], null, 2))
        } else {
            console.log('Table exists but is empty.')
        }
    }
}

inspectTables()
