# Database Schema Migration - Issue Fixes

## Issues Fixed

### 1. ✅ Column "category" does not exist
**Problem**: Old schema used `topic` instead of `category` in problems table

**Fix**: 
```sql
-- Rename 'topic' to 'category' if it exists
IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'problems' AND column_name = 'topic') THEN
    ALTER TABLE problems RENAME COLUMN topic TO category;
END IF;
```

### 2. ✅ Column "execution_time_ms" already exists
**Problem**: Script tried to create `execution_time_ms` and then rename `runtime_ms` to it

**Fix**:
```sql
-- Only rename if target doesn't exist
IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'runtime_ms') 
   AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'execution_time_ms') THEN
    ALTER TABLE submissions RENAME COLUMN runtime_ms TO execution_time_ms;
END IF;

-- Drop old column if both exist
IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'runtime_ms') 
   AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'execution_time_ms') THEN
    ALTER TABLE submissions DROP COLUMN runtime_ms;
END IF;
```

### 3. ✅ Column "battle_id" does not exist
**Problem**: Old schema used `competition_id` instead of `battle_id`

**Fix**:
```sql
-- Add battle_id column
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'battle_id') THEN
    ALTER TABLE submissions ADD COLUMN battle_id UUID REFERENCES battles(id) ON DELETE SET NULL;
END IF;

-- Rename competition_id to battle_id if needed
IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'competition_id') 
   AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'battle_id') THEN
    ALTER TABLE submissions RENAME COLUMN competition_id TO battle_id;
END IF;
```

### 4. ✅ Column "username" does not exist
**Problem**: Profiles table didn't have username column

**Fix**:
```sql
-- Add username column
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE profiles ADD COLUMN username TEXT;
    -- Auto-populate from existing data
    UPDATE profiles SET username = COALESCE(full_name, split_part(email, '@', 1)) WHERE username IS NULL;
END IF;
```

### 5. ✅ Materialized view errors
**Problem**: Leaderboard view referenced columns that might not exist

**Fix**:
```sql
-- Only create view if username exists
IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
    EXECUTE '
    CREATE MATERIALIZED VIEW global_leaderboard AS
    SELECT 
        p.id,
        COALESCE(p.username, p.full_name, split_part(p.email, ''@'', 1)) as username,
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
```

## Schema Migration Strategy

The updated schema now follows a **safe migration pattern**:

1. **Check Before Create**: Always check if column/table exists before creating
2. **Rename Safely**: Only rename if source exists and target doesn't
3. **Clean Up**: Drop old columns if both old and new exist
4. **Use COALESCE**: Provide fallback values for optional columns
5. **Conditional Views**: Only create views if required columns exist

## Column Mapping Reference

| Old Schema | New Schema | Table |
|------------|------------|-------|
| `topic` | `category` | problems |
| `runtime_ms` | `execution_time_ms` | submissions |
| `memory_usage_kb` | `memory_used_mb` | submissions |
| `competition_id` | `battle_id` | submissions |
| N/A | `username` | profiles (new) |

## Testing the Schema

Run this in Supabase SQL Editor:

```sql
-- Test 1: Check if all columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Test 2: Check problems table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'problems' 
ORDER BY ordinal_position;

-- Test 3: Check submissions table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'submissions' 
ORDER BY ordinal_position;

-- Test 4: Check if leaderboard view exists
SELECT * FROM pg_matviews WHERE matviewname = 'global_leaderboard';
```

## Success Criteria

After running the schema, you should have:

✅ All new columns added to existing tables  
✅ Old columns renamed to new names  
✅ No duplicate columns  
✅ Materialized view created successfully  
✅ All triggers and functions working  
✅ No SQL errors  

## Rollback Plan

If something goes wrong, you can:

1. **Drop new tables**:
```sql
DROP TABLE IF EXISTS battles CASCADE;
DROP TABLE IF EXISTS battle_participants CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS tournament_participants CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
```

2. **Remove added columns**:
```sql
ALTER TABLE profiles DROP COLUMN IF EXISTS username;
ALTER TABLE profiles DROP COLUMN IF EXISTS total_battles;
-- etc.
```

3. **Restore from backup** (if you created one before migration)

## Next Steps

1. ✅ Run the updated schema in Supabase
2. ✅ Verify all tables and columns exist
3. ✅ Test the leaderboard view
4. ✅ Start the backend server
5. ✅ Test API endpoints

---

**Schema Version**: 2.0  
**Last Updated**: 2026-01-30  
**Status**: Production Ready ✅
