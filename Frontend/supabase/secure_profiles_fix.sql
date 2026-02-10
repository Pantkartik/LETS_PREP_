-- SECURITY FIX: Secure Profiles Table
-- Disallow public/authenticated users from inserting into profiles table
-- to prevent role privilege escalation. Profile creation should be handled
-- exclusively by the 'handle_new_user' database trigger.

BEGIN;

-- 1. Drop the insecure INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 2. Ensure UPDATE policy doesn't allow changing role
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  (
    -- Prevent changing the role column
    -- We compare the new role with the existing role (which matches because user can't change it in this check?)
    -- Actually, Supabase RLS 'WITH CHECK' compares the NEW row state.
    -- To strictly prevent role change, we need a trigger or complex policy.
    -- Simplest approach: Trust the application logic for updates OR
    -- Use a trigger to revert role changes.
    true
  )
);

-- 3. Create a trigger to prevent role updates by users
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If the role is being changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow if it's a superuser/service_role (handled by bypassing RLS usually, but trigger runs for all)
    -- We can check the current user role in the session
    IF auth.jwt() ->> 'role' != 'service_role' THEN
      RAISE EXCEPTION 'You cannot change your own role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_role_change ON profiles;
CREATE TRIGGER check_role_change
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_role_change();

COMMIT;
