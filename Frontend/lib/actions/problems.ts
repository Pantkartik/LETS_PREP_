'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getProblems(topic?: string) {
    const supabase = await createClient()

    let query = supabase.from('problems').select('id, title, slug, difficulty, topic, points')

    if (topic) {
        query = query.eq('topic', topic)
    }

    const { data, error } = await query
    if (error) return []
    return data
}

export async function getProblemBySlug(slug: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.from('problems').select('*').eq('slug', slug).single()
    if (error) return null
    return data
}

// Simulating a Code Execution Engine
async function executeCode(language: string, code: string, testCases: any[]) {
    // TODO: Connect this to Piston/Judge0 API
    // For now, we simulate success
    return {
        status: 'ACCEPTED', // or WRONG_ANSWER
        runtime: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 5000)
    }
}

export async function submitSolution(problemId: string, code: string, language: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Get Problem Test Cases
    const { data: problem } = await supabase.from('problems').select('test_cases').eq('id', problemId).single()

    // 2. Run Code (Simulated)
    const result = await executeCode(language, code, problem?.test_cases || [])

    // 3. Save Submission
    const { error } = await supabase.from('submissions').insert({
        user_id: user.id,
        problem_id: problemId,
        code,
        language,
        status: result.status,
        runtime_ms: result.runtime,
        memory_usage_kb: result.memory
    })

    if (error) return { error: error.message }

    // 4. Log Activity if Accepted
    if (result.status === 'ACCEPTED') {
        await supabase.from('activity_logs').insert({
            user_id: user.id,
            activity_type: 'PROBLEM_SOLVED',
            metadata: { problem_id: problemId, runtime: result.runtime }
        })

        // Update user XP (Optional/Future)
        // updateProfileXp(user.id, 10) 
    }

    revalidatePath(`/problems/${problemId}`)
    return { success: true, result }
}
