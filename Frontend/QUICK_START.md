# 🚀 Quick Start - Supabase Authentication

## Step 1: Run Database Schema (REQUIRED)
```sql
-- Go to: https://supabase.com/dashboard/project/lzbbowbupqtkicpasuci/sql
-- Copy contents from: supabase/schema.sql
-- Paste and click "Run"
```

## Step 2: Restart Dev Server
```bash
# Press Ctrl+C to stop current server
npm run dev
```

## Step 3: Test It!
1. **Signup**: http://localhost:3000/signup
2. **Login**: http://localhost:3000/login

## ✅ What's Fixed
- ✅ Missing `useEffect` import in login page
- ✅ Environment variables configured
- ✅ Supabase clients set up (browser & server)
- ✅ Authentication middleware active

## 🔑 Your Credentials
- **Project URL**: https://lzbbowbupqtkicpasuci.supabase.co
- **Project ID**: lzbbowbupqtkicpasuci
- **Anon Key**: Configured in `.env.local`

## 📋 Test Checklist
- [ ] Database schema executed in Supabase
- [ ] Dev server restarted
- [ ] Can create new account
- [ ] Can login with credentials
- [ ] Redirects to correct dashboard (student/teacher)

## 🆘 Common Issues

### "Missing Supabase environment variables"
→ Restart dev server (Ctrl+C, then `npm run dev`)

### "Invalid login credentials"
→ Run database schema first, then create account

### "User already registered"
→ Check Supabase Dashboard → Authentication → Users

## 📖 Full Documentation
See `AUTHENTICATION_SETUP.md` for complete details.
