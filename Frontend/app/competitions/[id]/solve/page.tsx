import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Award, CheckCircle2, Circle } from 'lucide-react';
import { QuizArena } from '@/components/competitions/quiz-arena';

interface SolvePageProps {
    params: {
        id: string;
    };
}

export default async function SolvePage({ params }: SolvePageProps) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch competition details
    const { data: competition, error } = await supabase
        .from('competitions')
        .select(`
            *,
            classroom:classrooms(name)
        `)
        .eq('id', params.id)
        .single();

    if (error || !competition) {
        redirect('/dashboard');
    }

    if (competition.status !== 'ACTIVE') {
        redirect(`/competitions/${params.id}`);
    }

    // Fetch selected problems details
    let problems: any[] = [];
    if (competition.selected_problems && competition.selected_problems.length > 0) {
        const { data: problemsData } = await supabase
            .from('problems')
            .select('id, title, slug, difficulty, category')
            .in('id', competition.selected_problems);

        problems = problemsData || [];
    }

    // Fetch user's progress in this competition
    const { data: participant } = await supabase
        .from('competition_participants')
        .select('id, problems_solved')
        .eq('competition_id', competition.id)
        .eq('user_id', user.id)
        .single();

    // Fetch submissions to see which specific problems are solved
    const { data: submissions } = await supabase
        .from('competition_submissions')
        .select('problem_id, status')
        .eq('competition_id', competition.id)
        .eq('participant_id', participant?.id)
        .eq('status', 'ACCEPTED');

    const solvedProblemIds = new Set(submissions?.map(s => s.problem_id) || []);

    if (competition.is_quiz_mode) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
                <QuizArena 
                    competition={competition} 
                    problems={problems} 
                    solvedProblemIds={solvedProblemIds} 
                />
            </div>
        );
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'EASY': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'HARD': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href={`/competitions/${competition.id}`}>
                        <Button variant="ghost" className="mb-4 text-gray-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Competition Dashboard
                        </Button>
                    </Link>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{competition.title}</h1>
                            <p className="text-gray-400">Solve these problems to earn points and climb the leaderboard!</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-mono font-bold text-primary">
                                {String(Math.floor((competition.duration_minutes || 120) / 60)).padStart(2, '0')}:00:00
                            </div>
                            <p className="text-xs text-gray-500">Time Remaining</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {problems.map((problem, index) => {
                        const isSolved = solvedProblemIds.has(problem.id);

                        return (
                            <Link
                                href={`/problems/${problem.slug}?competitionId=${competition.id}`}
                                key={problem.id}
                            >
                                <Card className={`p-6 bg-white/5 border-white/10 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden ${isSolved ? 'border-green-500/30 bg-green-500/5' : ''}`}>
                                    {isSolved && (
                                        <div className="absolute top-0 right-0 p-2">
                                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                                            ${isSolved ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400 group-hover:bg-primary/20 group-hover:text-primary'}
                                        `}>
                                            {index + 1}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                                    {problem.title}
                                                </h3>
                                                <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                                                    {problem.difficulty}
                                                </Badge>
                                                <Badge variant="outline" className="bg-white/5 border-white/10">
                                                    {problem.category}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Click to solve this challenge
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <Button className={`
                                                ${isSolved ? 'bg-green-600 hover:bg-green-700' : 'bg-white/10 hover:bg-white/20'}
                                            `}>
                                                {isSolved ? 'Solved' : 'Solve Challenge'}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}

                    {problems.length === 0 && (
                        <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-gray-400">No problems have been selected for this competition yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

