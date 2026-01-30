-- RLS Policies for Tournaments
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view tournaments" ON tournaments;
DROP POLICY IF EXISTS "Teachers can create tournaments" ON tournaments;
DROP POLICY IF EXISTS "Creators can update tournaments" ON tournaments;
DROP POLICY IF EXISTS "Creators can delete tournaments" ON tournaments;

CREATE POLICY "Anyone can view tournaments"
ON tournaments FOR SELECT
USING (true);

CREATE POLICY "Teachers can create tournaments"
ON tournaments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'TEACHER'
  )
);

CREATE POLICY "Creators can update tournaments"
ON tournaments FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Creators can delete tournaments"
ON tournaments FOR DELETE
USING (created_by = auth.uid());

-- RLS Policies for Tournament Participants
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view participants" ON tournament_participants;
DROP POLICY IF EXISTS "Students can join tournaments" ON tournament_participants;
DROP POLICY IF EXISTS "Students can leave tournaments" ON tournament_participants;

CREATE POLICY "Anyone can view participants"
ON tournament_participants FOR SELECT
USING (true);

CREATE POLICY "Students can join tournaments"
ON tournament_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can leave tournaments"
ON tournament_participants FOR DELETE
USING (auth.uid() = user_id);
