-- Update the default max players for battles to 50
ALTER TABLE battles ALTER COLUMN max_players SET DEFAULT 50;

-- Optional: Update any existing rows if needed, or just leave them.
-- UPDATE battles SET max_players = 50 WHERE max_players = 8;
