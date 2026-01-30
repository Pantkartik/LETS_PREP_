import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

class SupabaseConfig {
    private static instance: SupabaseClient;

    public static getInstance(): SupabaseClient {
        if (!SupabaseConfig.instance) {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !supabaseKey) {
                logger.error('Missing Supabase configuration');
                throw new Error('Missing Supabase URL or Service Role Key');
            }

            SupabaseConfig.instance = createClient(supabaseUrl, supabaseKey, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: false,
                },
            });

            logger.info('Supabase client initialized');
        }

        return SupabaseConfig.instance;
    }
}

export const supabase = SupabaseConfig.getInstance();
