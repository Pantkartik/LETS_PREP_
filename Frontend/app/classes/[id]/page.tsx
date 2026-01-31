import React from 'react';
import { getFullClassroomDetails } from '@/lib/actions/teacher-classes';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import ClassroomDetails from '../../../components/teacher/classroom-details';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ClassroomPage({ params }: PageProps) {
    const { id } = await params;

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
