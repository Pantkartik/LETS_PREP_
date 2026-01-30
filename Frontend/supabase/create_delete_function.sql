-- Function to safely delete a competition/room and its dependencies
-- This bypasses RLS and Foreign Key constraints by deleting children first
-- Run this in the Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_competition_cascade(target_room_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (bypassing RLS for cleanup)
SET search_path = public
AS $$
BEGIN
    -- 1. Authorization check: Ensure the user calling this is the creator of the room
    IF NOT EXISTS (
        SELECT 1 FROM competitions 
        WHERE id = target_room_id 
        AND creator_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Not authorized to delete this room';
    END IF;

    -- 2. Delete participants (Bypassing RLS)
    -- This is often the blocker if RLS prevents teachers from deleting participant rows
    DELETE FROM competition_participants WHERE competition_id = target_room_id;

    -- 3. Delete submissions (Dynamic SQL to handle column existence safely)
    -- We use dynamic SQL so this function compiles even if 'competition_id' column is missing from submissions
    BEGIN
        EXECUTE 'DELETE FROM submissions WHERE competition_id = $1' USING target_room_id;
    EXCEPTION 
        WHEN undefined_column THEN 
            -- Ignore if column doesn't exist, as it can't be blocking us
            NULL;
    END;

    -- 4. Delete the room itself
    DELETE FROM competitions WHERE id = target_room_id;
END;
$$;
