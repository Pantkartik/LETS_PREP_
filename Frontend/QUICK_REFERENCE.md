# 🚀 Quick Reference Guide - Real-Time Classroom System

## 📍 Navigation

### For Students:
```
Sidebar → "My Classrooms" → Dedicated classrooms page
```

### Key URLs:
- `/my-classrooms` - All your classrooms
- `/classes/{id}` - Individual classroom view
- `/competitions/{id}` - Active competition

## 🎯 Quick Actions

### Join a Classroom:
1. Get invite code from teacher (e.g., "ABC123")
2. Click "My Classrooms" in sidebar
3. Click "Join Class" button
4. Enter code → Done!

### Enter a Competition:
1. Go to "My Classrooms"
2. Click "Enter Classroom" on any class
3. When teacher starts competition:
   - Banner appears automatically
   - Click "Enter Competition"
   - Start solving!

## 🔄 Real-Time Features

### What Updates Automatically:

| Event | Where You See It | Update Speed |
|-------|-----------------|--------------|
| Competition starts | Classroom page | Instant |
| Timer countdown | Competition banner | Every second |
| Student joins | Leaderboard | Instant |
| Code submitted | Leaderboard | Instant |
| Rankings change | Leaderboard | Instant |

## 🎨 UI Components

### My Classrooms Page:
- **Search bar** - Filter by name or teacher
- **Stats cards** - Total classes, active competitions, teachers
- **Classroom cards** - Grid layout with hover effects
- **Join button** - Top right corner
- **Empty state** - Helpful when no classes

### Classroom View:
- **Active banner** - Shows live competitions
- **Live timer** - Countdown in real-time
- **Three tabs**:
  - Problems - List of challenges
  - Leaderboard - Live rankings
  - History - Past competitions

## 🔐 Security

- ✅ Only enrolled students can view classroom
- ✅ Invite codes are validated
- ✅ Auto-registration for active competitions
- ✅ Real-time updates are secure

## 📱 Responsive Design

- **Desktop** - 3 column grid
- **Tablet** - 2 column grid
- **Mobile** - 1 column stack

## 🎯 Teacher Quick Actions

### Create Classroom:
1. Go to `/classes`
2. Click "New Class"
3. Fill details
4. Get invite code
5. Share with students

### Launch Competition:
1. Go to classroom page
2. Click "Launch Class Battle"
3. Select problems
4. Click "Start"
5. Students see it instantly!

## 💡 Tips

### For Students:
- Bookmark `/my-classrooms` for quick access
- Use search to find specific classrooms
- Check regularly for new competitions
- Join early for better leaderboard position

### For Teachers:
- Share invite codes via multiple channels
- Monitor real-time leaderboard during competition
- Use classroom page to track student progress
- Launch competitions when most students are online

## 🐛 Troubleshooting

### Competition not appearing?
- Refresh the classroom page
- Check if you're enrolled in the classroom
- Verify competition is marked as "ACTIVE"

### Leaderboard not updating?
- Check internet connection
- Ensure WebSocket connection is active
- Try refreshing the page

### Can't join classroom?
- Verify invite code is correct (case-sensitive)
- Check if classroom is at capacity
- Ensure you're not already enrolled

## 📊 Statistics

### My Classrooms Page Shows:
- **Total Classes** - Number of enrolled classrooms
- **Active Now** - Currently running competitions
- **Teachers** - Unique teachers you're learning from

## 🎨 Visual Indicators

- 🟢 **Green badge** - Active competition
- 🔴 **Red badge** - Completed competition
- 🟡 **Yellow badge** - Draft competition
- ⏱️ **Timer** - Time remaining
- ✅ **Checkmark** - Problem solved
- 🏆 **Trophy** - Competition/achievement

## 🔗 Quick Links

### Student Pages:
- Dashboard: `/dashboard`
- My Classrooms: `/my-classrooms`
- Profile: `/profile`
- Analytics: `/analytics`

### Teacher Pages:
- Dashboard: `/teacher-dashboard`
- Classes: `/classes`
- Competitions: `/teacher-competitions`

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase connection
3. Ensure you're logged in
4. Check your role (STUDENT/TEACHER)

---

## 🎉 You're All Set!

The real-time classroom system is ready to use. Start by:
1. Clicking "My Classrooms" in the sidebar
2. Joining your first classroom
3. Waiting for competitions to start
4. Competing and climbing the leaderboard!

**Happy Learning! 🚀**
