'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Clock, Code as CodeIcon, Play, Trophy, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import Editor from '@monaco-editor/react';

// Types
interface Battle {
    id: string;
    title: string;
    status: 'WAITING' | 'LOCKED' | 'ACTIVE' | 'COMPLETED';
    difficulty: string;
    room_code: string;
    created_by: string;
    problem_id?: string;
    actual_start_time?: string;
    max_players: number;
}

interface Participant {
    user_id: string;
    full_name: string;
    username: string;
    status: string;
    score: number;
}

interface Problem {
    id: string;
    title: string;
    description: string;
    sample_input: string;
    sample_output: string;
    starter_code: any;
}

export default function StudentBattleRoom() {
    const { id } = useParams();
    const router = useRouter();
    const supabase = createClient();

    // State
    const [battle, setBattle] = useState<Battle | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [code, setCode] = useState('// Waiting for problem...');
    const [submitted, setSubmitted] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // 1. Get User
        supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));

        // 2. Fetch Initial Data
        fetchBattleData();

        // 3. Realtime Subscription
        const channel = supabase
            .channel(`student_room:${id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'battles', filter: `id=eq.${id}` }, (payload: any) => {
                handleBattleUpdate(payload.new);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'battle_participants', filter: `battle_id=eq.${id}` }, () => {
                fetchParticipants();
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

            // If already active, fetch problem immediately
            if (data.status === 'ACTIVE' && data.problem_id) {
                fetchProblem(data.problem_id);
            }

            fetchParticipants();
        } catch (error) {
            console.error(error);
            router.push('/battles');
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipants = async () => {
        const { data } = await supabase.from('battle_participants').select(`
      user_id, status, score,
      profiles:user_id (full_name, username)
    `).eq('battle_id', id);

        if (data) {
            setParticipants(data.map((p: any) => ({
                user_id: p.user_id,
                status: p.status,
                score: p.score || 0,
                full_name: p.profiles?.full_name || 'User',
                username: p.profiles?.username || 'user'
            })));
        }
    };

    const fetchProblem = async (problemId: string) => {
        const { data } = await supabase.from('problems').select('*').eq('id', problemId).single();
        if (data) {
            setProblem(data);
            const starter = data.starter_code?.javascript || '// Write your solution here';
            setCode(starter);
        }
    };

    const handleBattleUpdate = (updatedBattle: Battle) => {
        setBattle(updatedBattle);

        // Status Changed to ACTIVE -> Start Countdown
        if (updatedBattle.status === 'ACTIVE' && updatedBattle.problem_id) {
            startCountdown();
            fetchProblem(updatedBattle.problem_id);
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

    const handleSubmit = async () => {
        if (!battle || !userId) return;
        setSubmitted(true);

        // Mock Submission Logic
        // In a real app, send to Execution Service
        toast.info("Submitting code...");

        await new Promise(r => setTimeout(r, 1500)); // Fake delay

        // Random Score for Demo
        const score = Math.floor(Math.random() * 100) + 10;

        await supabase.from('battle_participants')
            .update({
                status: 'COMPLETED',
                submission_code: code,
                score: score
            })
            .eq('battle_id', battle.id)
            .eq('user_id', userId);

        toast.success(`Solution Submitted! Score: ${score}`);
    };

    if (loading) return <div className="p-10 text-center">Loading Battle Arena...</div>;
    if (!battle) return <div className="p-10 text-center">Battle not found</div>;

    // --- RENDER STATES ---

    // 1. WAITING ROOM
    if (battle.status === 'WAITING' || battle.status === 'LOCKED') {
        return (
            <div className="flex h-screen bg-background text-foreground">
                <DashboardSidebar />
                <main className="flex-1 p-8 flex flex-col items-center justify-center bg-muted/5">
                    <Card className="max-w-2xl w-full p-8 text-center space-y-6">
                        <div className="animate-pulse">
                            <Clock className="w-16 h-16 mx-auto text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{battle.title}</h1>
                            <p className="text-muted-foreground">Waiting for host to start...</p>
                            {battle.status === 'LOCKED' && <Badge variant="destructive" className="mt-2">LOCKED</Badge>}
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-8">
                            {participants.map(p => (
                                <div key={p.user_id} className="flex flex-col items-center gap-2">
                                    <Avatar className="w-12 h-12 border-2 border-border">
                                        <AvatarFallback>{p.full_name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs truncate w-full">{p.full_name}</span>
                                </div>
                            ))}
                        </div>

                        <p className="text-sm text-muted-foreground mt-4">
                            {participants.length} / {battle.max_players} Players Ready
                        </p>
                    </Card>
                </main>
            </div>
        );
    }

    // 2. COUNTDOWN
    if (countdown !== null) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-black text-white text-[150px] font-bold z-50 fixed inset-0">
                {countdown}
            </div>
        );
    }

    // 3. ACTIVE BATTLE (IDE)
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Left: Problem */}
            <div className="w-1/3 border-r border-border p-6 overflow-auto custom-scrollbar">
                {problem ? (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{problem.title}</h2>
                            <Badge>{battle.difficulty}</Badge>
                        </div>
                        <div className="prose dark:prose-invert max-w-none">
                            <p>{problem.description}</p>
                        </div>

                        <Card className="p-4 bg-muted/30">
                            <h3 className="font-semibold mb-2 text-sm">Sample Input</h3>
                            <code className="text-xs font-mono">{problem.sample_input}</code>
                        </Card>
                        <Card className="p-4 bg-muted/30">
                            <h3 className="font-semibold mb-2 text-sm">Sample Output</h3>
                            <code className="text-xs font-mono">{problem.sample_output}</code>
                        </Card>
                    </div>
                ) : (
                    <div>Loading Problem...</div>
                )}
            </div>

            {/* Center: Editor */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-[#1e1e1e]">
                    <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        theme="vs-dark"
                        value={code}
                        onChange={(val) => setCode(val || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            padding: { top: 20 }
                        }}
                    />
                </div>
                {/* Action Bar */}
                <div className="border-t border-border p-4 bg-card flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        Javascript
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm">Run Code</Button>
                        <Button onClick={handleSubmit} disabled={submitted} size="sm" className="bg-green-600 hover:bg-green-700">
                            {submitted ? 'Submitted' : 'Submit Solution'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right: Leaderboard (Mini) */}
            <div className="w-64 border-l border-border bg-card/50 flex flex-col">
                <div className="p-4 border-b border-border font-bold flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Live Standings
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-2">
                    {participants
                        .sort((a, b) => b.score - a.score)
                        .map((p, i) => (
                            <div key={p.user_id} className={`flex items-center justify-between p-2 rounded text-sm ${p.user_id === userId ? 'bg-primary/10 border border-primary/30' : 'bg-card'}`}>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-muted-foreground w-4">{i + 1}</span>
                                    <span className="truncate max-w-[100px]">{p.full_name}</span>
                                </div>
                                <span className="font-bold">{p.score}</span>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
