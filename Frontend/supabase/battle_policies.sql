-- Make sure policies are properly set for battles and participants
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_participants ENABLE ROW LEVEL SECURITY;

-- BATTLES Policies
DROP POLICY IF EXISTS "Public battles are viewable by everyone" ON battles;
DROP POLICY IF EXISTS "Users can create battles" ON battles;
DROP POLICY IF EXISTS "Creators can update their battles" ON battles;

CREATE POLICY "Public battles are viewable by everyone"
    ON battles FOR SELECT
    USING (battle_type = 'PUBLIC' OR created_by = auth.uid());

CREATE POLICY "Users can create battles"
    ON battles FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their battles"
    ON battles FOR UPDATE
    USING (created_by = auth.uid());

-- PARTICIPANTS Policies
DROP POLICY IF EXISTS "Participants can view battle participants" ON battle_participants;
DROP POLICY IF EXISTS "Users can join battles" ON battle_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON battle_participants;

CREATE POLICY "Participants can view battle participants"
    ON battle_participants FOR SELECT
    USING (true);

CREATE POLICY "Users can join battles"
    ON battle_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
    ON battle_participants FOR UPDATE
    USING (auth.uid() = user_id);
