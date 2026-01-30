-- 1. Enable the pg_cron extension
-- This is required to run scheduled jobs. 
-- If this fails with "permission denied", you MUST go to Supabase Dashboard -> Database -> Extensions and enable "pg_cron" there.
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA extensions;

-- Ensure the cron schema is in the search path or reference it fully
-- usually it installs to 'extensions' or 'cron'. Let's assume standard usage.
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions; -- Often useful alongside cron

-- 2. Create the cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_abandoned_rooms()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete rooms that are:
    -- 1. In 'DRAFT' or 'ACTIVE' status
    -- 2. Created more than 15 minutes ago
    -- 3. Have NO participants (count = 0)
    
    DELETE FROM public.competitions
    WHERE (status = 'DRAFT' OR status = 'ACTIVE')
    AND created_at < NOW() - INTERVAL '15 minutes'
    -- Check if there are NO participants EXCLUDING the creator
    AND NOT EXISTS (
        SELECT 1 FROM public.competition_participants cp
        WHERE cp.competition_id = competitions.id
        AND cp.user_id != competitions.creator_id
    );
END;
$$;

-- 3. Schedule the job
-- We use Dynamic SQL to invoke cron to avoid parse errors if the extension isn't installed yet
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'cron') THEN
        PERFORM cron.schedule(
            'cleanup-abandoned-rooms',
            '*/5 * * * *', -- Every 5 minutes
            'SELECT public.cleanup_abandoned_rooms()'
        );
    ELSIF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'extensions') THEN
        -- Sometimes it lives in extensions schema
        -- Try to call it if it exists there (custom setup)
        -- Otherwise, just printing a warning message (as RAISES NOTICE)
        RAISE NOTICE 'pg_cron extension not found in "cron" schema. Please enable via Dashboard.';
    END IF;
END $$;
