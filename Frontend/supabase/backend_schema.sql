-- EXTEND PROFILES
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS github_username TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 1. ACTIVITY LOGS (For Heatmap)
CREATE TABLE activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('LOGIN', 'PROBLEM_SOLVED', 'COMPETITION_JOINED', 'INTERVIEW_COMPLETED')),
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity" 
    ON activity_logs FOR SELECT 
    USING (auth.uid() = user_id);

-- 2. PROBLEMS (DSA Questions)
CREATE TABLE problems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    topic TEXT NOT NULL,
    starter_code TEXT, -- JSON or Text for different languages
    test_cases JSONB DEFAULT '[]'::JSONB, -- Hidden test cases
    points INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE problems ENABLE ROW LEVEL SECURITY;

-- Everyone can read problems
CREATE POLICY "Everyone can read problems" 
    ON problems FOR SELECT 
    USING (true);

-- Only teachers/admins can create/edit (Checking role via profiles)
CREATE POLICY "Teachers can manage problems" 
    ON problems FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'TEACHER'
        )
    );

-- 3. COMPETITIONS (Game Rooms)
CREATE TABLE competitions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED')),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    difficulty TEXT CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active competitions" 
    ON competitions FOR SELECT 
    USING (true);

CREATE POLICY "Teachers can manage their competitions" 
    ON competitions FOR ALL 
    USING (auth.uid() = creator_id);

-- 4. COMPETITION PARTICIPANTS
CREATE TABLE competition_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED', 'PARTICIPATING', 'COMPLETED')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(competition_id, user_id)
);

ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants" 
    ON competition_participants FOR SELECT 
    USING (true);

CREATE POLICY "Users can join" 
    ON competition_participants FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 5. SUBMISSIONS (For Problem Solving)
CREATE TABLE submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL, -- Optional (might be practice)
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'ERROR')),
    runtime_ms INTEGER,
    memory_usage_kb INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own submissions" 
    ON submissions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users create submissions" 
    ON submissions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);


-- SEED DATA (Optional - to get started)
INSERT INTO problems (title, slug, description, difficulty, topic, points)
VALUES 
('Two Sum', 'two-sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'EASY', 'Arrays', 10),
('Reverse Linked List', 'reverse-linked-list', 'Given the head of a singly linked list, reverse the list, and return the reversed list.', 'MEDIUM', 'LinkedList', 20),
('Valid Palindrome', 'valid-palindrome', 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.', 'EASY', 'Strings', 10);
