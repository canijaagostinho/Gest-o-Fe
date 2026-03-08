
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const logFile = path.resolve(process.cwd(), 'scripts/cleanup-log.txt')

function log(msg: string) {
    console.log(msg)
    fs.appendFileSync(logFile, msg + '\n')
}

async function run() {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile)
    log('--- TARGETED INSTITUTION CLEANUP ---')

    // Find user "JQ" - initials from screenshot
    const { data: users } = await supabase.from('users').select('id, institution_id, full_name')
    log(`Checking ${users?.length} users...`)

    // The screenshot shows 'JQ' as initials. Let's look for Joaquim or someone with these initials.
    const targetUser = users?.find(u => u.full_name?.includes('Joaquim') || u.full_name?.startsWith('J'))

    if (!targetUser) {
        log('Error: Could not identify target institution via user initials JQ.')
        return
    }

    const instId = targetUser.institution_id
    log(`Target User: ${targetUser.full_name} | Institution ID: ${instId}`)

    if (!instId) {
        log('Error: Target user has no institution_id.')
        return
    }

    // 1. Delete ALL payments for this institution that show as "Desconhecido"
    // "Desconhecido" happens when the joining loan/client is missing.
    const { data: payments } = await supabase
        .from('payments')
        .select('id, loan_id')
        .eq('institution_id', instId)

    log(`Analyzing ${payments?.length} payments for this institution...`)

    const toDelete: string[] = []
    if (payments) {
        for (const p of payments) {
            if (!p.loan_id) {
                log(`  -> Payment ${p.id} has NO loan_id. Marking for deletion.`)
                toDelete.push(p.id)
                continue
            }

            const { data: loan } = await supabase.from('loans').select('id').eq('id', p.loan_id).single()
            if (!loan) {
                log(`  -> Payment ${p.id} linked to non-existent loan ${p.loan_id}. Marking for deletion.`)
                toDelete.push(p.id)
            }
        }
    }

    if (toDelete.length > 0) {
        log(`Deleting ${toDelete.length} invalid/orphan payments...`)
        const { error } = await supabase.from('payments').delete().in('id', toDelete)
        if (error) log('Error deleting: ' + error.message)
        else log('Success: Invalid payments deleted.')
    } else {
        log('No invalid payments found for this institution.')
    }

    log('--- CLEANUP FINISHED ---')
}

run()
