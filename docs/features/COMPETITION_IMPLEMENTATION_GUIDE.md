# 🏆 Classroom-Based Competition System - Implementation Guide

## Overview
This system transforms your platform from individual battles to a comprehensive classroom-based competition platform where teachers can:
- Create competitions directly from their classrooms
- Select 4 problems from your scraped problem database
- Support 100+ students per competition
- Track rankings with a penalty system (10 min per wrong submission)
- Execute code in multiple languages (C++, Java, Python, JavaScript)

---

## 📋 Database Setup

### Step 1: Run SQL Migrations

Execute these SQL files in order in your Supabase SQL Editor:

1. **`supabase/classrooms.sql`** - Sets up classroom structure and roles
2. **`supabase/competitions_schema.sql`** - Creates competition tables, ranking system, and penalty logic

```sql
-- After running the migrations, set yourself as a teacher:
UPDATE profiles SET role = 'TEACHER' WHERE email = 'your-email@example.com';
```

### Key Tables Created:
- `competitions` - Enhanced with classroom linking, problem selection, penalties
- `competition_participants` - Tracks student performance, penalties, rankings
- `competition_submissions` - Multi-language code submissions with anti-cheating
- `competition_leaderboard` (VIEW) - Real-time ranking calculation

---

## 🔧 Backend Setup

### Step 2: Install Dependencies

```bash
cd Backend
npm install express @supabase/supabase-js dockerode uuid
npm install --save-dev @types/dockerode @types/express @types/uuid
```

### Step 3: Environment Variables

Add to `Backend/.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
```

### Step 4: Docker Setup

The code execution engine requires Docker. Install Docker Desktop and ensure it's running.

**Pull required Docker images:**

```bash
docker pull python:3.11-slim
docker pull node:18-slim
docker pull gcc:latest
docker pull openjdk:17-slim
```

### Step 5: Start Code Execution Engine

```bash
cd Backend
npx ts-node src/code-executor.ts
```

This starts the execution engine on port 3001.

---

## 🎨 Frontend Setup

### Step 6: Update Dashboard

The teacher dashboard has been updated to remove standalone battle creation. Now all competitions are classroom-based.

**Key Changes:**
- Removed: Game room creation from dashboard
- Added: `CreateCompetitionDialog` component in classroom view
- Updated: `classroom-details.tsx` to use new competition system

### Step 7: Test the Flow

1. **Login as Teacher**
2. **Navigate to Classes** (`/classes`)
3. **Click on a Classroom** to view details
4. **Click "Create Competition"** button
5. **Select 4 Problems** from the scraped database
6. **Configure Duration** (default: 120 minutes)
7. **Create & Start** the competition

---

## 🚀 Features Implemented

### ✅ Multi-Language Support
- **C++** (g++ with C++17)
- **Java** (OpenJDK 17)
- **Python** (3.11)
- **JavaScript** (Node.js 18)

### ✅ Penalty System
- **10 minutes** penalty per wrong submission
- Affects final ranking calculation
- Formula: `effective_time = actual_time + (penalty_time * 60)`

### ✅ Ranking Algorithm
Participants are ranked by:
1. **Problems Solved** (descending)
2. **Effective Time** (ascending - includes penalties)
3. **Last Submission Time** (ascending - tiebreaker)

### ✅ Security Features
- **Docker Sandboxing** - Each code execution runs in isolated container
- **No Network Access** - Containers run with `NetworkMode: 'none'`
- **Resource Limits** - Memory and CPU limits enforced
- **Time Limits** - Execution timeout prevents infinite loops
- **IP Tracking** - Submission IP logged for anti-cheating
- **Similarity Detection** - Placeholder for plagiarism checking

### ✅ Real-Time Updates
- **Leaderboard** - Updates automatically via Supabase Realtime
- **Submission Status** - Live feedback on code execution
- **Student Joins** - Real-time classroom roster updates

---

## 📊 How It Works

### Competition Flow:

```
1. Teacher Creates Competition
   ↓
2. Selects 4 Problems
   ↓
3. All Classroom Students Auto-Registered
   ↓
4. Teacher Starts Competition
   ↓
5. Students Submit Code
   ↓
6. Code Execution Engine Processes
   ↓
7. Rankings Updated in Real-Time
   ↓
8. Teacher Ends Competition
   ↓
9. Final Rankings & Top 3 Displayed
```

### Code Execution Flow:

```
Student Submits Code
   ↓
Saved to competition_submissions (status: PENDING)
   ↓
Backend picks up submission
   ↓
Creates Docker container with language image
   ↓
Compiles code (if C++/Java)
   ↓
Runs against test cases
   ↓
Measures: execution time, memory, correctness
   ↓
Updates submission status (ACCEPTED/WRONG_ANSWER/etc)
   ↓
Calls process_submission() function
   ↓
Updates participant stats & penalties
   ↓
Recalculates rankings
   ↓
Real-time update to leaderboard
```

---

## 🎯 API Endpoints

### Teacher Actions
- `createCompetition(data)` - Create new competition
- `startCompetition(id)` - Activate competition
- `endCompetition(id)` - End competition
- `getCompetitionDetails(id)` - Get full details + leaderboard
- `getAvailableProblems()` - Get all problems for selection

### Student Actions
- `submitCode(data)` - Submit code for problem
- `getMySubmissions(competitionId, problemId?)` - View own submissions
- `getCompetitionProblems(competitionId)` - Get competition problems
- `getLiveLeaderboard(competitionId)` - View current rankings
- `getMyCompetitionStats(competitionId)` - View own stats

### Code Execution
- `POST /execute` - Process code submission
- `GET /health` - Health check

---

## 🔍 Testing Checklist

### Database
- [ ] Profiles table has `role` column
- [ ] Classrooms table exists
- [ ] Competitions table has `classroom_id` column
- [ ] competition_participants table exists
- [ ] competition_submissions table exists
- [ ] competition_leaderboard view works

### Backend
- [ ] Docker is running
- [ ] All language images pulled
- [ ] Code executor starts without errors
- [ ] Can execute Python code
- [ ] Can execute JavaScript code
- [ ] Can compile and execute C++ code
- [ ] Can compile and execute Java code

### Frontend
- [ ] Teacher can create classroom
- [ ] Teacher can view classroom details
- [ ] Create Competition dialog opens
- [ ] Problems load correctly
- [ ] Can select exactly 4 problems
- [ ] Competition creates successfully
- [ ] Students auto-registered

### Competition
- [ ] Competition starts successfully
- [ ] Students can view problems
- [ ] Students can submit code
- [ ] Code executes and returns result
- [ ] Wrong submissions add 10 min penalty
- [ ] Leaderboard updates in real-time
- [ ] Rankings calculated correctly
- [ ] Top 3 ranks displayed

---

## 🐛 Troubleshooting

### "Competition not found" error
- Ensure competition was created with `classroom_id`
- Check if user is registered as participant

### Code execution fails
- Verify Docker is running: `docker ps`
- Check if images are pulled: `docker images`
- View executor logs for errors

### Leaderboard not updating
- Enable Realtime in Supabase Dashboard
- Add tables to `supabase_realtime` publication:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE competition_participants;
  ALTER PUBLICATION supabase_realtime ADD TABLE competition_submissions;
  ```

### "Unauthorized: Teachers only"
- Verify your profile has `role = 'TEACHER'`
- Check Supabase auth is working

---

## 🚀 Next Steps

### Recommended Enhancements:
1. **Student UI** - Create competition participation page
2. **Code Editor** - Integrate Monaco Editor with syntax highlighting
3. **Test Case Preview** - Show sample test cases to students
4. **Plagiarism Detection** - Implement similarity checking algorithm
5. **Analytics Dashboard** - Show teacher insights on student performance
6. **Export Results** - Download competition results as CSV/PDF
7. **Notifications** - Alert students when competition starts/ends
8. **Practice Mode** - Allow students to practice problems outside competitions

---

## 📝 Notes

- **Penalty System**: Currently fixed at 10 minutes per wrong submission
- **Max Participants**: Configurable up to 500 students
- **Problem Count**: Fixed at 4 problems per competition
- **Rank Display**: Shows top 3 by default (configurable in DB)
- **Time Limits**: Default 2000ms per test case (configurable per problem)
- **Memory Limits**: Default 256MB (configurable per problem)

---

## 🎓 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase logs in dashboard
3. Check backend executor logs
4. Verify all migrations ran successfully

**Happy Competing! 🏆**
