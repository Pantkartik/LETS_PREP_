-- Add column to track name changes
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name_change_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_username TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
