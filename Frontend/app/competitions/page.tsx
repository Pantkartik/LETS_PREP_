'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { createClient } from '@/lib/supabase-client';
import { Code, Trophy, Users, Clock, Share2, LogIn, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Tournament {
  id: string;
  title: string;
  description: string;
  status: string;
  start_time: string;
  end_time: string;
  current_participants: number;
  max_participants: number;
  created_by: string;
  is_joined?: boolean;
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // Fetch tournaments
      const { data: tournaments, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          profiles:created_by (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check which ones the user has joined
      let joinedIds = new Set();
      if (user) {
        const { data: participation } = await supabase
          .from('tournament_participants')
          .select('tournament_id')
          .eq('user_id', user.id);

        if (participation) {
          participation.forEach(p => joinedIds.add(p.tournament_id));
        }
      }

      const formattedData = tournaments?.map(t => ({
        ...t,
        is_joined: joinedIds.has(t.id),
        creator_name: (t as any).profiles?.full_name || 'Unknown'
      })) || [];

      setCompetitions(formattedData);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (tournamentId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert([{ tournament_id: tournamentId, user_id: userId }]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error('You have already joined this competition');
        } else {
          throw error;
        }
      } else {
        toast.success('Successfully joined competition!');
        // Update local state and current_participants count
        setCompetitions(competitions.map(c =>
          c.id === tournamentId
            ? { ...c, is_joined: true, current_participants: (c.current_participants || 0) + 1 }
            : c
        ));

        // Also update backend count (optional trigger usually handles this, but for now client side update is visual only)
      }
    } catch (error: any) {
      console.error('Error joining competition:', error);
      toast.error('Failed to join: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400';
      case 'COMPLETED':
        return 'bg-muted text-gray-400';
      case 'UPCOMING':
        return 'bg-blue-500/20 text-blue-400';
      default: // REGISTRATION etc
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <DashboardSidebar />

      <main className="flex-1 overflow-auto bg-muted/5 relative">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Trophy className="w-8 h-8 text-accent" />
                Active Competitions
              </h1>
              <p className="text-muted-foreground">
                Join public competitions and battle for the leaderboard
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/50 bg-card/50 p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Active Events</p>
                <p className="text-3xl font-bold">{competitions.filter((c) => c.status === 'ACTIVE' || c.status === 'REGISTRATION' || c.status === 'UPCOMING').length}</p>
              </div>
            </Card>
            <Card className="border-border/50 bg-card/50 p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Participants</p>
                <p className="text-3xl font-bold">{competitions.reduce((sum, c) => sum + (c.current_participants || 0), 0)}</p>
              </div>
            </Card>
            <Card className="border-border/50 bg-card/50 p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Your Enrollments</p>
                <p className="text-3xl font-bold">{competitions.filter((c) => c.is_joined).length}</p>
              </div>
            </Card>
          </div>

          {/* List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading competitions...</div>
            ) : competitions.length === 0 ? (
              <Card className="border-border/50 bg-card/50 p-12 text-center">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No active competitions</h3>
                <p className="text-muted-foreground">
                  Check back later for new tournaments.
                </p>
              </Card>
            ) : (
              competitions.map((competition) => (
                <Card key={competition.id} className="border-border/50 bg-card/50 p-6 hover:border-primary/50 transition-all group">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                    <div className="md:col-span-2 space-y-3">
                      <div className="flex items-start justify-between md:justify-start md:gap-4">
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{competition.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(competition.status)}`}>
                          {competition.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">{competition.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{(competition as any).creator_name}</span>
                        <span>•</span>
                        <span>Created {new Date((competition as any).created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{competition.current_participants || 0} / {competition.max_participants} enrolled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <span>Starts {new Date(competition.start_time).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 md:justify-end items-center h-full">
                      {competition.is_joined ? (
                        <Button variant="secondary" className="gap-2 bg-green-500/10 text-green-500 hover:bg-green-500/20" disabled>
                          <CheckCircle className="w-4 h-4" />
                          Joined
                        </Button>
                      ) : (
                        <Button onClick={() => handleJoin(competition.id)} className="gap-2">
                          <LogIn className="w-4 h-4" />
                          Join Room
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
