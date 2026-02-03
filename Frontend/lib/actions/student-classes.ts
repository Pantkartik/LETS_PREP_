'use server'

import { requireUser } from './utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// --- Validation Schemas ---

const JoinClassSchema = z.object({
    inviteCode: z.string().length(6, 'Invite code must be 6 characters'),
})

// --- Actions ---

/**
 * Join a classroom using an invite code
 */
export async function joinClassroom(inviteCode: string) {
    try {
        const { supabase, user } = await requireUser()

        // Validate input
        const validated = JoinClassSchema.parse({ inviteCode: inviteCode.toUpperCase() })

        // 1. Find the classroom
        const { data: classroom, error: findError } = await supabase
            .from('classrooms')
            .select('id, name, max_students, teacher_id')
            .eq('invite_code', validated.inviteCode)
            .single()

        if (findError || !classroom) {
            return { success: false, error: 'Invalid invite code. Please check and try again.' }
        }

        // 2. Check if classroom is full
        const { count, error: countError } = await supabase
            .from('classroom_students')
            .select('*', { count: 'exact', head: true })
            .eq('classroom_id', classroom.id)

        if (countError) throw countError

        if (count && count >= classroom.max_students) {
            return { success: false, error: 'This classroom is full. Please contact your teacher.' }
        }

        // 3. Check if student is already enrolled
        const { data: existing, error: checkError } = await supabase
            .from('classroom_students')
            .select('id')
            .eq('classroom_id', classroom.id)
            .eq('student_id', user.id)
            .maybeSingle()

        if (checkError) throw checkError

        if (existing) {
            return {
                success: false,
                error: 'You are already enrolled in this classroom.',
                classroomId: classroom.id
            }
        }

        // 4. Enroll the student
        const { error: enrollError } = await supabase
            .from('classroom_students')
            .insert({
                classroom_id: classroom.id,
                student_id: user.id
            })

        if (enrollError) {
            console.error('Error enrolling student:', enrollError)
            throw new Error('Failed to join classroom. Please try again.')
        }

        // 5. Auto-register for active competitions in this classroom
        const { data: activeCompetitions } = await supabase
            .from('competitions')
            .select('id')
            .eq('classroom_id', classroom.id)
            .eq('is_active', true)
            .eq('status', 'ACTIVE')

        if (activeCompetitions && activeCompetitions.length > 0) {
            for (const comp of activeCompetitions) {
                // Check if already registered
                const { data: existing } = await supabase
                    .from('competition_participants')
                    .select('id')
                    .eq('competition_id', comp.id)
                    .eq('user_id', user.id)
                    .maybeSingle()

                if (!existing) {
                    await supabase
                        .from('competition_participants')
                        .insert({
                            competition_id: comp.id,
                            user_id: user.id
                        })
                }
            }
        }

        // 6. Log activity
        await supabase.from('activity_logs').insert({
            user_id: user.id,
            activity_type: 'JOINED_CLASS',
            metadata: { classroom_id: classroom.id, classroom_name: classroom.name }
        })

        revalidatePath('/dashboard')
        revalidatePath('/classes')

        return {
            success: true,
            message: `Successfully joined ${classroom.name}!`,
            classroomId: classroom.id,
            classroomName: classroom.name
        }

    } catch (error: any) {
        console.error('Error joining classroom:', error)
        return { success: false, error: error.message || 'An unexpected error occurred' }
    }
}

/**
 * Get all classrooms the student is enrolled in
 */
export async function getMyClassrooms() {
    try {
        const { supabase, user } = await requireUser()

        const { data: enrollments, error } = await supabase
            .from('classroom_students')
            .select(`
                *,
                classroom:classroom_id(
                    id,
                    name,
                    description,
                    difficulty,
                    invite_code,
                    teacher_id,
                    created_at,
                    teacher:teacher_id(
                        id,
                        username,
                        full_name
                    )
                )
            `)
            .eq('student_id', user.id)
            .order('joined_at', { ascending: false })

        if (error) throw error

        return {
            success: true,
            classrooms: enrollments?.map(e => e.classroom) || []
        }

    } catch (error: any) {
        console.error('Error fetching classrooms:', error)
        return { success: false, error: error.message, classrooms: [] }
    }
}

/**
 * Leave a classroom
 */
export async function leaveClassroom(classroomId: string) {
    try {
        const { supabase, user } = await requireUser()

        const { error } = await supabase
            .from('classroom_students')
            .delete()
            .eq('classroom_id', classroomId)
            .eq('student_id', user.id)

        if (error) throw error

        revalidatePath('/dashboard')
        revalidatePath('/classes')

        return { success: true, message: 'Successfully left the classroom' }

    } catch (error: any) {
        console.error('Error leaving classroom:', error)
        return { success: false, error: error.message }
    }
}
