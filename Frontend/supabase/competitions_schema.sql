-- =====================================================
-- COMPETITION SYSTEM - SAFE MIGRATION
-- This handles both new installations and existing tables
-- =====================================================

-- STEP 1: Drop existing problematic objects
-- =====================================================
DROP VIEW IF EXISTS competition_leaderboard CASCADE;
DROP FUNCTION IF EXISTS process_submission(UUID, BOOLEAN, INTEGER, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_competition_rankings(UUID) CASCADE;

-- STEP 2: Handle existing tables or create new ones
-- =====================================================

-- Competitions table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'competitions') THEN
        CREATE TABLE competitions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            difficulty TEXT CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
            max_participants INTEGER DEFAULT 50,
            creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            invite_code TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Add new columns to competitions
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS selected_problems UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 120,
ADD COLUMN IF NOT EXISTS penalty_per_wrong INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_rank_display INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE;

-- Competition participants table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'competition_participants') THEN
        CREATE TABLE competition_participants (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            problems_solved INTEGER DEFAULT 0,
            total_submissions INTEGER DEFAULT 0,
            wrong_submissions INTEGER DEFAULT 0,
            penalty_time INTEGER DEFAULT 0,
            total_time INTEGER DEFAULT 0,
            rank_position INTEGER,
            score DECIMAL(10, 2) DEFAULT 0.00,
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_submission_at TIMESTAMP WITH TIME ZONE,
            UNIQUE(competition_id, user_id)
        );
    END IF;
END $$;

-- Add missing columns to existing competition_participants
ALTER TABLE competition_participants 
ADD COLUMN IF NOT EXISTS problems_solved INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_submissions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wrong_submissions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS penalty_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rank_position INTEGER,
ADD COLUMN IF NOT EXISTS score DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_submission_at TIMESTAMP WITH TIME ZONE;

-- Competition submissions table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'competition_submissions') THEN
        CREATE TABLE competition_submissions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
            participant_id UUID NOT NULL REFERENCES competition_participants(id) ON DELETE CASCADE,
            problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
            code TEXT NOT NULL,
            language TEXT NOT NULL CHECK (language IN ('cpp', 'java', 'python', 'javascript')),
            status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR')),
            test_cases_passed INTEGER DEFAULT 0,
            total_test_cases INTEGER DEFAULT 0,
            execution_time INTEGER,
            memory_used INTEGER,
            error_message TEXT,
            submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            evaluated_at TIMESTAMP WITH TIME ZONE,
            similarity_score DECIMAL(5, 2),
            ip_address INET,
            user_agent TEXT
        );
    END IF;
END $$;

-- Add missing columns to existing competition_submissions
ALTER TABLE competition_submissions
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS language TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS test_cases_passed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_test_cases INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS execution_time INTEGER,
ADD COLUMN IF NOT EXISTS memory_used INTEGER,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS evaluated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS similarity_score DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- STEP 3: Create indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_comp_participants_competition ON competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_comp_participants_user ON competition_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_comp_participants_rank ON competition_participants(competition_id, rank_position);
CREATE INDEX IF NOT EXISTS idx_comp_submissions_competition ON competition_submissions(competition_id);
CREATE INDEX IF NOT EXISTS idx_comp_submissions_participant ON competition_submissions(participant_id);
CREATE INDEX IF NOT EXISTS idx_comp_submissions_problem ON competition_submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_comp_submissions_status ON competition_submissions(status);

-- STEP 4: Create leaderboard view
-- =====================================================
CREATE VIEW competition_leaderboard AS
SELECT 
    cp.competition_id,
    cp.user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    cp.problems_solved,
    cp.total_submissions,
    cp.wrong_submissions,
    cp.penalty_time,
    cp.total_time,
    cp.score,
    cp.rank_position,
    cp.last_submission_at,
    (cp.total_time + (cp.penalty_time * 60)) as effective_time_seconds
FROM competition_participants cp
JOIN profiles p ON cp.user_id = p.id
ORDER BY 
    cp.competition_id,
    cp.problems_solved DESC,
    effective_time_seconds ASC;

-- STEP 5: Create ranking function
-- =====================================================
CREATE FUNCTION update_competition_rankings(comp_id UUID)
RETURNS void AS $$
BEGIN
    WITH ranked_participants AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                ORDER BY 
                    problems_solved DESC,
                    (total_time + (penalty_time * 60)) ASC,
                    last_submission_at ASC NULLS LAST
            ) as new_rank
        FROM competition_participants
        WHERE competition_id = comp_id
    )
    UPDATE competition_participants cp
    SET rank_position = rp.new_rank
    FROM ranked_participants rp
    WHERE cp.id = rp.id;
END;
$$ LANGUAGE plpgsql;

-- STEP 6: Create submission processing function
-- =====================================================
CREATE FUNCTION process_submission(
    sub_id UUID,
    is_correct BOOLEAN,
    exec_time INTEGER,
    test_passed INTEGER,
    test_total INTEGER
)
RETURNS void AS $$
DECLARE
    v_participant_id UUID;
    v_competition_id UUID;
    v_problem_id UUID;
    v_submitted_at TIMESTAMP WITH TIME ZONE;
    v_started_at TIMESTAMP WITH TIME ZONE;
    v_time_taken INTEGER;
    v_already_solved BOOLEAN;
BEGIN
    SELECT participant_id, competition_id, problem_id, submitted_at
    INTO v_participant_id, v_competition_id, v_problem_id, v_submitted_at
    FROM competition_submissions
    WHERE id = sub_id;
    
    SELECT started_at INTO v_started_at
    FROM competitions
    WHERE id = v_competition_id;
    
    IF v_started_at IS NOT NULL THEN
        v_time_taken := EXTRACT(EPOCH FROM (v_submitted_at - v_started_at))::INTEGER;
    ELSE
        v_time_taken := 0;
    END IF;
    
    SELECT EXISTS(
        SELECT 1 FROM competition_submissions
        WHERE participant_id = v_participant_id
        AND problem_id = v_problem_id
        AND status = 'ACCEPTED'
        AND id != sub_id
    ) INTO v_already_solved;
    
    IF is_correct THEN
        UPDATE competition_submissions
        SET status = 'ACCEPTED',
            test_cases_passed = test_passed,
            total_test_cases = test_total,
            execution_time = exec_time,
            evaluated_at = NOW()
        WHERE id = sub_id;
        
        IF NOT v_already_solved THEN
            UPDATE competition_participants
            SET problems_solved = problems_solved + 1,
                total_submissions = total_submissions + 1,
                total_time = total_time + v_time_taken,
                last_submission_at = v_submitted_at,
                score = (problems_solved + 1) * 100 - (penalty_time * 10)
            WHERE id = v_participant_id;
        ELSE
            UPDATE competition_participants
            SET total_submissions = total_submissions + 1
            WHERE id = v_participant_id;
        END IF;
    ELSE
        UPDATE competition_submissions
        SET status = 'WRONG_ANSWER',
            test_cases_passed = test_passed,
            total_test_cases = test_total,
            execution_time = exec_time,
            evaluated_at = NOW()
        WHERE id = sub_id;
        
        UPDATE competition_participants
        SET total_submissions = total_submissions + 1,
            wrong_submissions = wrong_submissions + 1,
            penalty_time = penalty_time + 10,
            score = (problems_solved * 100) - ((penalty_time + 10) * 10)
        WHERE id = v_participant_id;
    END IF;
    
    PERFORM update_competition_rankings(v_competition_id);
END;
$$ LANGUAGE plpgsql;

-- STEP 7: Row Level Security
-- =====================================================
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view competition participants" ON competition_participants;
DROP POLICY IF EXISTS "Users can view their own participation" ON competition_participants;
DROP POLICY IF EXISTS "Teachers can view all participants" ON competition_participants;

CREATE POLICY "Anyone can view competition participants" 
    ON competition_participants FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can view submissions in their competitions" ON competition_submissions;
DROP POLICY IF EXISTS "Users can submit code" ON competition_submissions;
DROP POLICY IF EXISTS "Teachers can view all submissions" ON competition_submissions;

CREATE POLICY "Users can view submissions in their competitions" 
    ON competition_submissions FOR SELECT 
    USING (
        participant_id IN (
            SELECT id FROM competition_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can submit code" 
    ON competition_submissions FOR INSERT 
    WITH CHECK (
        participant_id IN (
            SELECT id FROM competition_participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can view all submissions" 
    ON competition_submissions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM competitions c
            JOIN classrooms cl ON c.classroom_id = cl.id
            WHERE c.id = competition_id
            AND cl.teacher_id = auth.uid()
        )
    );

-- STEP 8: Success message
-- =====================================================
DO $$ 
BEGIN 
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Competition System Migrated Successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Next: Set yourself as teacher';
    RAISE NOTICE 'UPDATE profiles SET role = ''TEACHER'' WHERE email = ''your-email@example.com'';';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
