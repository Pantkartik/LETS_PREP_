import React from 'react'
import { getTeacherDashboardStats } from '@/lib/actions/teacher-dashboard'
import { getTeacherGameRooms, getTeacherBattles } from '@/lib/actions/teacher-competitions'
import DashboardClient from '@/components/teacher/dashboard-client'

export default async function TeacherDashboardPage() {
    const stats = await getTeacherDashboardStats()
    const recentRoomsResult = await getTeacherGameRooms() // Fetch recent tournaments
    const activeBattlesResult = await getTeacherBattles() // Fetch battles

    return <DashboardClient
        stats={stats}
        recentRooms={recentRoomsResult.rooms || []}
        activeBattles={activeBattlesResult.battles || []}
    />
}
