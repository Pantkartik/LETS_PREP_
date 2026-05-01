import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../../Frontend/.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function listRPCs() {
    console.log('Listing some metadata...')
    // There isn't a direct way to list RPCs via client easily without postgrest internal calls
    // But we can try to call a dummy one or check if we can query pg_proc (unlikely with anon key)
    
    // Instead, let's try to see if there are any other columns we missed
    const { data, error } = await supabase.rpc('get_service_status') // Guessing
    if (error) console.log('RPC get_service_status failed:', error.message)
}

listRPCs()
