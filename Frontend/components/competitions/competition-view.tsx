'use client';

import { useState, useEffect, useMemo } from 'react';
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
    CheckCircle2,
    Lock,
    Unlock,
    UserCheck,
    UserX,
    ShieldCheck,
    Sword,
    ChevronRight,
    Flame,
    Ban,
    Eye,
    Activity,
    Terminal,
    Code as CodeIcon,
    AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';
import { 
    approveParticipant, 
    rejectParticipant, 
    lockCompetitionEntries, 
    startQuizSession,
    requestToJoinCompetition,
    banParticipant
} from '@/lib/actions/teacher-competitions';
import { toast } from 'sonner';

interface CompetitionViewProps {
    competition: any;
    isTeacher: boolean;
    userId: string;
}

export function CompetitionView({ competition: initialCompetition, isTeacher, userId }: CompetitionViewProps) {
    const [competition, setCompetition] = useState(initialCompetition);
    const [participants, setParticipants] = useState(initialCompetition.participants || []);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [selectedCode, setSelectedCode] = useState<any>(null);
    const [activeView, setActiveView] = useState<'LEADERBOARD' | 'SUBMISSIONS' | 'SUPREME'>('LEADERBOARD');
    const supabase = useMemo(() => createClient(), []);

    // Real-time updates
    useEffect(() => {
        fetchSubmissions();

        const competitionChannel = supabase
            .channel(`competition-details-${competition.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'competitions', filter: `id=eq.${competition.id}` }, (payload) => {
                setCompetition(prev => ({ ...prev, ...payload.new }));
            })
            .subscribe();

        const participantsChannel = supabase
            .channel(`competition-participants-${competition.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'competition_participants', filter: `competition_id=eq.${competition.id}` }, async () => {
                const { data } = await supabase
                    .from('competition_participants')
                    .select('*, profile:profiles(id, username, full_name, avatar_url)')
                    .eq('competition_id', competition.id)
                    .order('score', { ascending: false });
                if (data) setParticipants(data);
            })
            .subscribe();

        const submissionsChannel = supabase
            .channel(`competition-submissions-${competition.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'competition_submissions', filter: `competition_id=eq.${competition.id}` }, (payload) => {
                setSubmissions(prev => [payload.new, ...prev.slice(0, 49)]);
                toast(`${payload.new.status === 'ACCEPTED' ? '✅' : '❌'} New submission received!`, {
                    description: `Problem ID: ${payload.new.problem_id}`
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(competitionChannel);
            supabase.removeChannel(participantsChannel);
            supabase.removeChannel(submissionsChannel);
        };
    }, [competition.id]);

    const fetchSubmissions = async () => {
        const { data } = await supabase
            .from('competition_submissions')
            .select('*')
            .eq('competition_id', competition.id)
            .order('created_at', { ascending: false })
            .limit(50);
        if (data) setSubmissions(data);
    };

    const handleApprove = async (pUserId: string) => {
        const res = await approveParticipant(competition.id, pUserId);
        if (res.success) toast.success('Approved');
    };

    const handleReject = async (pUserId: string) => {
        const res = await rejectParticipant(competition.id, pUserId);
        if (res.success) toast.success('Removed from arena');
    };

    const handleBan = async (pUserId: string) => {
        if (!confirm('Are you sure you want to PERMANENTLY BAN this student from this arena?')) return;
        const res = await banParticipant(competition.id, pUserId);
        if (res.success) toast.error('STUDENT PERMANENTLY BANNED');
    };

    const handleLock = async () => {
        const res = await lockCompetitionEntries(competition.id);
        if (res.success) toast.success('Entries Locked');
    };

    const handleStartSession = async () => {
        const res = await startQuizSession(competition.id);
        if (res.success) toast.success('Session Live!');
    };

    const handleJoinRequest = async () => {
        const res = await requestToJoinCompetition(competition.id);
        if (res.success) toast.success('Request sent');
    };

    const acceptedParticipants = participants.filter(p => p.status === 'ACCEPTED' || (!p.status && p.status !== 'BANNED' && p.status !== 'PENDING'));
    const pendingParticipants = participants.filter(p => p.status === 'PENDING');
    const bannedParticipants = participants.filter(p => p.status === 'BANNED');
    const userParticipant = participants.find(p => p.user_id === userId);

    const isBattle = competition.title?.startsWith('[BATTLE]');
    const themeColor = isBattle ? 'text-red-500' : 'text-primary';
    const bgGradient = isBattle 
        ? 'from-red-950/20 via-slate-950 to-slate-950' 
        : 'from-purple-950/20 via-slate-950 to-slate-950';

    if (userParticipant?.status === 'BANNED') {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white p-8">
                <Card className="max-w-md p-10 bg-red-950/20 border-red-500/30 text-center space-y-6">
                    <AlertTriangle className="w-20 h-20 text-red-500 mx-auto animate-bounce" />
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-red-500">Access Denied</h1>
                    <p className="text-slate-400 font-bold">You have been permanently banned from this competition arena by the Supreme Authority.</p>
                    <Link href="/competitions">
                        <Button variant="outline" className="border-white/10 hover:bg-white/5">Exit Arena</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className={`flex min-h-screen bg-gradient-to-br ${bgGradient} text-white`}>
            <DashboardSidebar />

            <div className="flex-1 ml-64 p-8 overflow-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div className="space-y-4">
                        <Link href="/competitions">
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white group">
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                            </Button>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${isBattle ? 'shadow-[0_0_20px_rgba(239,68,68,0.2)]' : ''}`}>
                                {isBattle ? <Sword className="w-8 h-8 text-red-500" /> : <Zap className="w-8 h-8 text-primary" />}
                            </div>
                            <div>
                                <h1 className="text-5xl font-black tracking-tighter uppercase italic">
                                    {competition.title?.replace(/^\[(QUIZ|BATTLE)\]\s*/, '')}
                                </h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <Badge variant="outline" className={isBattle ? 'border-red-500/50 text-red-400 bg-red-500/5' : 'border-primary/50 text-primary bg-primary/5'}>
                                        {isBattle ? 'BATTLE ARENA' : 'CLASSROOM QUIZ'}
                                    </Badge>
                                    <span className="text-slate-500 text-sm font-bold uppercase">Code: <span className="text-white font-mono">{competition.invite_code}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                        <Badge className={`px-4 py-1.5 rounded-full text-xs font-black ${
                            competition.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 animate-pulse' : 
                            competition.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                            {competition.status}
                        </Badge>
                        {competition.is_entry_locked && (
                            <div className="flex items-center gap-2 text-xs font-bold text-red-400 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                                <Lock className="w-3 h-3" /> ENTRIES LOCKED
                            </div>
                        )}
                    </div>
                </div>

                {/* Supreme Tab Navigation (Teacher Only) */}
                {isTeacher && (
                    <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5 w-fit mb-8">
                        <button onClick={() => setActiveView('LEADERBOARD')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeView === 'LEADERBOARD' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>LEADERBOARD</button>
                        <button onClick={() => setActiveView('SUBMISSIONS')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeView === 'SUBMISSIONS' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>LIVE SUBMISSIONS</button>
                        <button onClick={() => setActiveView('SUPREME')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeView === 'SUPREME' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>SUPREME COMMAND</button>
                    </div>
                )}

                {/* Teacher Invigilator Dashboard (Shown in Supreme/Submissions) */}
                {isTeacher && activeView !== 'LEADERBOARD' && (
                    <Card className={`p-8 mb-10 border-2 relative overflow-hidden backdrop-blur-3xl bg-black/40 ${
                        isBattle ? 'border-red-500/20' : 'border-primary/20'
                    }`}>
                        <div className="relative z-10 flex justify-between items-center">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black italic uppercase flex items-center gap-3">
                                    <ShieldCheck className={themeColor} /> SUPREME CONTROL PANEL
                                </h2>
                                <p className="text-slate-400 text-sm font-medium">Global oversight and moderation authority.</p>
                            </div>
                            <div className="flex gap-4">
                                <Button onClick={handleLock} disabled={competition.is_entry_locked} variant="outline" className="border-white/10 hover:bg-white/5 font-black uppercase text-xs">
                                    <Lock className="w-4 h-4 mr-2" /> Lock Entries
                                </Button>
                                <Button onClick={handleStartSession} disabled={competition.status === 'ACTIVE' || !competition.is_entry_locked} className={`font-black px-8 ${isBattle ? 'bg-red-600 shadow-red-600/20' : 'bg-primary shadow-primary/20'} shadow-lg`}>
                                    <Play className="w-4 h-4 mr-2" /> INITIATE SESSION
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Active View Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {activeView === 'LEADERBOARD' && (
                            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl p-8 min-h-[600px]">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-3xl font-black italic flex items-center gap-4">
                                        <Trophy className="text-yellow-500 w-8 h-8" /> 
                                        {isBattle ? 'WARRIOR RANKINGS' : 'CLASSROOM RANKINGS'}
                                    </h3>
                                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 animate-pulse">LIVE UPDATES</Badge>
                                </div>

                                <div className="space-y-3">
                                    {acceptedParticipants
                                        .sort((a, b) => (b.score || 0) - (a.score || 0))
                                        .map((p, idx) => (
                                            <div key={p.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                                p.user_id === userId ? 'bg-primary/10 border-primary/30' : 'bg-black/20 border-white/5'
                                            }`}>
                                                <div className="flex items-center gap-6">
                                                    <span className={`w-8 text-center font-black text-2xl ${idx < 3 ? 'text-yellow-500 italic' : 'text-slate-700'}`}>#{idx + 1}</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center font-black text-slate-500 uppercase">
                                                            {p.profile?.username?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-white text-lg">{p.profile?.full_name || p.profile?.username}</p>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className="bg-white/5 text-slate-500 border-none text-[8px] font-black">LVL {(p.score / 100).toFixed(0)}</Badge>
                                                                {idx === 0 && <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-1"><Medal className="w-2 h-2" /> Champion</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-10 items-center">
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black text-green-400">{p.problems_solved || 0}</p>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SOLVED</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-2xl font-black ${isBattle ? 'text-red-500' : 'text-primary'}`}>{p.score || 0}</p>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">XP</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </Card>
                        )}

                        {activeView === 'SUBMISSIONS' && isTeacher && (
                            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl p-8 min-h-[600px]">
                                <h3 className="text-2xl font-black italic mb-8 flex items-center gap-3">
                                    <Terminal className="text-primary" /> LIVE SUBMISSION TICKER
                                </h3>
                                <div className="space-y-3">
                                    {submissions.map((sub, idx) => (
                                        <div key={sub.id} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ${sub.status === 'ACCEPTED' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                                                <div>
                                                    <p className="text-xs font-bold text-white uppercase tracking-tighter">
                                                        Submission #{submissions.length - idx}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                                                        Problem ID: <span className="text-slate-300">{sub.problem_id.split('-')[0]}</span> • {sub.language || 'Code'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge className={sub.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}>
                                                    {sub.status}
                                                </Badge>
                                                <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black uppercase text-slate-500 hover:text-white" onClick={() => setSelectedCode(sub)}>
                                                    <Eye className="w-3 h-3 mr-2" /> View Code
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {submissions.length === 0 && (
                                        <div className="py-20 text-center text-slate-600 font-bold uppercase text-xs">No submissions yet.</div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {activeView === 'SUPREME' && isTeacher && (
                            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl p-8 min-h-[600px]">
                                <h3 className="text-2xl font-black italic mb-8 flex items-center gap-3">
                                    <ShieldCheck className="text-red-500" /> SUPREME MODERATION
                                </h3>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Combatants ({acceptedParticipants.length})</p>
                                        {acceptedParticipants.map(p => (
                                            <div key={p.id} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-black text-slate-500">
                                                        {p.profile?.username?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{p.profile?.username}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold">{p.user_id}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost" className="text-yellow-500 hover:bg-yellow-500/10 font-bold" onClick={() => handleReject(p.user_id)}>
                                                        <UserX className="w-4 h-4 mr-2" /> KICK
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10 font-bold" onClick={() => handleBan(p.user_id)}>
                                                        <Ban className="w-4 h-4 mr-2" /> PERMANENT BAN
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {pendingParticipants.length > 0 && (
                                        <div className="space-y-4 mt-8">
                                            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Awaiting Entrance ({pendingParticipants.length})</p>
                                            {pendingParticipants.map(p => (
                                                <div key={p.id} className="flex items-center justify-between p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center font-black text-yellow-500">
                                                            {p.profile?.username?.[0]}
                                                        </div>
                                                        <p className="font-bold text-white">{p.profile?.username}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 font-black" onClick={() => handleApprove(p.user_id)}>APPROVE</Button>
                                                        <Button size="sm" variant="ghost" className="text-red-500 font-black" onClick={() => handleReject(p.user_id)}>DENY</Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {bannedParticipants.length > 0 && (
                                        <div className="space-y-4 mt-8 opacity-50">
                                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Banned Entities ({bannedParticipants.length})</p>
                                            {bannedParticipants.map(p => (
                                                <div key={p.id} className="flex items-center justify-between p-4 bg-red-950/10 rounded-xl border border-red-500/20">
                                                    <p className="font-bold text-red-500">{p.profile?.username}</p>
                                                    <Badge className="bg-red-500 text-white font-black">BANNED</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right: Stats & Directives */}
                    <div className="space-y-6">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 gap-4">
                            <Card className="p-6 bg-slate-900/50 border-white/5 backdrop-blur-xl">
                                <Activity className={`${themeColor} mb-3`} />
                                <p className="text-4xl font-black text-white italic">{submissions.length}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Submissions</p>
                            </Card>
                            <Card className="p-6 bg-slate-900/50 border-white/5 backdrop-blur-xl">
                                <Users className="text-blue-500 mb-3" />
                                <p className="text-4xl font-black text-white italic">{acceptedParticipants.length}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Combatants</p>
                            </Card>
                        </div>

                        {/* Student Actions */}
                        {!isTeacher && (
                            <Card className="p-8 bg-slate-900/50 border-white/5 backdrop-blur-xl text-center relative overflow-hidden group">
                                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity ${isBattle ? 'from-red-500' : 'from-primary'}`} />
                                
                                {!userParticipant ? (
                                    <div className="space-y-6">
                                        <p className="text-slate-400 font-medium">This arena requires supreme approval for entrance.</p>
                                        <Button 
                                            onClick={handleJoinRequest} 
                                            disabled={competition.is_entry_locked}
                                            className={`w-full py-8 text-xl font-black uppercase tracking-tighter italic ${
                                                isBattle ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'
                                            } shadow-lg transition-all hover:scale-[1.02]`}
                                        >
                                            Request Entrance
                                        </Button>
                                    </div>
                                ) : userParticipant.status === 'PENDING' ? (
                                    <div className="space-y-6 py-4">
                                        <div className="w-20 h-20 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                            <Clock className="text-yellow-500 w-10 h-10" />
                                        </div>
                                        <p className="text-xl font-black text-white italic uppercase tracking-tighter">Entrance Pending</p>
                                        <p className="text-xs text-slate-500 font-medium mt-2">Awaiting decision from Supreme Command.</p>
                                    </div>
                                ) : userParticipant.status === 'ACCEPTED' && competition.status !== 'ACTIVE' ? (
                                    <div className="space-y-6 py-4 text-center">
                                        <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                            <UserCheck className="text-green-500 w-10 h-10" />
                                        </div>
                                        <p className="text-2xl font-black text-green-400 italic uppercase">Arena Ready</p>
                                        <p className="text-xs text-slate-500 font-medium">Stand by for initiation signal.</p>
                                    </div>
                                ) : userParticipant.status === 'ACCEPTED' && competition.status === 'ACTIVE' ? (
                                    <Link href={`/competitions/${competition.id}/solve`}>
                                        <Button className={`w-full py-10 text-3xl font-black italic uppercase tracking-tighter shadow-2xl transition-all hover:scale-105 ${
                                            isBattle ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-primary to-blue-600'
                                        }`}>
                                            <Play className="w-8 h-8 mr-3" /> Start Combat
                                        </Button>
                                    </Link>
                                ) : null}
                            </Card>
                        )}

                        {/* Directives */}
                        <Card className="p-8 bg-slate-900/50 border-white/5 backdrop-blur-xl">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Terminal className="w-3 h-3 text-primary" /> System Directives
                            </h4>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${themeColor}`} />
                                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed">Supreme Command reserves the right to terminate any participant session without warning.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${themeColor}`} />
                                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed">Submission integrity is monitored in real-time by the neural mesh.</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Code Viewer Modal */}
            {selectedCode && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <Card className="w-full max-w-4xl max-h-[80vh] bg-slate-900 border-white/10 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Submission Insight</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase mt-1">
                                    Language: <span className="text-primary">{selectedCode.language}</span> • Status: <span className={selectedCode.status === 'ACCEPTED' ? 'text-green-500' : 'text-red-500'}>{selectedCode.status}</span>
                                </p>
                            </div>
                            <Button variant="ghost" onClick={() => setSelectedCode(null)} className="text-slate-500 hover:text-white">
                                <UserX className="w-6 h-6 rotate-45" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto p-8 font-mono text-sm bg-black/60">
                            <pre className="text-blue-300">
                                {selectedCode.code}
                            </pre>
                        </div>
                        <div className="p-4 border-t border-white/5 bg-black/40 text-right">
                            <Button variant="outline" onClick={() => setSelectedCode(null)} className="font-bold border-white/10">CLOSE MONITOR</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
