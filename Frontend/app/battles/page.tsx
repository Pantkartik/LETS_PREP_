'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap,
  Users,
  Clock,
  Play,
  Search,
  Code,
  LogIn,
} from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

// Keep existing mock data for History/Tournaments tabs if not fully implementing them yet
const myBattles = [
  { id: 1, opponent: 'CodeNinja23', problem: 'Merge Sorted Arrays', result: 'Won', time: '2:34', xpGained: 120, date: '2 hours ago' },
];

export default function BattlesPage() {
  const [activeBattles, setActiveBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchBattles();

    // Subscribe to changes in battles (e.g. new rooms, status changes)
    const channel = supabase
      .channel('public:battles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'battles' }, () => {
        fetchBattles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBattles = async () => {
    try {
      // Fetch OPEN battles (waiting for players)
      const { data, error } = await supabase
        .from('battles')
        .select(`
          *,
          profiles:created_by (full_name)
        `)
        .eq('status', 'WAITING') // Only show waiting rooms
        .eq('battle_type', 'PUBLIC') // Only show public rooms in the list
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveBattles(data || []);
    } catch (error) {
      console.error('Error fetching battles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode) {
      toast.error("Please enter a room code");
      return;
    }

    try {
      // Find battle by code
      const { data: battle, error } = await supabase
        .from('battles')
        .select('id, status')
        .eq('room_code', joinCode.toUpperCase())
        .single();

      if (error || !battle) {
        toast.error("Invalid room code");
        return;
      }

      if (battle.status !== 'WAITING') {
        toast.error("This battle has already started or ended");
        return;
      }

      joinBattle(battle.id);
    } catch (error) {
      console.error("Join error:", error);
      toast.error("Failed to join room");
    }
  };

  const joinBattle = async (battleId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to join");
        return;
      }

      // Check if already in
      const { data: existing } = await supabase
        .from('battle_participants')
        .select('id')
        .eq('battle_id', battleId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        router.push(`/battles/${battleId}`); // Redirect if already joined
        return;
      }

      // Join
      const { error } = await supabase
        .from('battle_participants')
        .insert([{
          battle_id: battleId,
          user_id: user.id
        }]);

      if (error) throw error;

      // Update participant count
      // await supabase.rpc('increment_battle_participants', { battle_id: battleId }); // Optional optimized way, or rely on realtime

      toast.success("Joined battle!");
      router.push(`/battles/${battleId}`); // Redirect to lobby/arena

    } catch (error: any) {
      console.error("Error joining:", error);
      toast.error("Failed to join battle: " + error.message);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="w-8 h-8 text-primary" />
              DSA Battle Arena
            </h1>
            <p className="text-muted-foreground">
              Compete in real-time battles and climb the ranks
            </p>
          </div>

          {/* Join by Code Section */}
          <Card className="p-6 bg-card/50 border-dashed border-2 border-border/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-accent" />
              Have a Room Code?
            </h3>
            <div className="flex gap-3 max-w-md">
              <Input
                placeholder="Enter 6-character code"
                className="font-mono uppercase tracking-widest text-lg"
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
              <Button onClick={handleJoinByCode} className="gap-2">
                <LogIn className="w-4 h-4" />
                Join Room
              </Button>
            </div>
          </Card>

          {/* Main Content */}
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/30">
              <TabsTrigger value="active">Active Rooms</TabsTrigger>
              <TabsTrigger value="history">My Battle History</TabsTrigger>
            </TabsList>

            {/* Active Battles Tab */}
            <TabsContent value="active" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search public battles..."
                    className="pl-10 bg-card/50 border-border/50"
                  />
                </div>
              </div>

              {loading ? (
                <div>Loading active battles...</div>
              ) : activeBattles.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No public battles active right now. Join by code or create one!</div>
              ) : (
                <div className="grid gap-4">
                  {activeBattles.map((battle) => (
                    <Card
                      key={battle.id}
                      className="border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg">{battle.title}</h3>
                            <Badge
                              className={
                                battle.difficulty === 'EASY'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : battle.difficulty === 'MEDIUM'
                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }
                            >
                              {battle.difficulty}
                            </Badge>
                            <Badge variant="outline" className="border-border/50">
                              <Users className="w-3 h-3 mr-1" />
                              {/* Show real current_players and max_players */}
                              {battle.current_players || 0} / {battle.max_players}
                            </Badge>
                            {battle.battle_type !== 'PUBLIC' && <Badge variant="secondary">PRIVATE</Badge>}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <span className="font-mono bg-muted px-1 rounded text-xs">{battle.room_code}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Waiting for players...
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs">Hosted by {(battle as any).profiles?.full_name || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                        {/* Join Button - Disable if full */}
                        <Button
                          className="bg-primary hover:bg-primary/90 gap-2"
                          onClick={() => joinBattle(battle.id)}
                          disabled={(battle.current_players || 0) >= battle.max_players}
                        >
                          <Play className="w-4 h-4" />
                          {(battle.current_players || 0) >= battle.max_players ? 'Full' : 'Join Battle'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Battle History Tab */}
            <TabsContent value="history" className="space-y-4">
              <div className="grid gap-4">
                {myBattles.map((battle) => (
                  <Card
                    key={battle.id}
                    className="border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold">{battle.problem}</h3>
                          <Badge
                            className={
                              battle.result === 'Won'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }
                          >
                            {battle.result}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div>vs {battle.opponent}</div>
                          <div>{battle.date}</div>
                        </div>
                      </div>
                      <Button variant="ghost">View Details</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
