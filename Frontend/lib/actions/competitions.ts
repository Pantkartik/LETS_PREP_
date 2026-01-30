'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCompetition(formData: FormData) {
    const supabase = await createClient()

    // 1. Get current user (must be teacher)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Optional: Check if user is teacher (RLS handles this too, but good for UI feedback)

    // 2. Extract Data
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const difficulty = formData.get('difficulty') as string
    const maxParticipants = parseInt(formData.get('maxParticipants') as string)

    // Generate a random 6-char invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data, error } = await supabase
        .from('competitions')
        .insert({
            title,
            description,
            difficulty,
            max_participants: maxParticipants,
            invite_code: inviteCode,
            creator_id: user.id,
            status: 'ACTIVE'
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating competition:', error)
        return { error: error.message }
    }

    revalidatePath('/teacher/competitions')
    return { success: true, data }
}

export async function joinCompetition(inviteCode: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Must be logged in' }

    // 1. Find Competition
    const { data: competition, error: findError } = await supabase
        .from('competitions')
        .select('id, status')
        .eq('invite_code', inviteCode)
        .single()

    if (findError || !competition) return { error: 'Invalid invite code' }
    if (competition.status !== 'ACTIVE') return { error: 'Competition is not active' }

    // 2. Add Participant
    const { error: joinError } = await supabase
        .from('competition_participants')
        .insert({
            competition_id: competition.id,
            user_id: user.id
        })

    if (joinError) {
        // Check for unique constraint (already joined)
        if (joinError.code === '23505') {
            return { error: 'You have already joined this competition', competitionId: competition.id }
        }
        return { error: joinError.message }
    }

    // 3. Log Activity
    await supabase.from('activity_logs').insert({
        user_id: user.id,
        activity_type: 'COMPLETED_JOINED',
        metadata: { competition_id: competition.id }
    })

    revalidatePath('/dashboard')
    return { success: true, competitionId: competition.id }
}

export async function getCompetitions(status = 'ACTIVE') {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('competitions')
        .select(`
            *,
            creator:profiles(name),
            _count:competition_participants(count)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false })

    if (error) return []
    return data
}
