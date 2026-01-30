# ⚙️ Settings Page Setup Guide

## 🚀 You're almost there! 

I've built the complete Settings page logic including:
- ✅ **30-Day Name Change Limit**
- ✅ **Profile Updates** (Bio, Username)
- ✅ **Social Links** (GitHub, Twitter, LinkedIn)
- ✅ **Frontend UI** with tabs and save states

## 🛑 Action Required: Update Database

To make these new features work, you need to add the new columns to your database.

### **Step 1: Open Supabase SQL Editor**
1. Go to: https://supabase.com/dashboard/
2. Click **SQL Editor**
3. Click **New Query**

### **Step 2: Run This SQL**

Copy and paste the entire content of `Frontend/supabase/add_settings_columns.sql`:

```sql
-- Add column to track name changes
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name_change_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_username TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
```

### **Step 3: Test It!**
1. Go to `http://localhost:3000/settings`
2. Try changing your bio
3. Try changing your name (This will start your 30-day timer!)

---

## 🔒 Name Change Logic Explained

- **First Change**: You can change your name immediately if you haven't recently.
- **Subsequent Changes**: The system records the date in `last_name_change_at`.
- **Validation**: If you try to change it again within 30 days, it will show an error: *"You can change your name again in X days."*

Enjoy your new dynamic Profile Settings! 🛠️
