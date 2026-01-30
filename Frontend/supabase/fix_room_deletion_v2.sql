-- Fix for Room Deletion Issue (Corrected)
-- This script safely handles the deletion constraints for competition rooms.

DO $$
BEGIN

    -- 1. Handle Competition Participants (This is the most likely blocker)
    -- Check if the table and constraint exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competition_participants') THEN
        
        -- Drop existing constraint if it exists (to replace it)
        ALTER TABLE competition_participants
        DROP CONSTRAINT IF EXISTS competition_participants_competition_id_fkey;

        -- Add the constraint with specific name and ON DELETE CASCADE
        -- We assume competition_id exists here because the table exists and is used by the app
        ALTER TABLE competition_participants
        ADD CONSTRAINT competition_participants_competition_id_fkey
        FOREIGN KEY (competition_id)
        REFERENCES competitions(id)
        ON DELETE CASCADE;
        
    END IF;

    -- 2. Handle Submissions (Conditional)
    -- Only try to add this constraint if the competition_id column actually exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'competition_id') THEN
        
        ALTER TABLE submissions
        DROP CONSTRAINT IF EXISTS submissions_competition_id_fkey;

        ALTER TABLE submissions
        ADD CONSTRAINT submissions_competition_id_fkey
        FOREIGN KEY (competition_id)
        REFERENCES competitions(id)
        ON DELETE CASCADE;
        
    END IF;

END $$;

-- 3. Ensure RLS Policies allow deletion (This part is safe to run always)
DROP POLICY IF EXISTS "Teachers can delete their competitions" ON competitions;
CREATE POLICY "Teachers can delete their competitions"
ON competitions
FOR DELETE
USING (auth.uid() = creator_id);

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
