'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import {
    Trophy,
    Clock,
    Users,
    Target,
    ArrowLeft,
    Play,
    Square,
    Medal,
    Zap,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { formatDistanceToNow } from 'date-fns';

interface CompetitionViewProps {
    competition: any;
    isTeacher: boolean;
    userId: string;
}

export function CompetitionView({ competition, isTeacher, userId }: CompetitionViewProps) {
    const [participants, setParticipants] = useState(competition.participants || []);
    const supabase = createClient();

    // Real-time leaderboard updates
    useEffect(() => {
        const channel = supabase
            .channel(`competition-${competition.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'competition_participants',
                    filter: `competition_id=eq.${competition.id}`
                },
                async () => {
                    // Refetch participants
                    const { data } = await supabase
                        .from('competition_participants')
                        .select(`
                            *,
                            profile:profiles(
                                id,
                                username,
                                full_name,
                                avatar_url
                            )
                        `)
                        .eq('competition_id', competition.id)
                        .order('score', { ascending: false });

                    if (data) {
                        setParticipants(data);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [competition.id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'DRAFT': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            case 'COMPLETED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Medal className="w-5 h-5 text-yellow-500" />;
            case 2: return <Medal className="w-5 h-5 text-gray-400" />;
            case 3: return <Medal className="w-5 h-5 text-orange-600" />;
            default: return <span className="text-muted-foreground">#{rank}</span>;
        }
    };

    const timeRemaining = competition.started_at && competition.duration_minutes
        ? new Date(new Date(competition.started_at).getTime() + competition.duration_minutes * 60000)
        : null;

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
            <DashboardSidebar />

            <div className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href={`/classes/${competition.classroom.id}`}>
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Classroom
                        </Button>
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{competition.title}</h1>
                            <p className="text-muted-foreground">{competition.classroom.name}</p>
                        </div>
                        <Badge className={getStatusColor(competition.status)}>
                            {competition.status}
                        </Badge>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Card className="p-6 bg-card/50 backdrop-blur border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-purple-500/10">
                                <Users className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{participants.length}</p>
                                <p className="text-xs text-muted-foreground">Participants</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-card/50 backdrop-blur border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-blue-500/10">
                                <Target className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{competition.selected_problems?.length || 0}</p>
                                <p className="text-xs text-muted-foreground">Problems</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-card/50 backdrop-blur border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-green-500/10">
                                <Clock className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{competition.duration_minutes}</p>
                                <p className="text-xs text-muted-foreground">Minutes</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-card/50 backdrop-blur border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-orange-500/10">
                                <Zap className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{competition.penalty_per_wrong}</p>
                                <p className="text-xs text-muted-foreground">Min Penalty</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Leaderboard */}
                <Card className="p-6 bg-card/50 backdrop-blur border-white/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            Live Leaderboard
                        </h2>
                        {competition.status === 'ACTIVE' && (
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                Live
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-2">
                        {participants.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No participants yet</p>
                            </div>
                        ) : (
                            participants
                                .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
                                .map((participant: any, index: number) => {
                                    const rank = index + 1;
                                    const isCurrentUser = participant.user_id === userId;

                                    return (
                                        <Card
                                            key={participant.id}
                                            className={`p-4 transition-all ${isCurrentUser
                                                    ? 'bg-purple-500/20 border-purple-500/50'
                                                    : 'bg-card/40 border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-12 flex items-center justify-center">
                                                        {getRankIcon(rank)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold">
                                                            {participant.profile?.full_name || participant.profile?.username}
                                                            {isCurrentUser && (
                                                                <Badge className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500/30">
                                                                    You
                                                                </Badge>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            @{participant.profile?.username}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-green-400">
                                                            {participant.problems_solved || 0}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">Solved</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-purple-400">
                                                            {participant.score || 0}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">Score</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })
                        )}
                    </div>
                </Card>

                {/* Action Button for Students */}
                {!isTeacher && competition.status === 'ACTIVE' && (
                    <div className="mt-8 flex justify-center">
                        <Link href={`/competitions/${competition.id}/solve`}>
                            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold shadow-lg px-8 py-6 text-lg">
                                <Play className="w-5 h-5 mr-2" />
                                Start Solving Problems
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
