import React from 'react';
import { getFullClassroomDetails } from '@/lib/actions/teacher-classes';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import ClassroomDetails from '../../../components/teacher/classroom-details';
import StudentClassroomView from '../../../components/student/classroom-view';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ClassroomPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user and their role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        notFound();
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // If user is a teacher, show teacher view
    if (profile?.role === 'TEACHER') {
        const result = await getFullClassroomDetails(id);

        if (!result.success || !result.classroom) {
            notFound();
        }

        return (
            <div className="flex h-screen bg-background text-foreground">
                <DashboardSidebar />
                <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/5 via-background to-background">
                    <ClassroomDetails
                        initialClassroom={result.classroom}
                        initialStudents={result.students || []}
                    />
                </main>
            </div>
        );
    }

    // Otherwise, show student view
    return <StudentClassroomView />;
}
