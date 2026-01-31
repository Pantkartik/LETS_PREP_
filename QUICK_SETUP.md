# 🚀 Quick Setup Guide - Competition System

## ✅ What's Already Done

1. **Backend Dependencies** - Installed ✅
   - express
   - @supabase/supabase-js
   - uuid
   - @types packages

2. **Code Files** - Created ✅
   - Competition database schema
   - Teacher competition actions
   - Student competition actions
   - Code execution engine (local)
   - Competition creation UI component
   - Updated classroom details component

3. **Servers** - Running ✅
   - Backend: Port 3001
   - Frontend: Running

---

## 📋 What You Need to Do

### Step 1: Run SQL Migrations (5 minutes)

1. Open **Supabase Dashboard**: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Copy and run these files **in order**:

#### File 1: `Frontend/supabase/classrooms.sql`
```sql
-- This sets up classrooms and adds the role column
-- Copy entire file and run
```

#### File 2: `Frontend/supabase/competitions_schema.sql`
```sql
-- This creates competition tables and ranking system
-- Copy entire file and run
```

### Step 2: Set Yourself as Teacher

In Supabase SQL Editor, run:

```sql
-- Replace with YOUR email
UPDATE profiles SET role = 'TEACHER' WHERE email = 'your-email@example.com';
```

### Step 3: Test the System

1. **Login** to your app as teacher
2. **Navigate** to `/classes`
3. **Click** on any classroom
4. **Click** "Create Competition" button
5. **Select** exactly 4 problems
6. **Create** and start the competition!

---

## 🎯 Features Now Available

### For Teachers:
- ✅ Create competitions from classroom view
- ✅ Select 4 problems from database
- ✅ Auto-register all classroom students
- ✅ Start/end competitions
- ✅ View live leaderboard
- ✅ Track student submissions

### For Students:
- ✅ View competition problems
- ✅ Submit code in Python, JavaScript, C++, Java
- ✅ See real-time rankings
- ✅ Track own performance

### System Features:
- ✅ 10-minute penalty per wrong submission
- ✅ Real-time leaderboard updates
- ✅ Top 3 ranks highlighted
- ✅ Support for 100+ participants
- ✅ Multi-language code execution

---

## 🔧 Code Execution

**Current Setup:** Local execution (no Docker)
- Requires: Python, Node.js, g++, Java installed on system
- Endpoint: `/api/v1/executor/execute`

**For Production:** Install Docker Desktop for better security
- Download: https://www.docker.com/products/docker-desktop

---

## 📊 How It Works

```
Teacher Creates Competition
    ↓
Selects 4 Problems
    ↓
All Students Auto-Registered
    ↓
Competition Starts
    ↓
Students Submit Code
    ↓
Code Executed & Graded
    ↓
Rankings Updated (Real-time)
    ↓
Top 3 Displayed
```

---

## 🐛 Troubleshooting

### "Competition not found"
- Ensure SQL migrations ran successfully
- Check competition was created with classroom_id

### "Unauthorized: Teachers only"
- Verify you ran the UPDATE profiles SET role = 'TEACHER' command
- Check your email matches exactly

### Code execution fails
- For Python: Ensure `python` command works in terminal
- For JavaScript: Ensure `node` command works
- For C++: Ensure `g++` is installed
- For Java: Ensure `javac` and `java` are installed

### Leaderboard not updating
- Enable Realtime in Supabase Dashboard
- Go to Database → Replication
- Add tables to `supabase_realtime` publication

---

## 📁 File Locations

- **SQL Migrations**: `Frontend/supabase/`
- **Backend Actions**: `Frontend/lib/actions/`
- **UI Components**: `Frontend/components/teacher/`
- **Execution Engine**: `Backend/src/routes/executor.routes.ts`
- **Full Guide**: `COMPETITION_IMPLEMENTATION_GUIDE.md`

---

## 🎓 Next Steps

After setup:
1. Create a test classroom
2. Add some test students
3. Create a competition
4. Test code submission
5. View leaderboard updates

---

## 💡 Tips

- **Problem Selection**: Choose varied difficulty levels
- **Duration**: 120 minutes is good for 4 problems
- **Testing**: Test with sample problems first
- **Monitoring**: Watch leaderboard during competition

---

## 🆘 Need Help?

1. Check `COMPETITION_IMPLEMENTATION_GUIDE.md` for detailed docs
2. Review Supabase logs in dashboard
3. Check backend console for errors
4. Verify all SQL migrations completed

---

**Ready to start! Just run those SQL migrations and you're good to go! 🚀**
