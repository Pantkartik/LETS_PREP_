# Student Classroom Join Feature

## Overview
Students can now join classrooms using a 6-character invite code provided by their teachers.

## What Was Added

### 1. Backend Actions (`lib/actions/student-classes.ts`)
- **`joinClassroom(inviteCode)`** - Join a classroom using an invite code
- **`getMyClassrooms()`** - Get all classrooms the student is enrolled in
- **`leaveClassroom(classroomId)`** - Leave a classroom

### 2. UI Components

#### Join Class Dialog (`components/student/join-class-dialog.tsx`)
- Modal dialog for entering classroom invite codes
- Validates 6-character codes
- Auto-converts to uppercase
- Shows success/loading states
- Can be triggered from multiple places

#### My Classrooms (`components/student/my-classrooms.tsx`)
- Displays all enrolled classrooms
- Shows classroom details (name, teacher, difficulty, invite code)
- Options to view classroom details or leave
- Empty state with call-to-action to join first class

### 3. Dashboard Integration (`components/dashboard-content.tsx`)
- Added "Join Class" button in quick actions (3-column grid)
- Added "My Classrooms" section showing enrolled classes
- Emerald green styling for classroom-related actions

## How Students Use It

### Method 1: Quick Action Button
1. Go to Dashboard
2. Click the green "Join Class" button in the quick actions
3. Enter the 6-character code from teacher
4. Click "Join Class"

### Method 2: From My Classrooms Section
1. Scroll to "My Classrooms" section on dashboard
2. Click "Join Class" button
3. Enter invite code

## Features

✅ **Validation**
- Checks if code is valid
- Prevents duplicate enrollment
- Checks classroom capacity
- Auto-uppercase conversion

✅ **User Feedback**
- Success/error toast notifications
- Loading states during operations
- Confirmation dialogs for leaving

✅ **Activity Logging**
- Logs when students join classrooms
- Tracks enrollment history

## Teacher Side
Teachers can:
- Create classrooms with auto-generated invite codes
- View invite codes in the Classes page
- Share codes with students
- See enrolled students in classroom details

## Database Tables Used
- `classrooms` - Stores classroom information
- `classroom_students` - Junction table for student enrollments
- `activity_logs` - Tracks join/leave activities
