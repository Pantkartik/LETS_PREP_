import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/dashboard'

    if (token_hash && type) {
        const supabase = await createClient()

        const { error } = await supabase.auth.verifyOtp({
            type: type as any,
            token_hash,
        })

        if (!error) {
            // Get user to determine redirect based on role
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Get user profile to check role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                // Redirect based on role
                const redirectUrl = profile?.role === 'TEACHER'
                    ? '/teacher-dashboard'
                    : '/dashboard'

                return NextResponse.redirect(new URL(redirectUrl, origin))
            }

            // Default redirect if no user found
            return NextResponse.redirect(new URL(next, origin))
        }
    }

    // Redirect to error page if confirmation fails
    return NextResponse.redirect(new URL('/auth/error', origin))
}
