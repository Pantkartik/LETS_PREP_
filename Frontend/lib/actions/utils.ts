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
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('requireTeacher: Error fetching profile:', error.message)
        throw new Error(`Profile fetch failed: ${error.message}`)
    }

    if (!profile || profile.role !== 'TEACHER') {
        console.warn(`requireTeacher: Access denied for user ${user.id}. Role: ${profile?.role}`)
        throw new Error('Unauthorized: Teachers only')
    }

    return { supabase, user }
}
