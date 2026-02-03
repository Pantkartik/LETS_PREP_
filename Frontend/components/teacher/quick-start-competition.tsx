'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Loader2, Sparkles } from 'lucide-react';
import { createCompetition, getAvailableProblems, startCompetition } from '@/lib/actions/teacher-competitions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface QuickStartCompetitionProps {
    classroomId: string;
    className: string;
}

export function QuickStartCompetition({ classroomId, className }: QuickStartCompetitionProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleQuickStart = async () => {
        setLoading(true);
        try {
            // 1. Get available problems
            const problemsResult = await getAvailableProblems();
            if (!problemsResult.success || !problemsResult.problems) {
                toast.error('Failed to load problems');
                return;
            }

            const allProblems = problemsResult.problems;

            // 2. Filter by difficulty
            const easyProblems = allProblems.filter(p => p.difficulty?.toUpperCase() === 'EASY');
            const mediumProblems = allProblems.filter(p => p.difficulty?.toUpperCase() === 'MEDIUM');
            const hardProblems = allProblems.filter(p => p.difficulty?.toUpperCase() === 'HARD');

            // 3. Randomly select: 1 easy, 2 medium, 1 hard
            const selectedProblems: string[] = [];

            // Select 1 easy
            if (easyProblems.length > 0) {
                const randomEasy = easyProblems[Math.floor(Math.random() * easyProblems.length)];
                selectedProblems.push(randomEasy.id);
            }

            // Select 2 medium
            const shuffledMedium = [...mediumProblems].sort(() => Math.random() - 0.5);
            selectedProblems.push(...shuffledMedium.slice(0, 2).map(p => p.id));

            // Select 1 hard
            if (hardProblems.length > 0) {
                const randomHard = hardProblems[Math.floor(Math.random() * hardProblems.length)];
                selectedProblems.push(randomHard.id);
            }

            // 4. Validate we have 4 problems
            if (selectedProblems.length !== 4) {
                toast.error('Not enough problems available. Need at least 1 easy, 2 medium, and 1 hard problem.');
                return;
            }

            // 5. Create competition
            const createResult = await createCompetition({
                classroomId,
                title: `${className} - Quick Competition`,
                description: 'Auto-generated competition with 1 Easy, 2 Medium, 1 Hard problem',
                selectedProblems,
                durationMinutes: 120,
                maxParticipants: 100
            });

            if (!createResult.success || !createResult.competition) {
                toast.error(createResult.error || 'Failed to create competition');
                return;
            }

            // 6. Start competition immediately
            const startResult = await startCompetition(createResult.competition.id);

            if (startResult.success) {
                toast.success('🎉 Competition started! All students have been registered.');
                router.push(`/competitions/${createResult.competition.id}`);
            } else {
                toast.error(startResult.error || 'Failed to start competition');
            }
        } catch (error) {
            console.error('Error starting competition:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleQuickStart}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold shadow-lg shadow-purple-500/20 group"
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Starting Competition...
                </>
            ) : (
                <>
                    <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Quick Start Competition
                </>
            )}
        </Button>
    );
}
