-- ==========================================
-- 1. AUTH & PROFILES SETUP
-- ==========================================

-- Create profiles table for user metadata
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'TEACHER')),
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  github_username TEXT,
  linkedin_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Handle New User Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', COALESCE(new.raw_user_meta_data->>'role', 'STUDENT'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for New User
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Handle Profile Update Function
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Profile Update
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_update();


-- ==========================================
-- 2. BACKEND TABLES (Problems, Competitions)
-- ==========================================

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('LOGIN', 'PROBLEM_SOLVED', 'COMPETITION_JOINED', 'INTERVIEW_COMPLETED')),
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own activity" ON activity_logs FOR SELECT USING (auth.uid() = user_id);

-- Problems (DSA Questions)
CREATE TABLE IF NOT EXISTS problems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    topic TEXT NOT NULL,
    starter_code TEXT,
    test_cases JSONB DEFAULT '[]'::JSONB,
    points INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read problems" ON problems FOR SELECT USING (true);
CREATE POLICY "Teachers can manage problems" ON problems FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'TEACHER')
);

-- Competitions
CREATE TABLE IF NOT EXISTS competitions (
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
CREATE POLICY "Anyone can view active competitions" ON competitions FOR SELECT USING (true);
CREATE POLICY "Teachers can manage their competitions" ON competitions FOR ALL USING (auth.uid() = creator_id);

-- Competition Participants
CREATE TABLE IF NOT EXISTS competition_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED', 'PARTICIPATING', 'COMPLETED')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(competition_id, user_id)
);
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view participants" ON competition_participants FOR SELECT USING (true);
CREATE POLICY "Users can join" ON competition_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'ERROR')),
    runtime_ms INTEGER,
    memory_usage_kb INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own submissions" ON submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed Data (Only if empty)
INSERT INTO problems (title, slug, description, difficulty, topic, points)
SELECT 'Two Sum', 'two-sum', 'Return indices of the two numbers such that they add up to target.', 'EASY', 'Arrays', 10
WHERE NOT EXISTS (SELECT 1 FROM problems WHERE slug = 'two-sum');

INSERT INTO problems (title, slug, description, difficulty, topic, points)
SELECT 'Reverse Linked List', 'reverse-linked-list', 'Reverse a singly linked list.', 'MEDIUM', 'LinkedList', 20
WHERE NOT EXISTS (SELECT 1 FROM problems WHERE slug = 'reverse-linked-list');
