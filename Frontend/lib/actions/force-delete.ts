'use server'

import { requireTeacher } from './utils'
import { revalidatePath } from 'next/cache'

export async function forceDeleteRoom(roomId: string) {
    try {
        const { supabase } = await requireTeacher()
        console.log('[FORCE DELETE] Starting force deletion for room:', roomId)

        // STRATEGY 1: Regular Delete
        const { error: regError } = await supabase.from('competitions').delete().eq('id', roomId);
        if (!regError) return { success: true };

        // STRATEGY 2: RPC Call
        const { error: rpcError } = await supabase.rpc('delete_competition_cascade', { target_room_id: roomId });
        if (!rpcError) return { success: true };

        // STRATEGY 3: Manual Clean (Ignoring FKs via raw query simulation if possible, but valid here via stepped deletes)
        await supabase.from('competition_participants').delete().eq('competition_id', roomId);
        try { await supabase.from('submissions').delete().eq('competition_id', roomId); } catch (e) { }

        const { error: finalError } = await supabase.from('competitions').delete().eq('id', roomId);

        if (finalError) throw new Error(finalError.message);

        revalidatePath('/teacher/competitions');
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
