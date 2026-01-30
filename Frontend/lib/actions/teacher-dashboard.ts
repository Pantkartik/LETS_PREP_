'use server'

import { requireTeacher } from './utils'

export async function getTeacherDashboardStats() {
    const { supabase, user } = await requireTeacher()

    // 1. Total Active Rooms
    const { count: activeRooms } = await supabase
        .from('competitions')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id)
        .eq('status', 'ACTIVE')

    // 2. Total Students (That have joined my competitions - complex query, or just all students for now)
    // For now, let's just count all students in platform as "potential students"
    const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'STUDENT')

    // 3. Draft Rooms
    const { count: draftRooms } = await supabase
        .from('competitions')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id)
        .eq('status', 'DRAFT')

    return {
        activeRooms: activeRooms || 0,
        totalStudents: totalStudents || 0,
        draftRooms: draftRooms || 0
    }
}
