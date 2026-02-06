import React from 'react'
import DashboardSidebar from '@/components/dashboard-sidebar'
import CompetitionsManager from '@/components/teacher/competitions-manager'
import { getTeacherGameRooms } from '@/lib/actions/teacher-competitions'

// Mark as dynamic since we use cookies for auth
export const dynamic = 'force-dynamic'

export default async function TeacherCompetitionsPage() {
  // Fetch data on the server
  const result = await getTeacherGameRooms()
  const gameRooms = result?.rooms || []

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        {/* Pass initial data to client component */}
        <CompetitionsManager initialRooms={gameRooms} />
      </div>
    </div>
  )
}
