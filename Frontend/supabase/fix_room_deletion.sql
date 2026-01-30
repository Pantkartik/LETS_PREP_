-- ==========================================
-- FIX ROOM DELETION (ROBUST VERSION)
-- Run this script to fix "Foreign Key" errors when deleting rooms.
-- ==========================================

DO $$
BEGIN
    -----------------------------------------------------------------------
    -- 1. Fix 'competition_participants' (The main blocker)
    -- This table definitely exists and links to competitions.
    -----------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'competition_participants'
    ) THEN
        -- Remove old constraint to be sure
        ALTER TABLE competition_participants
        DROP CONSTRAINT IF EXISTS competition_participants_competition_id_fkey;

        -- Add Cascade Delete
        ALTER TABLE competition_participants
        ADD CONSTRAINT competition_participants_competition_id_fkey
        FOREIGN KEY (competition_id)
        REFERENCES competitions(id)
        ON DELETE CASCADE;
    END IF;

    -----------------------------------------------------------------------
    -- 2. Fix 'submissions' (Conditional)
    -- Only applies if the 'submissions' table actually HAS 'competition_id'.
    -- (This avoids the "column does not exist" error)
    -----------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'submissions' 
        AND column_name = 'competition_id'
    ) THEN
        -- Remove old constraint
        ALTER TABLE submissions
        DROP CONSTRAINT IF EXISTS submissions_competition_id_fkey;

        -- Add Cascade Delete
        ALTER TABLE submissions
        ADD CONSTRAINT submissions_competition_id_fkey
        FOREIGN KEY (competition_id)
        REFERENCES competitions(id)
        ON DELETE CASCADE;
    END IF;

END $$;

-- 3. Ensure Teachers can DELETE their own competitions
DROP POLICY IF EXISTS "Teachers can delete their competitions" ON competitions;
CREATE POLICY "Teachers can delete their competitions"
ON competitions
FOR DELETE
USING (auth.uid() = creator_id);

-- 4. Ensure Teachers can DELETE participants (via cascade or directly)
DROP POLICY IF EXISTS "Teachers can delete participants of their rooms" ON competition_participants;
CREATE POLICY "Teachers can delete participants of their rooms"
ON competition_participants
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM competitions
        WHERE competitions.id = competition_participants.competition_id
        AND competitions.creator_id = auth.uid()
    )
);
