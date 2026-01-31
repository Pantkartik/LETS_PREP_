'use server'

import { requireTeacher } from './utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// --- Validation Schemas ---

const CreateClassSchema = z.object({
    name: z.string().min(3, 'Class name must be at least 3 characters'),
    description: z.string().optional(),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    maxStudents: z.number().min(1).max(1000).default(50),
})

// --- Actions ---

/**
 * Fetch all classes created by the current teacher
 */
export async function getTeacherClasses() {
    try {
        const { supabase, user } = await requireTeacher()

        const { data: classes, error } = await supabase
            .from('classrooms')
            .select(`
                *,
                students:classroom_students(count)
            `)
            .eq('teacher_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching classes:', error)
            return []
        }

        // Clean up the count response
        return classes.map(c => ({
            ...c,
            student_count: c.students?.[0]?.count || 0
        }))

    } catch (error) {
        console.error('Error in getTeacherClasses:', error)
        return []
    }
}

/**
 * Create a new classroom
 */
export async function createClassroom(data: z.infer<typeof CreateClassSchema>) {
    try {
        const { supabase, user } = await requireTeacher()

        // Validate input
        const validated = CreateClassSchema.parse(data)

        // Generate Invite Code (using RPC if available or random string)
        // For now, let's use a random string like in teacher-competitions
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

        const { data: classroom, error } = await supabase
            .from('classrooms')
            .insert({
                name: validated.name,
                description: validated.description,
                difficulty: validated.difficulty,
                max_students: validated.maxStudents,
                teacher_id: user.id,
                invite_code: inviteCode
            })
            .select()
            .single()

        if (error) throw new Error(error.message)

        revalidatePath('/classes')
        return { success: true, classroom }

    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Delete a classroom and its student associations
 */
export async function deleteClassroom(classId: string) {
    try {
        const { supabase } = await requireTeacher()

        // Deletion will cascade to classroom_students due to REFERENCES ... ON DELETE CASCADE
        const { error } = await supabase
            .from('classrooms')
            .delete()
            .eq('id', classId)

        if (error) throw new Error(error.message)

        revalidatePath('/classes')
        return { success: true }

    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

/**
 * Fetch a classroom with all its students and their performance
 */
export async function getFullClassroomDetails(classId: string) {
    try {
        const { supabase } = await requireTeacher()

        // 1. Get Classroom Info
        const { data: classroom, error: classError } = await supabase
            .from('classrooms')
            .select('*')
            .eq('id', classId)
            .single()

        if (classError) throw classError

        // 2. Get Students with Profiles
        const { data: students, error: studentError } = await supabase
            .from('classroom_students')
            .select(`
                *,
                profile:student_id(
                    id,
                    username,
                    full_name,
                    avatar_url,
                    xp,
                    level,
                    total_battles,
                    total_wins
                )
            `)
            .eq('classroom_id', classId)

        if (studentError) throw studentError

        return {
            success: true,
            classroom,
            students: students || []
        }

    } catch (error: any) {
        console.error('Error in getFullClassroomDetails:', error.message || error)
        return { success: false, error: error.message || 'Unknown error occurred' }
    }
}

/**
 * Launch a competition specifically for a classroom
 * This automatically registers all students in the class
 */
export async function launchClassCompetition(classId: string, competitionData: {
    title: string,
    description?: string,
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    maxParticipants: number
}) {
    try {
        const { supabase, user } = await requireTeacher()

        // 1. Create the Competition Room
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

        const { data: room, error: roomError } = await supabase
            .from('competitions')
            .insert({
                title: competitionData.title,
                description: competitionData.description,
                difficulty: competitionData.difficulty,
                max_participants: competitionData.maxParticipants,
                creator_id: user.id,
                invite_code: inviteCode,
                classroom_id: classId, // Link to class
                status: 'ACTIVE' // Start as ACTIVE since it's a direct launch
            })
            .select()
            .single()

        if (roomError) throw roomError

        // 2. Auto-register class students using RPC
        const { error: rpcError } = await supabase.rpc('register_class_to_competition', {
            comp_id: room.id,
            class_id: classId
        })

        if (rpcError) console.warn('Auto-registration RPC failed, students may need to join manually:', rpcError)

        revalidatePath('/teacher/competitions')
        revalidatePath(`/classes/${classId}`)

        return { success: true, room }

    } catch (error: any) {
        console.error('Error launching class competition:', error)
        return { success: false, error: error.message }
    }
}
