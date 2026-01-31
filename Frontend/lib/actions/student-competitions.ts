'use server'

import { requireUser } from './utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// --- Validation Schemas ---

const SubmitCodeSchema = z.object({
    competitionId: z.string().uuid(),
    problemId: z.string().uuid(),
    code: z.string().min(1, 'Code cannot be empty'),
    language: z.enum(['cpp', 'java', 'python', 'javascript']),
})

// --- Actions ---

/**
 * Submit code for evaluation
 */
export async function submitCode(data: z.infer<typeof SubmitCodeSchema>) {
    try {
        const { supabase, user } = await requireUser()

        // Validate input
        const validated = SubmitCodeSchema.parse(data)

        // Get participant ID
        const { data: participant, error: partError } = await supabase
            .from('competition_participants')
            .select('id, competition_id')
            .eq('competition_id', validated.competitionId)
            .eq('user_id', user.id)
            .single()

        if (partError || !participant) {
            throw new Error('Not registered for this competition')
        }

        // Check if competition is active
        const { data: competition, error: compError } = await supabase
            .from('competitions')
            .select('is_active, status, started_at, duration_minutes')
            .eq('id', validated.competitionId)
            .single()

        if (compError || !competition) {
            throw new Error('Competition not found')
        }

        if (!competition.is_active || competition.status !== 'ACTIVE') {
            throw new Error('Competition is not active')
        }

        // Check if competition time has expired
        if (competition.started_at) {
            const startTime = new Date(competition.started_at).getTime()
            const currentTime = new Date().getTime()
            const elapsedMinutes = (currentTime - startTime) / (1000 * 60)

            if (elapsedMinutes > competition.duration_minutes) {
                throw new Error('Competition time has expired')
            }
        }

        // Create submission
        const { data: submission, error: subError } = await supabase
            .from('competition_submissions')
            .insert({
                competition_id: validated.competitionId,
                participant_id: participant.id,
                problem_id: validated.problemId,
                code: validated.code,
                language: validated.language,
                status: 'PENDING'
            })
            .select()
            .single()

        if (subError) throw subError

        // Trigger code execution (this will be handled by the backend)
        // For now, we'll return the submission ID
        // The backend will pick this up and process it

        revalidatePath(`/competitions/${validated.competitionId}`)
        return {
            success: true,
            submission,
            message: 'Code submitted successfully. Evaluating...'
        }

    } catch (error: any) {
        console.error('Error submitting code:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Get user's submissions for a competition
 */
export async function getMySubmissions(competitionId: string, problemId?: string) {
    try {
        const { supabase, user } = await requireUser()

        // Get participant ID
        const { data: participant } = await supabase
            .from('competition_participants')
            .select('id')
            .eq('competition_id', competitionId)
            .eq('user_id', user.id)
            .single()

        if (!participant) {
            return { success: true, submissions: [] }
        }

        let query = supabase
            .from('competition_submissions')
            .select(`
                *,
                problems(id, title, difficulty)
            `)
            .eq('participant_id', participant.id)
            .order('submitted_at', { ascending: false })

        if (problemId) {
            query = query.eq('problem_id', problemId)
        }

        const { data: submissions, error } = await query

        if (error) throw error

        return { success: true, submissions: submissions || [] }

    } catch (error: any) {
        console.error('Error fetching submissions:', error)
        return { success: false, error: error.message, submissions: [] }
    }
}

/**
 * Get competition problems for a participant
 */
export async function getCompetitionProblems(competitionId: string) {
    try {
        const { supabase, user } = await requireUser()

        // Verify participation
        const { data: participant } = await supabase
            .from('competition_participants')
            .select('id')
            .eq('competition_id', competitionId)
            .eq('user_id', user.id)
            .single()

        if (!participant) {
            throw new Error('Not registered for this competition')
        }

        // Get competition details
        const { data: competition, error: compError } = await supabase
            .from('competitions')
            .select('selected_problems, is_active, status, started_at, duration_minutes')
            .eq('id', competitionId)
            .single()

        if (compError || !competition) {
            throw new Error('Competition not found')
        }

        // Get problem details
        const { data: problems, error: probError } = await supabase
            .from('problems')
            .select('*')
            .in('id', competition.selected_problems || [])

        if (probError) throw probError

        // Get user's submission status for each problem
        const { data: submissions } = await supabase
            .from('competition_submissions')
            .select('problem_id, status')
            .eq('participant_id', participant.id)
            .eq('status', 'ACCEPTED')

        const solvedProblems = new Set(submissions?.map(s => s.problem_id) || [])

        const problemsWithStatus = problems?.map(p => ({
            ...p,
            solved: solvedProblems.has(p.id)
        })) || []

        return {
            success: true,
            problems: problemsWithStatus,
            competition: {
                is_active: competition.is_active,
                status: competition.status,
                started_at: competition.started_at,
                duration_minutes: competition.duration_minutes
            }
        }

    } catch (error: any) {
        console.error('Error fetching competition problems:', error)
        return { success: false, error: error.message, problems: [] }
    }
}

/**
 * Get live leaderboard for a competition
 */
export async function getLiveLeaderboard(competitionId: string) {
    try {
        const { supabase } = await requireUser()

        const { data: leaderboard, error } = await supabase
            .from('competition_leaderboard')
            .select('*')
            .eq('competition_id', competitionId)
            .order('rank_position', { ascending: true })
            .limit(100)

        if (error) throw error

        return { success: true, leaderboard: leaderboard || [] }

    } catch (error: any) {
        console.error('Error fetching leaderboard:', error)
        return { success: false, error: error.message, leaderboard: [] }
    }
}

/**
 * Get user's competition stats
 */
export async function getMyCompetitionStats(competitionId: string) {
    try {
        const { supabase, user } = await requireUser()

        const { data: stats, error } = await supabase
            .from('competition_participants')
            .select('*')
            .eq('competition_id', competitionId)
            .eq('user_id', user.id)
            .single()

        if (error) throw error

        return { success: true, stats }

    } catch (error: any) {
        console.error('Error fetching stats:', error)
        return { success: false, error: error.message }
    }
}
