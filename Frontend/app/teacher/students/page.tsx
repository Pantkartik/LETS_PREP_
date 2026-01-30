import React from 'react'
import DashboardSidebar from '@/components/dashboard-sidebar'
import StudentsManager from '@/components/teacher/students-manager'
import { getAllStudents } from '@/lib/actions/teacher-students'

export default async function TeacherStudentsPage() {
  const students = await getAllStudents()

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <nav className="border-b border-border/30 py-4 top-0 bg-background/50 backdrop-blur z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-bold">Teacher Portal</h1>
          </div>
        </nav>
        <StudentsManager initialStudents={students} />
      </div>
    </div>
  )
}
