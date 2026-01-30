'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Play, Copy, Trophy, Lock, Unlock, StopCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Battle {
    id: string;
    title: string;
    room_code: string;
    status: 'WAITING' | 'LOCKED' | 'ACTIVE' | 'COMPLETED';
    max_players: number;
    current_players: number;
    difficulty: string;
    created_by: string;
}

interface Participant {
    user_id: string;
    full_name: string;
    username: string;
    status: string;
    score: number;
    avatar_url?: string;
}

export default function TeacherBattleRoom() {
    const { id } = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [battle, setBattle] = useState<Battle | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState<number | null>(null);

    useEffect(() => {
        fetchBattleData();

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`teacher_room:${id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'battle_participants', filter: `battle_id=eq.${id}` }, (payload) => {
                fetchParticipants();
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'battles', filter: `id=eq.${id}` }, (payload: any) => {
                setBattle(payload.new); // Keep local state in sync if changed elsewhere
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    const fetchBattleData = async () => {
        try {
            const { data, error } = await supabase.from('battles').select('*').eq('id', id).single();
            if (error) throw error;
            setBattle(data);
            fetchParticipants();
        } catch (error) {
            console.error('Error fetching battle:', error);
            toast.error("Could not load battle room");
            router.push('/teacher-dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipants = async () => {
        try {
            const { data, error } = await supabase
                .from('battle_participants')
                .select(`
          user_id, status, score,
          profiles:user_id (full_name, username, avatar_url)
        `)
                .eq('battle_id', id);

            if (error) throw error;

            const formattedParticipants = data.map((p: any) => ({
                user_id: p.user_id,
                status: p.status,
                score: p.score || 0,
                full_name: p.profiles?.full_name || 'Unknown',
                username: p.profiles?.username || 'user',
                avatar_url: p.profiles?.avatar_url
            }));

            setParticipants(formattedParticipants);
        } catch (error) {
            console.error('Error fetching participants:', error);
        }
    };

    const copyRoomCode = () => {
        if (battle?.room_code) {
            navigator.clipboard.writeText(battle.room_code);
            toast.success('Room code copied!');
        }
    };

    const toggleLock = async () => {
        if (!battle) return;
        const newStatus = battle.status === 'LOCKED' ? 'WAITING' : 'LOCKED';

        try {
            const { error } = await supabase.from('battles').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
            setBattle({ ...battle, status: newStatus });
            toast.success(newStatus === 'LOCKED' ? 'Room Locked' : 'Room Unlocked');
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const startBattle = async () => {
        if (!battle) return;
        toast.info("Starting battle sequence...");

        try {
            // 1. Pick a random problem (simplified: pick first EASY/MEDIUM based on battle)
            // In production, fetch count then offset random
            const { data: problems } = await supabase
                .from('problems')
                .select('id')
                .limit(10); // get a few

            if (!problems || problems.length === 0) {
                toast.error("No problems found in database! Please seed them.");
                return;
            }

            const randomProblem = problems[Math.floor(Math.random() * problems.length)];

            // 2. Start Countdown UI locally
            startCountdown();

            // 3. Update DB (Clients will react to this)
            const { error } = await supabase
                .from('battles')
                .update({
                    status: 'ACTIVE',
                    actual_start_time: new Date().toISOString(),
                    problem_id: randomProblem.id
                })
                .eq('id', id);

            if (error) throw error;

        } catch (error: any) {
            toast.error('Failed to start: ' + error.message);
        }
    };

    const startCountdown = () => {
        setCountdown(10);
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(interval);
                    return null;
                }
                return prev ? prev - 1 : null;
            });
        }, 1000);
    };

    const endBattle = async () => {
        if (!confirm("Are you sure you want to end the battle?")) return;
        await supabase.from('battles').update({ status: 'COMPLETED', end_time: new Date().toISOString() }).eq('id', id);
        setBattle(battle ? { ...battle, status: 'COMPLETED' } : null);
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading Room...</div>;
    if (!battle) return <div className="flex h-screen items-center justify-center">Room not found</div>;

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto bg-muted/5 flex flex-col relative">

                {/* Countdown Overlay */}
                {countdown !== null && (
                    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center text-white text-9xl font-bold animate-pulse">
                        {countdown}
                    </div>
                )}

                {/* Top Bar */}
                <header className="bg-card border-b border-border/50 p-6 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/teacher-dashboard')}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                {battle.title}
                                <Badge variant="outline" className="text-xs font-normal">
                                    {battle.difficulty}
                                </Badge>
                            </h1>
                            <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                                <span className={`inline-block w-2 h-2 rounded-full ${battle.status === 'WAITING' ? 'bg-yellow-500' :
                                    battle.status === 'ACTIVE' ? 'bg-red-500 animate-pulse' :
                                        battle.status === 'COMPLETED' ? 'bg-gray-500' : 'bg-orange-500'
                                    }`}></span>
                                Status: {battle.status}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Controls */}
                        {battle.status !== 'COMPLETED' && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={toggleLock}
                                    disabled={battle.status === 'ACTIVE'}
                                    className={battle.status === 'LOCKED' ? 'border-red-500 text-red-500 hover:bg-red-500/10' : ''}
                                >
                                    {battle.status === 'LOCKED' ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                                    {battle.status === 'LOCKED' ? 'Unlock Room' : 'Lock Room'}
                                </Button>

                                {battle.status === 'ACTIVE' ? (
                                    <Button variant="destructive" onClick={endBattle}>
                                        <StopCircle className="w-4 h-4 mr-2" />
                                        End Battle
                                    </Button>
                                ) : (
                                    <Button
                                        size="lg"
                                        className="bg-green-600 hover:bg-green-700 gap-2 shadow-lg shadow-green-900/20"
                                        onClick={startBattle}
                                        disabled={battle.status === 'LOCKED'}
                                    >
                                        <Play className="w-5 h-5 fill-current" />
                                        Start Battle
                                    </Button>
                                )}
                            </>
                        )}

                        <div className="bg-card px-4 py-2 rounded border border-border flex items-center gap-3">
                            <span className="text-xs text-muted-foreground font-bold">CODE</span>
                            <span className="text-xl font-mono font-bold tracking-widest">{battle.room_code}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyRoomCode}>
                                <Copy className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* content */}
                <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Participants Grid / List */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <Card className="p-4 bg-primary/5 border-primary/20">
                                <div className="text-2xl font-bold text-primary">{participants.length}</div>
                                <div className="text-xs text-muted-foreground uppercase">Active Participants</div>
                            </Card>
                            <Card className="p-4">
                                <div className="text-2xl font-bold">{participants.filter(p => p.status === 'COMPLETED').length}</div>
                                <div className="text-xs text-muted-foreground uppercase">Submissions</div>
                            </Card>
                            <Card className="p-4">
                                <div className="text-2xl font-bold">
                                    {participants.length > 0 ? Math.round(participants.reduce((a, b) => a + (b.score || 0), 0) / participants.length) : 0}
                                </div>
                                <div className="text-xs text-muted-foreground uppercase">Avg Score</div>
                            </Card>
                        </div>

                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Classroom View
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {participants.map((p) => (
                                <Card key={p.user_id} className={`p-4 flex flex-col items-center gap-3 border transition-all ${p.status === 'COMPLETED' ? 'bg-green-500/10 border-green-500/50' : 'bg-card border-border/50'
                                    }`}>
                                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center font-bold text-lg relative">
                                        {p.full_name?.charAt(0)}
                                        {p.status === 'COMPLETED' && (
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                                                <CheckCircle className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center w-full">
                                        <p className="font-bold text-sm truncate">{p.full_name}</p>
                                        {battle.status === 'ACTIVE' && p.status === 'COMPLETED' ? (
                                            <div className="text-xs font-bold text-green-500 mt-1">Score: {p.score}</div>
                                        ) : (
                                            <Badge variant="secondary" className="text-[10px] mt-1">{p.status}</Badge>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Live Leaderboard Sidebar */}
                    <div className="bg-card border-l border-border/50 -my-8 p-6 flex flex-col">
                        <div className="flex items-center gap-2 font-bold mb-6 text-lg">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Live Standings
                        </div>

                        <div className="space-y-3 flex-1 overflow-auto custom-scrollbar">
                            {participants.length === 0 && <p className="text-sm text-muted-foreground">Players will appear here...</p>}

                            {participants.sort((a, b) => b.score - a.score).map((p, i) => (
                                <div key={p.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/30">
                                    <div className={`font-mono font-bold w-6 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-500' : 'text-muted-foreground'
                                        }`}>
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">{p.full_name}</div>
                                        <div className="text-xs text-muted-foreground">{p.score} XP</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
