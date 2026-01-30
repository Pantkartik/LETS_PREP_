-- Grant permissions for the delete function
-- This is often required for the client to be able to call the RPC function

GRANT EXECUTE ON FUNCTION delete_competition_cascade(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_competition_cascade(uuid) TO service_role;

-- Also ensure RLS policies are refreshed/correct just in case
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can delete themselves" ON competition_participants;
-- (Assuming we only want teachers to delete for now via the cascade function)

-- Just to be safe, grant explicit delete on participants table to authenticated users
-- RLS will still restrict WHICH rows they can delete, but the table-level permission is needed
GRANT DELETE ON competition_participants TO authenticated;
