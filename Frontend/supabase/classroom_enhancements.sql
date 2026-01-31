-- =====================================================
-- CLASSROOM MANAGEMENT ENHANCEMENTS
-- =====================================================

-- 1. Link Competitions to Classrooms
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS classroom_id UUID REFERENCES classrooms(id) ON DELETE SET NULL;

-- 2. Add performance tracking columns to classroom_students if not exists
-- (Useful for class-specific analytics)
ALTER TABLE classroom_students 
ADD COLUMN IF NOT EXISTS total_points_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS problems_solved INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS battles_won INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. FUNCTION to automatically register all students of a class to a competition
CREATE OR REPLACE FUNCTION register_class_to_competition(comp_id UUID, class_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO competition_participants (competition_id, user_id)
    SELECT comp_id, student_id
    FROM classroom_students
    WHERE classroom_id = class_id
    ON CONFLICT (competition_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 4. Enable Real-time for these tables
-- (Note: Ensure supabase_realtime publication is enabled for these tables in Supabase Dashboard)
-- ALTER PUBLICATION supabase_realtime ADD TABLE classroom_students;
-- ALTER PUBLICATION supabase_realtime ADD TABLE classrooms;
