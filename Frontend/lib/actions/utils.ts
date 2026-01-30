'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function requireUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }
    return { supabase, user }
}

export async function requireTeacher() {
    const { supabase, user } = await requireUser()

    // Check profile for role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'TEACHER') {
        throw new Error('Unauthorized: Teachers only')
    }

    return { supabase, user }
}
