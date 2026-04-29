'use server'

import { createClient } from '@/lib/supabase-server'

export async function getCompetitionByInviteCode(inviteCode: string) {
    try {
        const supabase = createClient()
        
        // Find competition by invite code
        const { data: competition, error } = await supabase
            .from('competitions')
            .select(`
                *,
                creator:profiles!competitions_creator_id_fkey(full_name, username),
                participants:competition_participants(count)
            `)
            .eq('invite_code', inviteCode.toUpperCase())
            .single()

        if (error || !competition) {
            return { success: false, error: 'Competition not found or invalid invite code' }
        }

        return { success: true, competition }
    } catch (error: any) {
        console.error('Error finding competition:', error)
        return { success: false, error: 'Failed to search for competition' }
    }
}

export async function joinCompetition(competitionId: string) {
    try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return { success: false, error: 'You must be logged in to join' }
        }

        // Check if competition is active/exists
        const { data: comp, error: compError } = await supabase
            .from('competitions')
            .select('status, max_participants')
            .eq('id', competitionId)
            .single()

        if (compError || !comp) return { success: false, error: 'Competition not found' }
        
        // Check if already joined
        const { data: existing, error: existError } = await supabase
            .from('competition_participants')
            .select('id')
            .eq('competition_id', competitionId)
            .eq('user_id', user.id)
            .single()

        if (existing) {
            return { success: true, message: 'Already joined' }
        }

        // Join
        const { error: joinError } = await supabase
            .from('competition_participants')
            .insert({
                competition_id: competitionId,
                user_id: user.id
            })

        if (joinError) throw joinError

        return { success: true }
    } catch (error: any) {
        console.error('Error joining competition:', error)
        return { success: false, error: error.message }
    }
}
