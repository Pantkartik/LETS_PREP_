# Supabase Setup Instructions

## 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/in with GitHub or email
4. Create a new project:
   - Name: `lets-prep-dsa`
   - Database Password: Generate a secure password
   - Region: Choose closest to you

## 2. Get Your Project URL and Keys
1. Go to your project dashboard
2. Click "Settings" → "API"
3. Copy these values:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)

## 3. Update Environment Variables
Replace the placeholder values in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## 4. Run Database Schema
1. Go to your Supabase dashboard
2. Click "SQL Editor"
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run"

## 5. Test Authentication
Your login and signup pages are now configured to use Supabase Auth!

### Test Users
You can create test users through the signup form, or manually in the Supabase dashboard under "Authentication" → "Users".

## Features Implemented
- ✅ User registration with email/password
- ✅ User login with email/password
- ✅ Role-based access (Student/Teacher)
- ✅ Profile management
- ✅ Session management
- ✅ Protected routes (via middleware)

## Next Steps
- Add email verification
- Implement password reset
- Add OAuth providers (Google, GitHub, etc.)
- Create admin dashboard for user management