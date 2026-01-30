-- Teacher Ratings Table
CREATE TABLE IF NOT EXISTS teacher_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, student_id)
);

-- Enable RLS for ratings
ALTER TABLE teacher_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "everyone can view ratings" ON teacher_ratings;
DROP POLICY IF EXISTS "students can rate teachers" ON teacher_ratings;
DROP POLICY IF EXISTS "students can update own ratings" ON teacher_ratings;

CREATE POLICY "everyone can view ratings" ON teacher_ratings FOR SELECT USING (true);
CREATE POLICY "students can rate teachers" ON teacher_ratings FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "students can update own ratings" ON teacher_ratings FOR UPDATE USING (auth.uid() = student_id);

-- Function to get teacher stats
CREATE OR REPLACE FUNCTION get_teacher_stats(t_id UUID)
RETURNS JSONB AS $$
DECLARE
    total_students_battles INTEGER;
    total_students_tournaments INTEGER;
    unique_students INTEGER;
    avg_rating NUMERIC;
    rating_count INTEGER;
    total_contests INTEGER;
    total_battles INTEGER;
BEGIN
    -- Count unique students who participated in battles created by the teacher
    -- utilizing a CTE to combine participants from battles and tournaments
    WITH teacher_participants AS (
        SELECT bp.user_id
        FROM battle_participants bp
        JOIN battles b ON b.id = bp.battle_id
        WHERE b.created_by = t_id
        
        UNION
        
        SELECT tp.user_id
        FROM tournament_participants tp
        JOIN tournaments t ON t.id = tp.tournament_id
        WHERE t.created_by = t_id
    )
    SELECT COUNT(DISTINCT user_id) INTO unique_students FROM teacher_participants;

    -- Rating
    SELECT AVG(rating), COUNT(*) INTO avg_rating, rating_count
    FROM teacher_ratings
    WHERE teacher_id = t_id;

    -- Contests (Tournaments)
    SELECT COUNT(*) INTO total_contests
    FROM tournaments
    WHERE created_by = t_id;

    -- Battles
    SELECT COUNT(*) INTO total_battles
    FROM battles
    WHERE created_by = t_id;

    RETURN jsonb_build_object(
        'students_participated', COALESCE(unique_students, 0),
        'rating', COALESCE(ROUND(avg_rating, 1), 0),
        'rating_count', COALESCE(rating_count, 0),
        'contests_held', COALESCE(total_contests, 0),
        'battles_held', COALESCE(total_battles, 0)
    );
END;
$$ LANGUAGE plpgsql;
