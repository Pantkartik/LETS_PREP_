# Real-Time Classroom Competition System

## 🎯 Overview
A complete real-time competition system where teachers can launch competitions for their classrooms, and students see updates instantly without refreshing.

## 📋 Complete Flow

### For Teachers:

1. **Create a Classroom**
   - Go to `/classes`
   - Click "New Class"
   - Enter classroom details (name, difficulty, max students)
   - System generates a 6-character invite code (e.g., "ABC123")

2. **Launch a Competition**
   - Go to the classroom page `/classes/{classroomId}`
   - Click "Launch Class Battle"
   - Configure:
     - Competition title
     - Difficulty level
     - Duration (minutes)
     - Select 4 problems
   - Click "Start Competition"

3. **Real-Time Updates**
   - See students joining live
   - Watch leaderboard update as students solve problems
   - Monitor submissions in real-time
   - View live rankings

### For Students:

1. **Join a Classroom**
   - Go to Dashboard
   - Click "Join Class" button
   - Enter the 6-character code from teacher
   - Automatically enrolled

2. **View Classroom**
   - After joining, classroom appears in "My Classrooms"
   - Click to view classroom details at `/classes/{classroomId}`

3. **When Teacher Starts Competition**
   - **INSTANT NOTIFICATION**: Active competition banner appears
   - See live countdown timer
   - View all competition problems
   - Click "Enter Competition" or "Solve Problem"

4. **During Competition**
   - Solve problems in real-time
   - Submit code
   - See results immediately
   - Watch your rank update live on leaderboard
   - See other students' progress

5. **Real-Time Features**
   - ✅ Live countdown timer
   - ✅ Real-time leaderboard updates
   - ✅ Instant problem status (solved/unsolved)
   - ✅ Live participant count
   - ✅ Auto-refresh when competition starts/ends

## 🔄 Real-Time Technology

### Supabase Realtime Subscriptions

The system uses Supabase's real-time capabilities to push updates:

```typescript
// Students subscribe to competition changes
supabase
  .channel(`classroom-${classroomId}-competitions`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'competitions',
    filter: `classroom_id=eq.${classroomId}`
  }, (payload) => {
    // Competition started/ended - reload data
    loadClassroomData()
  })
  .subscribe()

// Subscribe to leaderboard updates
supabase
  .channel(`classroom-${classroomId}-participants`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'competition_participants'
  }, (payload) => {
    // Someone solved a problem - update leaderboard
    loadCompetitionDetails()
  })
  .subscribe()
```

### What Triggers Real-Time Updates:

1. **Teacher starts competition** → Students see active competition banner
2. **Student joins competition** → All participants see updated count
3. **Student submits code** → Leaderboard updates for everyone
4. **Problem solved** → Student's solved count updates
5. **Rankings change** → Leaderboard reorders in real-time

## 📊 Database Tables

### `classrooms`
- Stores classroom information
- Has `invite_code` for students to join

### `competitions`
- Linked to `classroom_id`
- Has `is_active` and `status` fields
- Contains `selected_problems` array
- Tracks `started_at` and `duration_minutes`

### `competition_participants`
- Junction table for competition enrollment
- Tracks `problems_solved`, `score`, `rank_position`
- Updates in real-time as students submit

### `competition_submissions`
- Stores each code submission
- Status: PENDING → RUNNING → ACCEPTED/WRONG_ANSWER
- Triggers leaderboard recalculation

## 🎨 UI Components

### Student Components

1. **`join-class-dialog.tsx`**
   - Modal for entering invite code
   - Validates and enrolls student

2. **`my-classrooms.tsx`**
   - Shows all enrolled classrooms
   - Quick access to classroom pages

3. **`classroom-view.tsx`**
   - Main student classroom page
   - Shows active competition with live timer
   - Displays problems and leaderboard
   - Real-time subscriptions

### Teacher Components

1. **`create-class-dialog.tsx`**
   - Create new classroom

2. **`launch-class-competition-dialog.tsx`**
   - Launch competition for classroom
   - Auto-registers all students

3. **`classroom-details.tsx`**
   - Teacher view of classroom
   - Student management
   - Competition controls

## 🚀 Key Features

### For Students:
- ✅ Join classrooms with invite codes
- ✅ See active competitions instantly
- ✅ Live countdown timer
- ✅ Real-time leaderboard
- ✅ Problem status tracking
- ✅ Instant submission feedback
- ✅ No page refresh needed

### For Teachers:
- ✅ Create classrooms with auto-generated codes
- ✅ Launch competitions with problem selection
- ✅ See students join in real-time
- ✅ Monitor live leaderboard
- ✅ Track submissions as they happen
- ✅ Auto-register classroom students

## 🔐 Security

- Row Level Security (RLS) on all tables
- Students can only view their own submissions
- Teachers can view all submissions in their classrooms
- Invite codes are unique and validated
- Competition time limits enforced

## 📱 Pages

### Student Pages:
- `/dashboard` - Join class button
- `/classes/{id}` - Classroom view with real-time updates
- `/competitions/{id}` - Active competition page
- `/competitions/{id}/problem/{problemId}` - Solve problem

### Teacher Pages:
- `/classes` - All classrooms
- `/classes/{id}` - Classroom management
- `/teacher-dashboard` - Overview
- `/teacher-dashboard/battles/{id}` - Competition management

## 🎯 User Experience Flow

1. **Student gets code from teacher** (e.g., "ABC123")
2. **Student clicks "Join Class"** on dashboard
3. **Enters code** → Enrolled instantly
4. **Clicks classroom** → Sees "waiting for competition" state
5. **Teacher starts competition** → Student's page updates automatically
6. **Banner appears** with live timer and "Enter Competition" button
7. **Student clicks** → Sees all problems
8. **Solves problems** → Leaderboard updates for everyone
9. **Competition ends** → Results saved, can view history

## 🔧 Technical Implementation

### Real-Time Updates:
- Supabase Realtime channels
- PostgreSQL LISTEN/NOTIFY
- WebSocket connections
- Automatic reconnection

### Performance:
- Efficient queries with indexes
- Optimistic UI updates
- Debounced refresh calls
- Cached leaderboard data

### Scalability:
- Supports multiple concurrent competitions
- Handles hundreds of students per classroom
- Real-time updates scale with Supabase infrastructure

## 📝 Next Steps

To use this system:

1. **Teacher**: Create a classroom
2. **Teacher**: Share invite code with students
3. **Students**: Join using the code
4. **Teacher**: Launch competition when ready
5. **Students**: See competition appear automatically
6. **Everyone**: Watch real-time updates as competition progresses!

## 🎉 Benefits

- **No manual refresh needed** - Everything updates automatically
- **Instant feedback** - Students see results immediately
- **Engaging experience** - Live leaderboard creates excitement
- **Teacher control** - Easy to manage and monitor
- **Scalable** - Works for small classes or large cohorts
