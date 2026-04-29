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
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('requireTeacher: Error fetching profile:', error.message)
        
        // If profile not found, maybe it's being created. Let's wait a bit and retry once.
        if (error.code === 'PGRST116') {
             console.log('Profile not found for teacher, retrying in 1s...');
             await new Promise(resolve => setTimeout(resolve, 1000));
             const { data: retryProfile, error: retryError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
             
             if (retryError || !retryProfile) {
                 console.error('requireTeacher: Retry failed.');
                 redirect('/login?error=profile_not_found')
             }
             if (retryProfile.role !== 'TEACHER') {
                 redirect('/dashboard?error=unauthorized_teacher')
             }
             return { supabase, user }
        }
        
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    if (!profile || profile.role !== 'TEACHER') {
        console.warn(`requireTeacher: Access denied for user ${user.id}. Role: ${profile?.role}`)
        // Redirect to student dashboard if they are a student
        if (profile?.role === 'STUDENT') {
            redirect('/dashboard?error=not_a_teacher')
        }
        redirect('/login?error=unauthorized_teacher')
    }

    return { supabase, user }
}
