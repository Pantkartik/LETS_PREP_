import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../Frontend/.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
    console.log('Checking Supabase connection...')
    
    // Try to query problems
    const { data: problems, error: pError } = await supabase.from('problems').select('id').limit(1)
    if (pError) {
        console.error('Error querying "problems" table:', pError.message)
    } else {
        console.log('"problems" table exists and is accessible.')
    }

    // Try to query questions
    const { data: questions, error: qError } = await supabase.from('questions').select('id').limit(1)
    if (qError) {
        console.error('Error querying "questions" table:', qError.message)
    } else {
        console.log('"questions" table exists and is accessible.')
    }

    // Try to list all tables (using RPC if available or a common table)
    const { data: competitions, error: cError } = await supabase.from('competitions').select('id').limit(1)
    if (cError) {
        console.error('Error querying "competitions" table:', cError.message)
    } else {
        console.log('"competitions" table exists and is accessible.')
    }
}

checkTables()
