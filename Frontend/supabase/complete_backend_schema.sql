-- =====================================================
-- ETS PREP DSA BATTLES SIMULATOR - COMPLETE BACKEND SCHEMA
-- =====================================================
-- This schema is designed to work with existing tables
-- It will update existing tables or create new ones as needed
-- =====================================================

-- =====================================================
-- 1. CORE USER MANAGEMENT & PROFILES
-- =====================================================

-- Enhanced Profiles Table (Update existing or create new)
DO $$ 
BEGIN
    -- Add username column if it doesn't exist (critical for leaderboard)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE profiles ADD COLUMN username TEXT;
        
        -- Set username from full_name (if exists) or email
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
            UPDATE profiles SET username = COALESCE(full_name, split_part(email, '@', 1)) WHERE username IS NULL;
        ELSE
            UPDATE profiles SET username = split_part(email, '@', 1) WHERE username IS NULL;
        END IF;
    END IF;
    
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_battles') THEN
        ALTER TABLE profiles ADD COLUMN total_battles INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_wins') THEN
        ALTER TABLE profiles ADD COLUMN total_wins INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_losses') THEN
        ALTER TABLE profiles ADD COLUMN total_losses INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_streak') THEN
        ALTER TABLE profiles ADD COLUMN current_streak INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'longest_streak') THEN
        ALTER TABLE profiles ADD COLUMN longest_streak INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'rank_position') THEN
        ALTER TABLE profiles ADD COLUMN rank_position INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferred_language') THEN
        ALTER TABLE profiles ADD COLUMN preferred_language TEXT DEFAULT 'python';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'theme_preference') THEN
        ALTER TABLE profiles ADD COLUMN theme_preference TEXT DEFAULT 'dark';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'notification_enabled') THEN
        ALTER TABLE profiles ADD COLUMN notification_enabled BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_active_at') THEN
        ALTER TABLE profiles ADD COLUMN last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Settings & Social Fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name_change_at') THEN
        ALTER TABLE profiles ADD COLUMN last_name_change_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
        ALTER TABLE profiles ADD COLUMN website TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'github_username') THEN
        ALTER TABLE profiles ADD COLUMN github_username TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'twitter_username') THEN
        ALTER TABLE profiles ADD COLUMN twitter_username TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'linkedin_username') THEN
        ALTER TABLE profiles ADD COLUMN linkedin_username TEXT;
    END IF;
END $$;

-- =====================================================
-- 2. PROBLEMS MANAGEMENT
-- =====================================================

-- Update existing problems table or create new
DO $$ 
BEGIN
    -- Rename 'topic' to 'category' if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'topic') THEN
        ALTER TABLE problems RENAME COLUMN topic TO category;
    END IF;
    
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'constraints') THEN
        ALTER TABLE problems ADD COLUMN constraints TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'tags') THEN
        ALTER TABLE problems ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'sample_input') THEN
        ALTER TABLE problems ADD COLUMN sample_input TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'sample_output') THEN
        ALTER TABLE problems ADD COLUMN sample_output TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'explanation') THEN
        ALTER TABLE problems ADD COLUMN explanation TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'hints') THEN
        ALTER TABLE problems ADD COLUMN hints TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'solution_code') THEN
        ALTER TABLE problems ADD COLUMN solution_code JSONB DEFAULT '{}'::JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'time_limit_ms') THEN
        ALTER TABLE problems ADD COLUMN time_limit_ms INTEGER DEFAULT 2000;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'memory_limit_mb') THEN
        ALTER TABLE problems ADD COLUMN memory_limit_mb INTEGER DEFAULT 256;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'acceptance_rate') THEN
        ALTER TABLE problems ADD COLUMN acceptance_rate DECIMAL(5,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'total_submissions') THEN
        ALTER TABLE problems ADD COLUMN total_submissions INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'total_accepted') THEN
        ALTER TABLE problems ADD COLUMN total_accepted INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'created_by') THEN
        ALTER TABLE problems ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'approved') THEN
        ALTER TABLE problems ADD COLUMN approved BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'is_active') THEN
        ALTER TABLE problems ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'updated_at') THEN
        ALTER TABLE problems ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Update starter_code to JSONB if it's TEXT
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'starter_code' AND data_type = 'text') THEN
        ALTER TABLE problems ALTER COLUMN starter_code TYPE JSONB USING 
            CASE 
                WHEN starter_code IS NULL THEN '{}'::JSONB
                ELSE jsonb_build_object('python', starter_code)
            END;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_approved ON problems(approved);

-- Update existing problems to be approved
UPDATE problems SET approved = true WHERE approved IS NULL;

-- =====================================================
-- 3. BATTLES (GAME ROOMS)
-- =====================================================

-- Create battles table if not exists
CREATE TABLE IF NOT EXISTS battles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Basic Info
    title TEXT NOT NULL,
    description TEXT,
    room_code TEXT UNIQUE NOT NULL,
    
    -- Configuration
    battle_type TEXT NOT NULL CHECK (battle_type IN ('PUBLIC', 'PRIVATE', 'PRACTICE')),
    status TEXT NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    
    -- Participants
    min_players INTEGER DEFAULT 2,
    max_players INTEGER DEFAULT 50,
    current_players INTEGER DEFAULT 0,
    
    -- Problem Selection
    problem_id UUID REFERENCES problems(id) ON DELETE SET NULL,
    difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    categories TEXT[] DEFAULT '{}',
    
    -- Timing
    time_limit_minutes INTEGER DEFAULT 30,
    scheduled_start_time TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    
    -- Creator
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Settings
    allow_chat BOOLEAN DEFAULT true,
    show_leaderboard BOOLEAN DEFAULT true,
    auto_start BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status);
CREATE INDEX IF NOT EXISTS idx_battles_room_code ON battles(room_code);
CREATE INDEX IF NOT EXISTS idx_battles_created_by ON battles(created_by);

-- Enable RLS
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public battles are viewable by everyone" ON battles;
DROP POLICY IF EXISTS "Users can create battles" ON battles;
DROP POLICY IF EXISTS "Creators can update their battles" ON battles;

-- Create policies
CREATE POLICY "Public battles are viewable by everyone"
    ON battles FOR SELECT
    USING (battle_type = 'PUBLIC' OR created_by = auth.uid());

CREATE POLICY "Users can create battles"
    ON battles FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their battles"
    ON battles FOR UPDATE
    USING (created_by = auth.uid());

-- =====================================================
-- 4. BATTLE PARTICIPANTS
-- =====================================================

CREATE TABLE IF NOT EXISTS battle_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Participation Status
    status TEXT DEFAULT 'JOINED' CHECK (status IN ('JOINED', 'READY', 'ACTIVE', 'SUBMITTED', 'COMPLETED', 'LEFT')),
    
    -- Submission Info
    submission_code TEXT,
    submission_language TEXT,
    submission_time TIMESTAMP WITH TIME ZONE,
    
    -- Results
    test_cases_passed INTEGER DEFAULT 0,
    total_test_cases INTEGER DEFAULT 0,
    execution_time_ms INTEGER,
    memory_used_mb DECIMAL(10,2),
    
    -- Scoring
    score INTEGER DEFAULT 0,
    rank_position INTEGER,
    points_earned INTEGER DEFAULT 0,
    
    -- Timing
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_coding_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(battle_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_battle_participants_battle ON battle_participants(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_participants_user ON battle_participants(user_id);

-- Enable RLS
ALTER TABLE battle_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Participants can view battle participants" ON battle_participants;
DROP POLICY IF EXISTS "Users can join battles" ON battle_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON battle_participants;

-- Create policies
CREATE POLICY "Participants can view battle participants"
    ON battle_participants FOR SELECT
    USING (true);

CREATE POLICY "Users can join battles"
    ON battle_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
    ON battle_participants FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- 5. SUBMISSIONS (Enhanced)
-- =====================================================

-- Add new columns to existing submissions table
DO $$ 
BEGIN
    -- Add battle_id column (for new battle system)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'battle_id') THEN
        ALTER TABLE submissions ADD COLUMN battle_id UUID REFERENCES battles(id) ON DELETE SET NULL;
    END IF;
    
    -- Rename competition_id to battle_id if competition_id exists and battle_id doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'competition_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'battle_id') THEN
        ALTER TABLE submissions RENAME COLUMN competition_id TO battle_id;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'test_case_results') THEN
        ALTER TABLE submissions ADD COLUMN test_case_results JSONB DEFAULT '[]'::JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'passed_count') THEN
        ALTER TABLE submissions ADD COLUMN passed_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'total_count') THEN
        ALTER TABLE submissions ADD COLUMN total_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'execution_time_ms') THEN
        ALTER TABLE submissions ADD COLUMN execution_time_ms INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'memory_used_mb') THEN
        ALTER TABLE submissions ADD COLUMN memory_used_mb DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'error_message') THEN
        ALTER TABLE submissions ADD COLUMN error_message TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'error_line') THEN
        ALTER TABLE submissions ADD COLUMN error_line INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'score') THEN
        ALTER TABLE submissions ADD COLUMN score INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'is_best_submission') THEN
        ALTER TABLE submissions ADD COLUMN is_best_submission BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'evaluated_at') THEN
        ALTER TABLE submissions ADD COLUMN evaluated_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'submitted_at') THEN
        ALTER TABLE submissions ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Rename runtime_ms to execution_time_ms if runtime_ms exists AND execution_time_ms doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'runtime_ms') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'execution_time_ms') THEN
        ALTER TABLE submissions RENAME COLUMN runtime_ms TO execution_time_ms;
    END IF;
    
    -- If both runtime_ms and execution_time_ms exist, drop runtime_ms
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'runtime_ms') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'execution_time_ms') THEN
        ALTER TABLE submissions DROP COLUMN runtime_ms;
    END IF;
    
    -- Rename memory_usage_kb to memory_used_mb if memory_usage_kb exists AND memory_used_mb doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'memory_usage_kb') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'memory_used_mb') THEN
        ALTER TABLE submissions RENAME COLUMN memory_usage_kb TO memory_used_mb;
    END IF;
    
    -- If both memory_usage_kb and memory_used_mb exist, drop memory_usage_kb
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'memory_usage_kb') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'memory_used_mb') THEN
        ALTER TABLE submissions DROP COLUMN memory_usage_kb;
    END IF;
    
    -- Update status column to include new statuses
    ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
    ALTER TABLE submissions ADD CONSTRAINT submissions_status_check CHECK (
        status IN (
            'PENDING', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 
            'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED',
            'COMPILATION_ERROR', 'RUNTIME_ERROR', 'SYSTEM_ERROR', 'ERROR'
        )
    );
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_battle ON submissions(battle_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- =====================================================
-- 6. ACHIEVEMENTS & BADGES
-- =====================================================

CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_url TEXT,
    
    category TEXT CHECK (category IN ('BATTLES', 'PROBLEMS', 'STREAK', 'SPECIAL')),
    
    -- Unlock Criteria
    criteria JSONB NOT NULL,
    
    points INTEGER DEFAULT 0,
    rarity TEXT CHECK (rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Everyone can view achievements" ON achievements;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;

-- Create policies
CREATE POLICY "Everyone can view achievements"
    ON achievements FOR SELECT
    USING (true);

CREATE POLICY "Users can view own achievements"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

-- =====================================================
-- 7. CHAT MESSAGES (Battle Chat)
-- =====================================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'SYSTEM', 'CODE_SNIPPET')),
    
    is_deleted BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_battle ON chat_messages(battle_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Battle participants can view messages" ON chat_messages;
DROP POLICY IF EXISTS "Battle participants can send messages" ON chat_messages;

-- Create policies
CREATE POLICY "Battle participants can view messages"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM battle_participants
            WHERE battle_participants.battle_id = chat_messages.battle_id
            AND battle_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Battle participants can send messages"
    ON chat_messages FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM battle_participants
            WHERE battle_participants.battle_id = chat_messages.battle_id
            AND battle_participants.user_id = auth.uid()
        )
    );

-- =====================================================
-- 8. TOURNAMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    title TEXT NOT NULL,
    description TEXT,
    
    -- Configuration
    tournament_type TEXT CHECK (tournament_type IN ('SINGLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS')),
    status TEXT DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'REGISTRATION', 'ACTIVE', 'COMPLETED')),
    
    -- Timing
    registration_start TIMESTAMP WITH TIME ZONE,
    registration_end TIMESTAMP WITH TIME ZONE,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    
    -- Participants
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    
    -- Prizes
    prize_pool JSONB DEFAULT '{}'::JSONB,
    
    -- Creator
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    seed_position INTEGER,
    current_round INTEGER DEFAULT 1,
    total_score INTEGER DEFAULT 0,
    rank_position INTEGER,
    
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tournament_id, user_id)
);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('BATTLE_INVITE', 'BATTLE_START', 'ACHIEVEMENT', 'SYSTEM')),
    
    link_url TEXT,
    
    is_read BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Create policies
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- 10. HELPER FUNCTIONS
-- =====================================================

-- Function to generate unique room code
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update battle participant count
CREATE OR REPLACE FUNCTION update_battle_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE battles 
        SET current_players = current_players + 1
        WHERE id = NEW.battle_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE battles 
        SET current_players = current_players - 1
        WHERE id = OLD.battle_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS battle_participant_count_trigger ON battle_participants;

-- Create trigger for participant count
CREATE TRIGGER battle_participant_count_trigger
AFTER INSERT OR DELETE ON battle_participants
FOR EACH ROW
EXECUTE FUNCTION update_battle_participant_count();

-- Function to update user statistics
CREATE OR REPLACE FUNCTION update_user_stats_on_battle_complete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED') THEN
        -- Update total battles
        UPDATE profiles
        SET total_battles = total_battles + 1
        WHERE id = NEW.user_id;
        
        -- Update wins if rank is 1
        IF NEW.rank_position = 1 THEN
            UPDATE profiles
            SET total_wins = total_wins + 1,
                current_streak = current_streak + 1,
                longest_streak = GREATEST(longest_streak, current_streak + 1)
            WHERE id = NEW.user_id;
        ELSE
            UPDATE profiles
            SET total_losses = total_losses + 1,
                current_streak = 0
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_user_stats_trigger ON battle_participants;

-- Create trigger for user stats
CREATE TRIGGER update_user_stats_trigger
AFTER UPDATE ON battle_participants
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_battle_complete();

-- Function to update problem acceptance rate
CREATE OR REPLACE FUNCTION update_problem_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('ACCEPTED', 'WRONG_ANSWER') THEN
        UPDATE problems
        SET 
            total_submissions = total_submissions + 1,
            total_accepted = total_accepted + CASE WHEN NEW.status = 'ACCEPTED' THEN 1 ELSE 0 END,
            acceptance_rate = (
                (total_accepted + CASE WHEN NEW.status = 'ACCEPTED' THEN 1 ELSE 0 END)::DECIMAL / 
                (total_submissions + 1)::DECIMAL * 100
            )
        WHERE id = NEW.problem_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_problem_stats_trigger ON submissions;

-- Create trigger for problem stats
CREATE TRIGGER update_problem_stats_trigger
AFTER INSERT ON submissions
FOR EACH ROW
EXECUTE FUNCTION update_problem_stats();

-- =====================================================
-- 11. LEADERBOARDS (Materialized View)
-- =====================================================

-- Drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS global_leaderboard;

-- Create materialized view (only if profiles has required columns)
DO $$
BEGIN
    -- Only create if username column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
        EXECUTE '
        CREATE MATERIALIZED VIEW global_leaderboard AS
        SELECT 
            p.id,
            p.username,
            p.avatar_url,
            COALESCE(p.total_battles, 0) as total_battles,
            COALESCE(p.total_wins, 0) as total_wins,
            COALESCE(p.xp, 0) as xp,
            COALESCE(p.level, 1) as level,
            RANK() OVER (ORDER BY COALESCE(p.xp, 0) DESC) as rank_position
        FROM profiles p
        WHERE p.role = ''STUDENT''
        ORDER BY COALESCE(p.xp, 0) DESC
        ';
    END IF;
END $$;

-- Create index on materialized view (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'global_leaderboard') THEN
        CREATE UNIQUE INDEX IF NOT EXISTS idx_global_leaderboard_id ON global_leaderboard(id);
    END IF;
END $$;

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_global_leaderboard()
RETURNS void AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'global_leaderboard') THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY global_leaderboard;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. SEED ACHIEVEMENTS
-- =====================================================

-- Insert sample achievements (only if they don't exist)
INSERT INTO achievements (name, description, category, criteria, points, rarity)
VALUES
('First Blood', 'Win your first battle', 'BATTLES', '{"type": "battles_won", "count": 1}'::JSONB, 10, 'COMMON'),
('Battle Master', 'Win 10 battles', 'BATTLES', '{"type": "battles_won", "count": 10}'::JSONB, 50, 'RARE'),
('Problem Solver', 'Solve 50 problems', 'PROBLEMS', '{"type": "problems_solved", "count": 50}'::JSONB, 100, 'EPIC'),
('Streak Master', 'Maintain a 7-day streak', 'STREAK', '{"type": "daily_streak", "count": 7}'::JSONB, 30, 'RARE'),
('Speed Demon', 'Complete a problem in under 5 minutes', 'SPECIAL', '{"type": "completion_time", "max_minutes": 5}'::JSONB, 25, 'RARE')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 13. PROFILES TABLE RLS POLICIES (CRITICAL FIX)
-- =====================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles viewable for leaderboard" ON profiles;

-- Allow users to SELECT their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to INSERT their own profile (for auto-creation on signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to UPDATE their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Optional: Allow viewing other profiles for leaderboard/battles
-- Uncomment if you want profiles to be publicly viewable
CREATE POLICY "Public profiles viewable for leaderboard"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Refresh the leaderboard view
SELECT refresh_global_leaderboard();
