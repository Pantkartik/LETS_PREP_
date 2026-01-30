import React from 'react'
import { getTeacherDashboardStats } from '@/lib/actions/teacher-dashboard'
import { getTeacherGameRooms, getTeacherBattles } from '@/lib/actions/teacher-competitions'
import DashboardClient from '@/components/teacher/dashboard-client'

export default async function TeacherDashboardPage() {
    const stats = await getTeacherDashboardStats()
    const recentRooms = await getTeacherGameRooms() // Fetch recent tournaments
    const activeBattles = await getTeacherBattles() // Fetch battles

    return <DashboardClient stats={stats} recentRooms={recentRooms} activeBattles={activeBattles} />
}
