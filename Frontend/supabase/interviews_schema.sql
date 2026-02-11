-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'technical', 'behavioral', 'system-design'
  difficulty TEXT NOT NULL, -- 'Easy', 'Medium', 'Hard'
  focus_area TEXT, -- e.g. 'React', 'Frontend System Design'
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed'
  score INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create interview_questions table (optional, if we want to store individual Q&A)
CREATE TABLE IF NOT EXISTS interview_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  user_answer TEXT, -- Audio transcript or code
  ai_feedback TEXT,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;

-- Policies for interviews
CREATE POLICY "Users can view their own interviews"
  ON interviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interviews"
  ON interviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interviews"
  ON interviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for interview_questions
CREATE POLICY "Users can view their own interview questions"
  ON interview_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM interviews
    WHERE interviews.id = interview_questions.interview_id
    AND interviews.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own interview questions"
  ON interview_questions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM interviews
    WHERE interviews.id = interview_questions.interview_id
    AND interviews.user_id = auth.uid()
  ));
  
CREATE POLICY "Users can update their own interview questions"
  ON interview_questions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM interviews
    WHERE interviews.id = interview_questions.interview_id
    AND interviews.user_id = auth.uid()
  ));
