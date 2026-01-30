-- =======================================================
-- MASTER FIX FOR ROOM DELETION
-- This script does 3 things:
-- 1. Updates Foreign Keys to CASCADE DELETE (Forcefully)
-- 2. Creates a powerful deletion function that bypasses ownership strictly
-- 3. Grants necessary permissions
-- =======================================================

-- PART 1: FORCE CASCADE ON FOREIGN KEYS
-- We identify tables referencing 'competitions' and update them.

DO $$
BEGIN
    -- Fix 'competition_participants'
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'competition_participants') THEN
        ALTER TABLE competition_participants DROP CONSTRAINT IF EXISTS competition_participants_competition_id_fkey;
        ALTER TABLE competition_participants ADD CONSTRAINT competition_participants_competition_id_fkey 
            FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE;
    END IF;

    -- Fix 'submissions' (checking if competition_id exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'competition_id') THEN
        ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_competition_id_fkey;
        ALTER TABLE submissions ADD CONSTRAINT submissions_competition_id_fkey 
            FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE;
    END IF;
    
    -- Fix 'tournament_participants' if it references competitions? (Schema says tournaments, so probably unrelated, but checking names)
    -- Checking if there are other tables referencing competitions
    -- (No easy dynamic SQL for this in a DO block without complex queries, relying on known schema)
END $$;


-- PART 2: THE "SUPER DELETE" FUNCTION
-- This function allows any TEACHER to delete any competition (cleaning up messy creator_ids)
CREATE OR REPLACE FUNCTION delete_competition_cascade(target_room_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_teacher BOOLEAN;
    row_creator_id UUID;
BEGIN
    -- Check if user is a teacher
    SELECT (role = 'TEACHER') INTO is_teacher
    FROM profiles
    WHERE id = auth.uid();

    -- Check room ownership
    SELECT creator_id INTO row_creator_id
    FROM competitions
    WHERE id = target_room_id;

    -- Authorization Logic:
    -- Allow if:
    -- 1. User is the creator
    -- 2. OR User is a TEACHER (Admin power to clean up lists)
    IF (row_creator_id != auth.uid()) AND (is_teacher IS NOT TRUE) THEN
        RAISE EXCEPTION 'Not authorized: You must be the creator or a Teacher.';
    END IF;

    -- Perform Cascading Deletion
    -- A. Participants
    DELETE FROM competition_participants WHERE competition_id = target_room_id;

    -- B. Submissions (Dynamic to avoid column error)
    BEGIN
        EXECUTE 'DELETE FROM submissions WHERE competition_id = $1' USING target_room_id;
    EXCEPTION WHEN undefined_column THEN NULL; END;

    -- C. The Room
    DELETE FROM competitions WHERE id = target_room_id;
END;
$$;


-- PART 3: PERMISSIONS
-- Grant execute to everyone (RLS and function logic handles security)
GRANT EXECUTE ON FUNCTION delete_competition_cascade(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_competition_cascade(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION delete_competition_cascade(uuid) TO anon; -- Just in case

-- Ensure table permissions for fallback manual deletes
GRANT DELETE ON competition_participants TO authenticated;
GRANT DELETE ON competitions TO authenticated;

-- Ensure RLS allows it
DROP POLICY IF EXISTS "Teachers can delete their competitions" ON competitions;
CREATE POLICY "Teachers can delete their competitions"
ON competitions FOR DELETE
USING (
    -- Allow deletion if you are the creator OR if you are a teacher (broad cleanup)
    auth.uid() = creator_id 
    OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'TEACHER')
);

