# 🔴 URGENT FIX: Profile Database Permissions

## ❌ **Problem Identified**

The error "Failed to create profile: {}" is caused by **missing Row Level Security (RLS) policies** in your Supabase database. 

Your `profiles` table has RLS enabled (for security) but **no policies exist** to allow users to read or write their own profiles.

---

## ✅ **SOLUTION: Run This SQL**

### **Step 1: Open Supabase SQL Editor**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### **Step 2: Copy and Run This SQL**

```sql
-- Fix RLS Policies for Profiles Table
-- This allows authenticated users to read and insert their own profile

-- First, enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow users to SELECT their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to INSERT their own profile (for auto-creation)
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
```

### **Step 3: Click "Run" or Press Ctrl+Enter**

You should see: **Success. No rows returned**

---

## 🔍 **Verify It Worked**

### **Option 1: Check Policies in Supabase Dashboard**
1. Go to **Table Editor** → Select `profiles` table
2. Click the **shield icon** (RLS) at the top
3. You should see 3 policies:
   - ✅ "Users can view own profile"
   - ✅ "Users can insert own profile"  
   - ✅ "Users can update own profile"

### **Option 2: Run Verification SQL**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
```

Expected output:
```
policyname                      | cmd
--------------------------------|--------
Users can view own profile      | SELECT
Users can insert own profile    | INSERT
Users can update own profile    | UPDATE
```

---

## 🚀 **After Running the SQL**

1. **Refresh your browser** (Ctrl+R or Cmd+R)
2. The profile should now load successfully!
3. Check the console - you should see:
   - ✅ "Fetching profile for user: [id]"
   - ✅ "Profile not found, creating default profile..."
   - ✅ "Profile fetched successfully"

---

## 📋 **What These Policies Do**

### **SELECT Policy** (Read)
- Allows users to **view their own** profile
- `USING (auth.uid() = id)` means: "only if the user's ID matches the profile ID"

### **INSERT Policy** (Create)
- Allows users to **create their own** profile
- `WITH CHECK (auth.uid() = id)` means: "only if they're creating a profile with their own ID"

### **UPDATE Policy** (Modify)
- Allows users to **update their own** profile
- Both `USING` and `WITH CHECK` ensure they can only modify their own data

---

## 🔒 **Security Note**

These policies are **secure** because:
- ✅ Users can ONLY access their own profile (not others')
- ✅ Users cannot create profiles for other users
- ✅ Users cannot modify other users' profiles
- ✅ Unauthenticated users have NO access

---

## 🆘 **Alternative: Disable RLS (NOT RECOMMENDED)**

⚠️ **Only use this for local development/testing!**

If you want to temporarily disable RLS to test:

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

**WARNING**: This makes ALL profiles readable/writable by ANYONE. Only use for local testing!

To re-enable:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## 📞 **Still Not Working?**

If you still see errors after running the SQL:

1. **Check if you're logged in**:
   - Open browser console
   - Look for "No active session" message
   - If you see this, log out and log back in

2. **Clear browser cache**:
   - Press Ctrl+Shift+Delete (or Cmd+Shift+Delete)
   - Clear cached data
   - Refresh the page

3. **Check Supabase connection**:
   - Verify `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL`
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct

4. **Check user exists in auth.users**:
   ```sql
   SELECT id, email FROM auth.users;
   ```
   Your user should be listed there

---

## 📝 **Quick Reference**

**File created**: `Frontend/supabase/fix_profile_rls.sql`

You can also run this file directly:
1. Open the file
2. Copy all contents
3. Paste into Supabase SQL Editor
4. Run

---

## ✨ **After Fix**

Once the policies are in place:
- ✅ Profile will auto-create on first login
- ✅ Profile card will display correctly
- ✅ Stats will show (XP, Level, Rank, Wins)
- ✅ No more permission errors!

**Run the SQL now and refresh your browser!** 🚀
