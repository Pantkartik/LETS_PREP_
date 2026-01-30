# 🛠️ Backend Setup Guide

You have successfully defined the backend logic and database structure for the LET'S PREP. Follow these steps to apply it.

## 1. Apply the Database Schema

1.  Open **`supabase/backend_schema.sql`** in your editor.
2.  Copy all the contents.
3.  Go to your **Supabase Dashboard** -> **SQL Editor**.
4.  Paste the SQL and click **Run**.

**What this does:**
- Updates your `profiles` table with XP and Levels.
- Creates tables for `problems`, `competitions`, `submissions`, etc.
- Adds fake "Seed Data" (3 algorithms questions) so your app isn't empty.

## 2. Using the Backend in Frontend

Now you can import these actions directly in your Client Components or Server Pages!

### Example: Creating a Competition Button (Teacher)
```typescript
'use client'
import { createCompetition } from '@/lib/actions/competitions'

export function CreateRoomForm() {
    return (
        <form action={createCompetition}>
            <input name="title" placeholder="Room Name" />
            <input name="difficulty" type="hidden" value="MEDIUM" />
            <button type="submit">Create Room</button>
        </form>
    )
}
```

### Example: Joining a Competition (Student)
```typescript
'use client'
import { joinCompetition } from '@/lib/actions/competitions'
import { useState } from 'react'

export function JoinInput() {
    const [code, setCode] = useState('')
    
    async function handleJoin() {
        const res = await joinCompetition(code)
        if (res.error) alert(res.error)
        else window.location.href = `/competitions/${res.competitionId}`
    }

    return (
        <div>
            <input value={code} onChange={e => setCode(e.target.value)} />
            <button onClick={handleJoin}>Join</button>
        </div>
    )
}
```

## 3. Next Steps
- **Connect `problems.ts` to a real execution API**: Currently, it simulates a successful run. You can use APIs like [Piston](https://github.com/engineer-man/piston) for real code execution.
- **Build the UI**: Use the `getProblems` and `getCompetitions` actions to fetch data in your `app/competitions/page.tsx` and `app/battles/page.tsx`.
