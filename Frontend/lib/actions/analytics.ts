'use server'

import { createClient } from '@/lib/supabase-server'

export async function getUserActivity(userId: string) {
    const supabase = await createClient()

    // Fetch logs for the last year (LeetCode style)
    const { data, error } = await supabase
        .from('activity_logs')
        .select('created_at, activity_type')
        .eq('user_id', userId)
        .gte('created_at', new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString())

    if (error) return []

    // Process data for heatmap (client expects { date: 'YYYY-MM-DD', count: 5 })
    const activityMap = new Map<string, number>()

    data.forEach(log => {
        const date = new Date(log.created_at).toISOString().split('T')[0]
        activityMap.set(date, (activityMap.get(date) || 0) + 1)
    })

    return Array.from(activityMap.entries()).map(([date, count]) => ({
        date,
        count,
        level: getLevel(count) // Helper to determine color intensity 0-4
    }))
}

function getLevel(count: number): number {
    if (count === 0) return 0
    if (count <= 2) return 1
    if (count <= 4) return 2
    if (count <= 7) return 3
    return 4
}
