'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Trophy,
  Medal,
  TrendingUp,
  Users,
  Calendar,
} from 'lucide-react';

const globalLeaderboard = [
  { rank: 1, name: 'CodeNinja99', xp: 45230, battles: 342, winRate: 87, change: '↑' },
  { rank: 2, name: 'AlgoMaster42', xp: 43890, battles: 318, winRate: 84, change: '↑' },
  { rank: 3, name: 'ByteKing', xp: 42150, battles: 305, winRate: 82, change: '↓' },
  { rank: 4, name: 'DataStructure', xp: 41230, battles: 298, winRate: 80, change: '↑' },
  { rank: 5, name: 'RecursiveThought', xp: 40120, battles: 287, winRate: 78, change: '↑' },
  { rank: 6, name: 'DynamicCoder', xp: 39450, battles: 276, winRate: 76, change: '↓' },
  { rank: 7, name: 'GraphExplorer', xp: 38900, battles: 265, winRate: 75, change: '↑' },
  { rank: 8, name: 'TreeTraversal', xp: 37800, battles: 254, winRate: 73, change: '↑' },
  { rank: 9, name: 'StreamSolver', xp: 36450, battles: 242, winRate: 71, change: '↓' },
  { rank: 10, name: 'YourUsername', xp: 32450, battles: 198, winRate: 68, change: '↑' },
];

const collegeLeaderboard = [
  { rank: 1, name: 'MIT - AlgoTeam', xp: 125420, members: 34, avgScore: 8.7 },
  { rank: 2, name: 'Stanford - CodeLords', xp: 118900, members: 28, avgScore: 8.5 },
  { rank: 3, name: 'CMU - ByteMasters', xp: 115230, members: 31, avgScore: 8.3 },
  { rank: 4, name: 'Berkeley - CompGeniuses', xp: 108450, members: 26, avgScore: 8.1 },
  { rank: 5, name: 'IIT Delhi - NeuralNet', xp: 98760, members: 42, avgScore: 7.9 },
];

const monthlyLeaderboard = [
  { rank: 1, name: 'SprintMaster', xp: 8920, change: 'New Leader' },
  { rank: 2, name: 'CodeBlazer', xp: 8450, change: '↑ 3' },
  { rank: 3, name: 'AlgoRocket', xp: 8120, change: '↓ 1' },
  { rank: 4, name: 'ByteHero', xp: 7890, change: '↑ 2' },
  { rank: 5, name: 'DataDriven', xp: 7650, change: '↑ 1' },
];

function LeaderboardRow({ rank, name, xp, secondary, tertiary, isYou = false }) {
  const rankColor = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-orange-300' : '';
  const bgColor = isYou ? 'bg-primary/20 border-primary/30' : '';

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border border-border/30 ${bgColor}`}>
      <div className="flex items-center gap-4 flex-1">
        <div className={`font-bold text-xl w-8 text-center ${rankColor}`}>
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
        </div>
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/20">{name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <p className={`font-semibold ${isYou ? 'text-primary' : ''}`}>{name}</p>
          <p className="text-xs text-muted-foreground">{secondary}</p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className="font-bold text-primary">{xp}</p>
          <p className="text-xs text-muted-foreground">{tertiary}</p>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardsPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-8 h-8 text-accent" />
              Leaderboards
            </h1>
            <p className="text-muted-foreground">
              Compete globally and climb the ranks
            </p>
          </div>

          {/* Your Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Your Rank</p>
              <p className="text-3xl font-bold mt-2 text-accent">#127</p>
              <p className="text-xs text-muted-foreground mt-2">Global Rank</p>
            </Card>

            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Total XP</p>
              <p className="text-3xl font-bold mt-2">32,450</p>
              <p className="text-xs text-muted-foreground mt-2">+850 this week</p>
            </Card>

            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Win Rate</p>
              <p className="text-3xl font-bold mt-2">68%</p>
              <p className="text-xs text-muted-foreground mt-2">135 wins / 198 battles</p>
            </Card>

            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">College Rank</p>
              <p className="text-3xl font-bold mt-2">#8</p>
              <p className="text-xs text-muted-foreground mt-2">Out of 234</p>
            </Card>
          </div>

          {/* Leaderboards Tabs */}
          <Tabs defaultValue="global" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/30">
              <TabsTrigger value="global" className="gap-2">
                <Users className="w-4 h-4" />
                Global
              </TabsTrigger>
              <TabsTrigger value="college" className="gap-2">
                <Medal className="w-4 h-4" />
                College
              </TabsTrigger>
              <TabsTrigger value="monthly" className="gap-2">
                <Calendar className="w-4 h-4" />
                Monthly
              </TabsTrigger>
            </TabsList>

            {/* Global Leaderboard */}
            <TabsContent value="global" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Global Rankings</h2>
                <Badge className="bg-accent/20 text-accent border-accent/30">
                  Updated 5 mins ago
                </Badge>
              </div>
              <div className="space-y-3">
                {globalLeaderboard.map((player) => (
                  <LeaderboardRow
                    key={player.rank}
                    rank={player.rank}
                    name={player.name}
                    xp={`${player.xp.toLocaleString()} XP`}
                    secondary={`${player.battles} battles`}
                    tertiary={`${player.winRate}% win rate`}
                    isYou={player.rank === 10}
                  />
                ))}
              </div>
            </TabsContent>

            {/* College Leaderboard */}
            <TabsContent value="college" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">College Rankings</h2>
                <Badge className="bg-accent/20 text-accent border-accent/30">
                  Top Teams by XP
                </Badge>
              </div>
              <div className="space-y-3">
                {collegeLeaderboard.map((college) => (
                  <div
                    key={college.rank}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/30 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="font-bold text-xl w-8 text-center">
                        {college.rank === 1 ? '🥇' : college.rank === 2 ? '🥈' : college.rank === 3 ? '🥉' : college.rank}
                      </div>
                      <div>
                        <p className="font-semibold">{college.name}</p>
                        <p className="text-xs text-muted-foreground">{college.members} members</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="font-bold text-accent">{college.xp.toLocaleString()} XP</p>
                        <p className="text-xs text-muted-foreground">Avg: {college.avgScore}/10</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Monthly Leaderboard */}
            <TabsContent value="monthly" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Monthly Champions</h2>
                <Badge className="bg-accent/20 text-accent border-accent/30">
                  January 2024
                </Badge>
              </div>
              <div className="space-y-3">
                {monthlyLeaderboard.map((player) => (
                  <div
                    key={player.rank}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/30 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="font-bold text-xl w-8 text-center">
                        {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                      </div>
                      <div>
                        <p className="font-semibold">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.change}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-accent text-lg">{player.xp.toLocaleString()} XP</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly Prize */}
              <Card className="border-border/50 bg-card/50 p-6 mt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Monthly Prize Pool</h3>
                    <p className="text-muted-foreground text-sm">
                      1st Place: $500 | 2nd Place: $300 | 3rd Place: $200
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
