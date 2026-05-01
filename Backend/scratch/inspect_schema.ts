import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../../Frontend/.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key missing')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    console.log('Checking battles schema...')
    const { data, error } = await supabase
        .from('battles')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error fetching competition:', error.message)
    } else if (data && data.length > 0) {
        console.log('Available columns in competitions:', Object.keys(data[0]))
    } else {
        console.log('No data found in competitions table.')
        // Try to fetch from a different table or get schema info if possible
    }
}

checkSchema()
