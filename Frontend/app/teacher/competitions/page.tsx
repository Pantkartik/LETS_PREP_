import React from 'react'
import DashboardSidebar from '@/components/dashboard-sidebar'
import CompetitionsManager from '@/components/teacher/competitions-manager'
import { getTeacherGameRooms } from '@/lib/actions/teacher-competitions'

export default async function TeacherCompetitionsPage() {
  // Fetch data on the server
  const gameRooms = await getTeacherGameRooms()

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
