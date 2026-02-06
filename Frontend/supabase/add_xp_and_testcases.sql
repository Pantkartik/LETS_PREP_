-- Add XP to profiles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'xp') THEN
        ALTER TABLE profiles ADD COLUMN xp INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add test_cases to problems if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'test_cases') THEN
        ALTER TABLE problems ADD COLUMN test_cases JSONB DEFAULT '[]'::JSONB;
    END IF;
END $$;
