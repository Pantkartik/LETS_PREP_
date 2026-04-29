'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { createClient } from '@/lib/supabase-client';
import { 
    Code, 
    Trophy, 
    Users, 
    Clock, 
    Share2, 
    LogIn, 
    CheckCircle, 
    Zap, 
    Sword, 
    Search,
    ShieldCheck,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { requestToJoinCompetition } from '@/lib/actions/teacher-competitions';

interface Competition {
  id: string;
  title: string;
  description: string;
  status: string;
  invite_code: string;
  is_quiz_mode: boolean;
  is_battle_test: boolean;
  max_participants: number;
  participants_count: number;
  is_entry_locked: boolean;
  user_participation_status?: string | null;
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    fetchCompetitions();
    
    // Subscribe to real-time updates for competitions
    const channel = supabase
      .channel('public-competitions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competitions' }, () => {
        fetchCompetitions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCompetitions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      if (user) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
          setUserRole(profile?.role || 'STUDENT');
      }

      // Fetch competitions
      const { data: comps, error } = await supabase
        .from('competitions')
        .select(`
          *,
          participants:competition_participants(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get current user's participation status for each
      let userStatuses: Record<string, string> = {};
      if (user) {
        const { data: participation } = await supabase
          .from('competition_participants')
          .select('competition_id, status')
          .eq('user_id', user.id);

        participation?.forEach(p => {
          userStatuses[p.competition_id] = p.status;
        });
      }

      const formattedData = (comps || []).map(c => ({
        ...c,
        participants_count: (c.participants as any)?.[0]?.count || 0,
        user_participation_status: userStatuses[c.id] || null
      }));

      setCompetitions(formattedData);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (id: string) => {
    if (!userId) {
        toast.error('Please login first');
        return;
    }
    const res = await requestToJoinCompetition(id);
    if (res.success) {
        toast.success('Entrance request sent to teacher!');
        fetchCompetitions();
    } else {
        toast.error(res.error || 'Failed to send request');
    }
  };

  const filteredCompetitions = competitions.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.invite_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-950 via-slate-950 to-purple-950/10 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tighter uppercase italic flex items-center gap-4">
                <Trophy className="w-12 h-12 text-primary" />
                Battle Grounds
              </h1>
              <p className="text-slate-400 font-medium">
                Enter competitive arenas, solve challenges, and climb the global ranks.
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Search arenas..."
                        className="pl-11 bg-slate-900/50 border-white/10 rounded-2xl h-12 focus:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {userRole === 'TEACHER' && (
                    <Link href="/teacher/competitions">
                        <Button className="h-12 px-6 bg-primary hover:bg-primary/90 font-black shadow-lg shadow-primary/20">
                            <Plus className="w-5 h-5 mr-2" /> TEACHER HUB
                        </Button>
                    </Link>
                )}
            </div>
          </div>

          {/* Featured Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="p-8 bg-slate-900/40 border-white/5 backdrop-blur-xl group hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <Zap className="w-8 h-8 text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest px-2 py-1 bg-primary/10 rounded">Live Now</span>
                </div>
                <p className="text-4xl font-black text-white">{competitions.filter(c => c.status === 'ACTIVE').length}</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Active Arenas</p>
             </Card>
             <Card className="p-8 bg-slate-900/40 border-white/5 backdrop-blur-xl group hover:border-red-500/20 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <Sword className="w-8 h-8 text-red-500" />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest px-2 py-1 bg-red-500/10 rounded">High Stakes</span>
                </div>
                <p className="text-4xl font-black text-white">{competitions.filter(c => c.is_battle_test).length}</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Battle Tests</p>
             </Card>
             <Card className="p-8 bg-slate-900/40 border-white/5 backdrop-blur-xl group hover:border-blue-500/20 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-4xl font-black text-white">{competitions.reduce((acc, c) => acc + c.participants_count, 0)}</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Total Combatants</p>
             </Card>
          </div>

          {/* Competitions List */}
          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-bold uppercase tracking-widest text-xs">Calibrating Arenas...</p>
              </div>
            ) : filteredCompetitions.length === 0 ? (
              <Card className="border-dashed border-2 border-white/5 bg-slate-900/20 p-20 text-center">
                <Trophy className="w-16 h-16 mx-auto text-slate-700 mb-6" />
                <h3 className="text-2xl font-black text-white uppercase italic">No Arenas Found</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                  Try adjusting your search or wait for a teacher to initiate a new session.
                </p>
              </Card>
            ) : (
              filteredCompetitions.map((comp) => (
                <Card key={comp.id} className="relative bg-slate-900/40 border-white/5 hover:border-primary/30 transition-all duration-300 group overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    {comp.is_battle_test ? <Sword className="w-32 h-32 text-red-500" /> : <Zap className="w-32 h-32 text-primary" />}
                  </div>

                  <div className="p-8 relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors uppercase italic">{comp.title}</h3>
                        <Badge className={
                            comp.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            comp.status === 'COMPLETED' ? 'bg-slate-800 text-slate-500' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }>
                          {comp.status}
                        </Badge>
                        {comp.is_battle_test && (
                             <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                <Sword className="w-3 h-3 mr-1" /> BATTLE
                             </Badge>
                        )}
                      </div>
                      
                      <p className="text-slate-400 font-medium line-clamp-2 max-w-2xl">{comp.description || "Enter this arena to prove your coding skills."}</p>
                      
                      <div className="flex flex-wrap gap-6 items-center">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <Users className="w-4 h-4 text-primary" />
                            <span>{comp.participants_count} / {comp.max_participants} Participants</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <Code className="w-4 h-4 text-primary" />
                            <span>Invite Code: <span className="text-white font-mono">{comp.invite_code}</span></span>
                        </div>
                        {comp.is_entry_locked && (
                             <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest">
                                <Lock className="w-4 h-4" />
                                <span>Entries Locked</span>
                             </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 w-full md:w-64">
                        {comp.creator_id === userId ? (
                             <Link href={`/competitions/${comp.id}`}>
                                <Button className="w-full py-8 text-lg font-black uppercase italic tracking-tighter bg-slate-100 text-black hover:bg-white shadow-xl transition-all hover:scale-105">
                                    Manage Arena
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                             </Link>
                        ) : comp.user_participation_status === 'ACCEPTED' ? (
                            <Link href={`/competitions/${comp.id}`}>
                                <Button className={`w-full py-8 text-lg font-black uppercase italic tracking-tighter shadow-xl transition-all hover:scale-105 ${
                                    comp.status === 'ACTIVE' 
                                        ? 'bg-gradient-to-r from-primary to-blue-600' 
                                        : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                }`}>
                                    {comp.status === 'ACTIVE' ? 'Enter Arena' : 'You are Joined'}
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        ) : comp.user_participation_status === 'PENDING' ? (
                            <Button disabled className="w-full py-8 text-lg font-black uppercase italic bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse">
                                <Clock className="w-5 h-5 mr-2" />
                                Request Sent
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => handleJoinRequest(comp.id)}
                                disabled={comp.is_entry_locked || comp.status === 'COMPLETED'}
                                className={`w-full py-8 text-lg font-black uppercase italic tracking-tighter shadow-xl transition-all hover:scale-105 ${
                                    comp.is_battle_test 
                                        ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' 
                                        : 'bg-slate-100 text-black hover:bg-white'
                                }`}
                            >
                                <LogIn className="w-5 h-5 mr-2" />
                                Request Entry
                            </Button>
                        )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest flex items-center border ${className}`}>
            {children}
        </span>
    )
}
