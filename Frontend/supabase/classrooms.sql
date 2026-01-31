-- =====================================================
-- CLASSROOMS MANAGEMENT SCHEMA
-- =====================================================

-- 1. EXTEND PROFILES WITH ROLES
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'TEACHER')),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Ensure the current user is a teacher for testing (if you need to force it)
-- UPDATE profiles SET role = 'TEACHER' WHERE id = auth.uid();

-- 2. CLASSROOMS TABLE
CREATE TABLE IF NOT EXISTS classrooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    max_students INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;

-- Policies for Classrooms
DROP POLICY IF EXISTS "Public classrooms are viewable by everyone" ON classrooms;
DROP POLICY IF EXISTS "Teachers can manage their classrooms" ON classrooms;

CREATE POLICY "Public classrooms are viewable by everyone" ON classrooms FOR SELECT USING (true);
CREATE POLICY "Teachers can manage their classrooms" ON classrooms FOR ALL USING (auth.uid() = teacher_id);

-- 2. CLASSROOM STUDENTS (Junction Table)
CREATE TABLE IF NOT EXISTS classroom_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(classroom_id, student_id)
);

-- Enable RLS
ALTER TABLE classroom_students ENABLE ROW LEVEL SECURITY;

-- Policies for Classroom Students
DROP POLICY IF EXISTS "Anyone can view classroom students" ON classroom_students;
DROP POLICY IF EXISTS "Students can join classrooms" ON classroom_students;
DROP POLICY IF EXISTS "Teachers can manage students in their classrooms" ON classroom_students;
DROP POLICY IF EXISTS "Teachers can remove students from their classrooms" ON classroom_students;

CREATE POLICY "Anyone can view classroom students" ON classroom_students FOR SELECT USING (true);
CREATE POLICY "Students can join classrooms" ON classroom_students FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers can manage students in their classrooms" 
    ON classroom_students FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM classrooms 
            WHERE classrooms.id = classroom_id 
            AND classrooms.teacher_id = auth.uid()
        )
    );

-- 3. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_invite_code ON classrooms(invite_code);
CREATE INDEX IF NOT EXISTS idx_classroom_students_classroom ON classroom_students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_students_student ON classroom_students(student_id);

-- 4. FUNCTION to generate unique invite code
CREATE OR REPLACE FUNCTION generate_class_invite_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
    is_unique BOOLEAN := FALSE;
BEGIN
    WHILE NOT is_unique LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        
        -- Check uniqueness
        SELECT NOT EXISTS (SELECT 1 FROM classrooms WHERE invite_code = result) INTO is_unique;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
