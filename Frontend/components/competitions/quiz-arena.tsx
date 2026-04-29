'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    ChevronRight, 
    ChevronLeft, 
    Timer, 
    CheckCircle2, 
    Circle,
    AlertCircle,
    Trophy
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface QuizArenaProps {
    competition: any;
    problems: any[];
    solvedProblemIds: Set<string>;
}

export function QuizArena({ competition, problems, solvedProblemIds }: QuizArenaProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const router = useRouter();

    const currentProblem = problems[currentIndex];
    const isSolved = currentProblem && solvedProblemIds.has(currentProblem.id);

    useEffect(() => {
        if (!competition.started_at) {
            setTimeLeft(competition.duration_minutes * 60);
            return;
        }

        const calculateTimeLeft = () => {
            const start = new Date(competition.started_at).getTime();
            const now = new Date().getTime();
            const elapsed = Math.floor((now - start) / 1000);
            const total = competition.duration_minutes * 60;
            const remaining = Math.max(0, total - elapsed);
            setTimeLeft(remaining);
        };

        calculateTimeLeft();
        const timer = setInterval(() => {
            calculateTimeLeft();
        }, 1000);

        return () => clearInterval(timer);
    }, [competition.started_at, competition.duration_minutes]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const nextProblem = () => {
        if (currentIndex < problems.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const prevProblem = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    if (problems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold">No problems found</h2>
                <p className="text-muted-foreground">This quiz doesn't have any problems yet.</p>
                <Link href={`/competitions/${competition.id}`}>
                    <Button className="mt-4">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }

    const progress = ((currentIndex + 1) / problems.length) * 100;

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Header / Timer */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">{competition.title}</h1>
                    <p className="text-sm text-muted-foreground">Problem {currentIndex + 1} of {problems.length}</p>
                </div>
                
                <Card className={`px-6 py-3 flex items-center gap-3 border-2 ${timeLeft < 300 ? 'border-red-500/50 bg-red-500/10' : 'border-primary/20 bg-primary/5'}`}>
                    <Timer className={`w-5 h-5 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
                    <span className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-primary'}`}>
                        {formatTime(timeLeft)}
                    </span>
                </Card>
            </div>

            {/* Progress Bar */}
            <div className="mb-8 space-y-2">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>PROGRESS</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Problem Navigation Dots */}
            <div className="flex justify-center gap-2 mb-8">
                {problems.map((p, idx) => (
                    <button
                        key={p.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`
                            w-3 h-3 rounded-full transition-all
                            ${idx === currentIndex ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-125' : ''}
                            ${solvedProblemIds.has(p.id) ? 'bg-green-500' : 'bg-white/20 hover:bg-white/40'}
                        `}
                        title={p.title}
                    />
                ))}
            </div>

            {/* Main Content */}
            <Card className="p-8 bg-card/50 backdrop-blur border-white/10 shadow-2xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Trophy className="w-32 h-32" />
                </div>

                <div className="flex items-start justify-between mb-6">
                    <div className="space-y-1">
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                            {currentProblem.category}
                        </Badge>
                        <h2 className="text-3xl font-bold group-hover:text-primary transition-colors">
                            {currentProblem.title}
                        </h2>
                    </div>
                    <Badge className={`
                        ${currentProblem.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' : 
                          currentProblem.difficulty === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' : 
                          'bg-red-500/20 text-red-400'}
                    `}>
                        {currentProblem.difficulty}
                    </Badge>
                </div>

                <div className="p-6 rounded-xl bg-white/5 border border-white/5 mb-8">
                    <p className="text-lg text-gray-300 leading-relaxed">
                        Ready to solve this challenge? Click the button below to open the code editor and submit your solution.
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={prevProblem} 
                            disabled={currentIndex === 0}
                            className="bg-white/5 border-white/10"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={nextProblem} 
                            disabled={currentIndex === problems.length - 1}
                            className="bg-white/5 border-white/10"
                        >
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    <Link href={`/problems/${currentProblem.slug}?competitionId=${competition.id}`}>
                        <Button className={`
                            px-8 py-6 text-lg font-bold transition-all
                            ${isSolved ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'}
                        `}>
                            {isSolved ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5 mr-2" /> Solved
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5 mr-2" /> Solve Now
                                </>
                            )}
                        </Button>
                    </Link>
                </div>
            </Card>

            {/* Quick Tips / Leaderboard Preview */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-white/5 border-white/10 flex items-center gap-4">
                    <div className="p-2 rounded bg-yellow-500/10">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Earn up to 100 XP</p>
                        <p className="text-xs text-muted-foreground">Faster solutions get more points!</p>
                    </div>
                </Card>
                <Card className="p-4 bg-white/5 border-white/10 flex items-center gap-4">
                    <div className="p-2 rounded bg-purple-500/10">
                        <Zap className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Penalty System</p>
                        <p className="text-xs text-muted-foreground">10 points deducted for each wrong submission.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
