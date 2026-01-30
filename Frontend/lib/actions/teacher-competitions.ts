'use server'

import { requireTeacher } from './utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// --- Validation Schemas ---

const CreateRoomSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    maxParticipants: z.number().min(1).max(1000).default(50),
})

const UpdateRoomSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED']).optional(),
})

// --- Actions ---

export async function createGameRoom(data: z.infer<typeof CreateRoomSchema>) {
    try {
        const { supabase, user } = await requireTeacher()

        // Validate input
        const validated = CreateRoomSchema.parse(data)

        // Generate Invite Code
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

        const { data: room, error } = await supabase
            .from('competitions')
            .insert({
                title: validated.title,
                description: validated.description,
                difficulty: validated.difficulty,
                max_participants: validated.maxParticipants,
                creator_id: user.id,
                invite_code: inviteCode,
                status: 'DRAFT' // Default to Draft
            })
            .select()
            .single()

        if (error) throw new Error(error.message)

        revalidatePath('/teacher/competitions')
        return { success: true, room }

    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function updateGameRoom(data: z.infer<typeof UpdateRoomSchema>) {
    try {
        const { supabase } = await requireTeacher()
        const { id, ...updates } = UpdateRoomSchema.parse(data)

        const { error } = await supabase
            .from('competitions')
            .update(updates)
            .eq('id', id)

        if (error) throw new Error(error.message)

        revalidatePath('/teacher/competitions')
        return { success: true }

    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function deleteGameRoom(roomId: string) {
    try {
        const { supabase } = await requireTeacher()

        console.log('[DELETE] Starting deletion for room:', roomId)

        // Try using the secure RPC function first (Best approach)
        const { error: rpcError } = await supabase.rpc('delete_competition_cascade', {
            target_room_id: roomId
        });

        if (!rpcError) {
            console.log('[DELETE] Successfully deleted via RPC function')
            revalidatePath('/teacher/competitions')
            return { success: true }
        }

        console.warn('[DELETE] RPC delete failed, falling back to manual delete:', {
            message: rpcError.message,
            code: rpcError.code,
            details: rpcError.details,
            hint: rpcError.hint
        })

        // Fallback: Manual cleanup (Original logic)

        // 1. Delete dependent submissions (Safely)
        console.log('[DELETE] Step 1: Deleting submissions...')
        const { error: subError } = await supabase.from('submissions').delete().eq('competition_id', roomId);
        if (subError && subError.code !== '42703') {
            console.warn('[DELETE] Failed to cleanup submissions:', {
                message: subError.message,
                code: subError.code
            });
        } else {
            console.log('[DELETE] Submissions cleaned up (or column not found)')
        }

        // 2. Delete dependent participants
        console.log('[DELETE] Step 2: Deleting participants...')
        const { error: partError } = await supabase.from('competition_participants').delete().eq('competition_id', roomId);
        if (partError) {
            console.error('[DELETE] Failed to delete participants:', {
                message: partError.message,
                code: partError.code,
                details: partError.details
            })
            throw new Error(`Failed to delete participants: ${partError.message}`)
        }
        console.log('[DELETE] Participants deleted successfully')

        // 3. Delete the competition
        console.log('[DELETE] Step 3: Deleting competition...')
        const { error } = await supabase
            .from('competitions')
            .delete()
            .eq('id', roomId)

        if (error) {
            console.error('[DELETE] Failed to delete competition:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            })
            throw new Error(error.message)
        }

        console.log('[DELETE] Competition deleted successfully')
        revalidatePath('/teacher/competitions')
        return { success: true }

    } catch (error: any) {
        console.error('[DELETE] Final error:', error)
        return { success: false, error: error.message }
    }
}

export async function getTeacherGameRooms() {
    const { supabase, user } = await requireTeacher()

    const { data: rooms, error } = await supabase
        .from('competitions')
        .select(`
      *,
      participants_count:competition_participants(count)
    `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return []
    return rooms
}

export async function getRoomParticipants(roomId: string) {
    const { supabase } = await requireTeacher()

    const { data: participants, error } = await supabase
        .from('competition_participants')
        .select(`
      *,
      profile:user_id(full_name, email, avatar_url)
    `)
        .eq('competition_id', roomId)

    if (error) return []
    return participants
}

export async function getTeacherBattles() {
    const { supabase, user } = await requireTeacher()

    const { data: battles, error } = await supabase
        .from('battles')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching battles:', error);
        return []
    }
    return battles
}
