'use server'

import { requireTeacher } from './utils'

export async function getAllStudents(searchQuery: string = '') {
    const { supabase } = await requireTeacher()

    let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'STUDENT')
        .order('created_at', { ascending: false })

    if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`)
    }

    const { data: students, error } = await query

    if (error) return []
    return students
}

export async function getStudentStats(studentId: string) {
    const { supabase } = await requireTeacher()

    // 1. Get Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single()

    if (!profile) return null

    // 2. Get Problems Solved
    const { count: problemsSolved } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', studentId)
        .eq('status', 'ACCEPTED')

    // 3. Get Competitions Joined
    const { count: competitionsJoined } = await supabase
        .from('competition_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', studentId)

    // 4. Get Recent Activity (Last 5)
    const { data: recentActivity } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', studentId)
        .order('created_at', { ascending: false })
        .limit(5)

    return {
        profile,
        stats: {
            problemsSolved: problemsSolved || 0,
            competitionsJoined: competitionsJoined || 0,
            xp: profile.xp || 0,
            level: profile.level || 1
        },
        recentActivity
    }
}
