'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ActivityHeatmap from '@/components/activity-heatmap';
import { 
  Flame, 
  Trophy, 
  Zap, 
  Brain, 
  Users, 
  Target,
  TrendingUp,
  Plus,
  Play,
  Clock
} from 'lucide-react';

const performanceData = [
  { topic: 'Arrays', correct: 85, total: 100 },
  { topic: 'Trees', correct: 72, total: 100 },
  { topic: 'Graphs', correct: 68, total: 100 },
  { topic: 'DP', correct: 60, total: 100 },
  { topic: 'Strings', correct: 90, total: 100 },
];

const activityHeatmapData = [
  // Week 1
  { date: '2024-01-01', count: 5 },
  { date: '2024-01-02', count: 8 },
  { date: '2024-01-03', count: 3 },
  { date: '2024-01-04', count: 7 },
  { date: '2024-01-05', count: 12 },
  { date: '2024-01-06', count: 10 },
  { date: '2024-01-07', count: 2 },
  // Week 2
  { date: '2024-01-08', count: 6 },
  { date: '2024-01-09', count: 9 },
  { date: '2024-01-10', count: 4 },
  { date: '2024-01-11', count: 11 },
  { date: '2024-01-12', count: 8 },
  { date: '2024-01-13', count: 7 },
  { date: '2024-01-14', count: 0 },
  // Week 3
  { date: '2024-01-15', count: 5 },
  { date: '2024-01-16', count: 10 },
  { date: '2024-01-17', count: 6 },
  { date: '2024-01-18', count: 9 },
  { date: '2024-01-19', count: 12 },
  { date: '2024-01-20', count: 11 },
  { date: '2024-01-21', count: 3 },
  // Week 4
  { date: '2024-01-22', count: 7 },
  { date: '2024-01-23', count: 8 },
  { date: '2024-01-24', count: 5 },
  { date: '2024-01-25', count: 10 },
  { date: '2024-01-26', count: 9 },
  { date: '2024-01-27', count: 11 },
  { date: '2024-01-28', count: 6 },
];

const heatmapData = [
  { day: 'Mon', count: 5 },
  { day: 'Tue', count: 8 },
  { day: 'Wed', count: 3 },
  { day: 'Thu', count: 7 },
  { day: 'Fri', count: 12 },
  { day: 'Sat', count: 10 },
  { day: 'Sun', count: 2 },
];

const upcomingBattles = [
  {
    id: 1,
    name: 'Array Mastery 1v1',
    difficulty: 'Medium',
    players: 24,
    startTime: '2:30 PM',
    type: '1v1',
  },
  {
    id: 2,
    name: 'Tree Challenge Tournament',
    difficulty: 'Hard',
    players: 156,
    startTime: '4:00 PM',
    type: 'Tournament',
  },
  {
    id: 3,
    name: 'Daily Easy Quest',
    difficulty: 'Easy',
    players: 2841,
    startTime: 'Open',
    type: 'Quest',
  },
];

export function DashboardContent() {
  return (
    <div className="space-y-8">
      {/* Welcome & Quick Stats */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Coder!</h1>
          <p className="text-muted-foreground mt-2">Here's your progress at a glance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Current Streak</p>
                <p className="text-3xl font-bold mt-2">12</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Flame className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/50 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total XP</p>
                <p className="text-3xl font-bold mt-2">2,450</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/50 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Ranking</p>
                <p className="text-3xl font-bold mt-2">#127</p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/50 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Battles Won</p>
                <p className="text-3xl font-bold mt-2">34</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Battles & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2 h-auto py-4">
              <Zap className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Battle Now</div>
                <div className="text-xs opacity-90">Jump into a 1v1</div>
              </div>
            </Button>
            <Button size="lg" className="bg-accent hover:bg-accent/90 gap-2 h-auto py-4">
              <Brain className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Interview Mode</div>
                <div className="text-xs opacity-90">AI practice</div>
              </div>
            </Button>
          </div>

          {/* Upcoming Battles */}
          <Card className="border-border/50 bg-card/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Upcoming Battles</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>

            <div className="space-y-3">
              {upcomingBattles.map((battle) => (
                <div
                  key={battle.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/30 hover:border-border/50 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold">{battle.name}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="border-border/50">
                        {battle.difficulty}
                      </Badge>
                      <Badge variant="outline" className="border-border/50">
                        <Users className="w-3 h-3 mr-1" />
                        {battle.players}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{battle.startTime}</p>
                    <Button size="sm" className="mt-2 bg-primary hover:bg-primary/90" variant="default">
                      <Play className="w-4 h-4 mr-1" />
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Stats & Progress */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <Card className="border-border/50 bg-card/50 p-6">
            <h3 className="text-lg font-bold mb-4">This Week</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-muted-foreground">Problems Solved</p>
                  <p className="font-semibold">24/30</p>
                </div>
                <div className="w-full bg-card rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: '80%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-muted-foreground">Battles Played</p>
                  <p className="font-semibold">8/15</p>
                </div>
                <div className="w-full bg-card rounded-full h-2">
                  <div className="bg-accent rounded-full h-2" style={{ width: '53%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-muted-foreground">Interviews Done</p>
                  <p className="font-semibold">3/5</p>
                </div>
                <div className="w-full bg-card rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Achievements */}
          <Card className="border-border/50 bg-card/50 p-6">
            <h3 className="text-lg font-bold mb-4">Badges</h3>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Badge {i}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap data={activityHeatmapData} title="Your Activity Heatmap (Last 4 Weeks)" maxCount={12} />

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Topic Performance */}
        <Card className="border-border/50 bg-card/50 p-6">
          <h3 className="text-lg font-bold mb-6">Topic Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="topic" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="correct" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Weekly Activity */}
        <Card className="border-border/50 bg-card/50 p-6">
          <h3 className="text-lg font-bold mb-6">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={heatmapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="var(--color-accent)" 
                strokeWidth={2}
                dot={{ fill: 'var(--color-accent)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
