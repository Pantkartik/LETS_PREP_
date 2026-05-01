import { createClient } from '@supabase/supabase-js';
import logger from './logger';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role for backend operations

if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

logger.info('Supabase client initialized');

export default supabase;
