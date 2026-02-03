import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { CompetitionView } from '@/components/competitions/competition-view';

interface CompetitionPageProps {
    params: {
        id: string;
    };
}

export default async function CompetitionPage({ params }: CompetitionPageProps) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get user profile to check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // Get competition details
    const { data: competition, error } = await supabase
        .from('competitions')
        .select(`
            *,
            classroom:classrooms(
                id,
                name,
                teacher_id
            ),
            participants:competition_participants(
                id,
                user_id,
                score,
                rank,
                problems_solved,
                profile:profiles(
                    id,
                    username,
                    full_name,
                    avatar_url
                )
            )
        `)
        .eq('id', params.id)
        .single();

    if (error || !competition) {
        redirect('/dashboard');
    }

    // Check if user is teacher of this classroom
    const isTeacher = profile?.role === 'teacher' && competition.classroom.teacher_id === user.id;

    // Check if user is participant
    const isParticipant = competition.participants?.some((p: any) => p.user_id === user.id);

    if (!isTeacher && !isParticipant) {
        redirect('/dashboard');
    }

    return (
        <CompetitionView
            competition={competition}
            isTeacher={isTeacher}
            userId={user.id}
        />
    );
}
