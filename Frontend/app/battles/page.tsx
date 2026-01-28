'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap,
  Plus,
  Users,
  Clock,
  Trophy,
  Lock,
  Globe,
  Play,
  Search,
} from 'lucide-react';

const activeBattles = [
  {
    id: 1,
    name: 'Two Sum Challenge',
    difficulty: 'Easy',
    type: '1v1',
    players: 1245,
    prize: '100 XP',
    status: 'Live',
  },
  {
    id: 2,
    name: 'Binary Tree Max Path',
    difficulty: 'Hard',
    type: '1v1',
    players: 342,
    prize: '250 XP',
    status: 'Live',
  },
  {
    id: 3,
    name: 'LeetCode Weekly #342',
    difficulty: 'Medium',
    type: '1v1',
    players: 5821,
    prize: '150 XP',
    status: 'Live',
  },
  {
    id: 4,
    name: 'Team Battle: Graph',
    difficulty: 'Hard',
    type: 'Team',
    players: 284,
    prize: '300 XP',
    status: 'Live',
  },
];

const tournaments = [
  {
    id: 1,
    name: 'Winter Championship 2024',
    startDate: 'Jan 28, 2024',
    endDate: 'Feb 4, 2024',
    participants: 1240,
    prize: '$5,000',
    status: 'Registration Open',
  },
  {
    id: 2,
    name: 'Weekly Tournament #52',
    startDate: 'Today 6:00 PM',
    endDate: 'Tomorrow 6:00 PM',
    participants: 342,
    prize: '$500',
    status: 'Starting Soon',
  },
];

const myBattles = [
  {
    id: 1,
    opponent: 'CodeNinja23',
    problem: 'Merge Sorted Arrays',
    result: 'Won',
    time: '2:34',
    xpGained: 120,
    date: '2 hours ago',
  },
  {
    id: 2,
    opponent: 'AlgoMaster',
    problem: 'LRU Cache',
    result: 'Lost',
    time: '5:12',
    xpGained: 30,
    date: '5 hours ago',
  },
  {
    id: 3,
    opponent: 'ByteForce',
    problem: 'Median of Two Arrays',
    result: 'Won',
    time: '3:45',
    xpGained: 150,
    date: '1 day ago',
  },
];

export default function BattlesPage() {
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Play className="w-4 h-4" />
              Start 1v1 Battle
            </Button>
            <Button variant="outline" className="border-border/50 gap-2 bg-transparent">
              <Users className="w-4 h-4" />
              Create Team Battle
            </Button>
            <Button variant="outline" className="border-border/50 gap-2 bg-transparent">
              <Plus className="w-4 h-4" />
              Create Room
            </Button>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/30">
              <TabsTrigger value="active">Active Battles</TabsTrigger>
              <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
              <TabsTrigger value="history">My Battle History</TabsTrigger>
            </TabsList>

            {/* Active Battles Tab */}
            <TabsContent value="active" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search battles..."
                    className="pl-10 bg-card/50 border-border/50"
                  />
                </div>
              </div>

              <div className="grid gap-4">
                {activeBattles.map((battle) => (
                  <Card
                    key={battle.id}
                    className="border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg">{battle.name}</h3>
                          <Badge
                            className={
                              battle.difficulty === 'Easy'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : battle.difficulty === 'Medium'
                                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }
                          >
                            {battle.difficulty}
                          </Badge>
                          <Badge variant="outline" className="border-border/50">
                            <Users className="w-3 h-3 mr-1" />
                            {battle.players}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            {battle.prize}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {battle.status}
                          </div>
                          <div>{battle.type}</div>
                        </div>
                      </div>
                      <Button className="bg-primary hover:bg-primary/90 gap-2">
                        <Play className="w-4 h-4" />
                        Join Battle
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tournaments Tab */}
            <TabsContent value="tournaments" className="space-y-4">
              <div className="grid gap-4">
                {tournaments.map((tournament) => (
                  <Card
                    key={tournament.id}
                    className="border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Trophy className="w-5 h-5 text-accent" />
                          <h3 className="font-bold text-lg">{tournament.name}</h3>
                          <Badge
                            className={
                              tournament.status === 'Registration Open'
                                ? 'bg-primary/20 text-primary border-primary/30'
                                : 'bg-accent/20 text-accent border-accent/30'
                            }
                          >
                            {tournament.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {tournament.startDate} - {tournament.endDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {tournament.participants} participants
                          </div>
                          <div className="font-semibold text-accent">Prize: {tournament.prize}</div>
                        </div>
                      </div>
                      <Button className="bg-primary hover:bg-primary/90 gap-2">
                        Register
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
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
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {battle.time}
                          </div>
                          <div>+{battle.xpGained} XP</div>
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
