-- Fix the specific user reported
UPDATE profiles
SET role = 'TEACHER'
WHERE username = 'teacher' OR email LIKE '%teacher%' OR full_name LIKE '%teacher%';

-- Also ensure the profiles table has the correct check constraint if it wasn't valid before (optional)
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
-- ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN'));
