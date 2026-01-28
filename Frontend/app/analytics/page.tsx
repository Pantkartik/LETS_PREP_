'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Calendar,
  Download,
} from 'lucide-react';

const performanceByTopic = [
  { topic: 'Arrays', accuracy: 92, attempts: 45, avgTime: 3.2 },
  { topic: 'Trees', accuracy: 78, attempts: 32, avgTime: 4.5 },
  { topic: 'Graphs', accuracy: 68, attempts: 28, avgTime: 5.1 },
  { topic: 'DP', accuracy: 62, attempts: 21, avgTime: 6.3 },
  { topic: 'Strings', accuracy: 88, attempts: 38, avgTime: 3.8 },
  { topic: 'Stacks', accuracy: 85, attempts: 25, avgTime: 2.9 },
];

const weeklyProgress = [
  { day: 'Mon', problems: 8, battles: 3, interviews: 1, xp: 420 },
  { day: 'Tue', problems: 6, battles: 4, interviews: 0, xp: 380 },
  { day: 'Wed', problems: 10, battles: 2, interviews: 1, xp: 510 },
  { day: 'Thu', problems: 7, battles: 5, interviews: 2, xp: 480 },
  { day: 'Fri', problems: 12, battles: 6, interviews: 1, xp: 620 },
  { day: 'Sat', problems: 9, battles: 3, interviews: 0, xp: 440 },
  { day: 'Sun', problems: 5, battles: 1, interviews: 1, xp: 280 },
];

const difficultyDistribution = [
  { name: 'Easy', value: 35, color: '#10b981' },
  { name: 'Medium', value: 45, color: '#f59e0b' },
  { name: 'Hard', value: 20, color: '#ef4444' },
];

const monthlyTrend = [
  { month: 'Jan', solved: 120, battles: 45, score: 7.8 },
  { month: 'Feb', solved: 135, battles: 52, score: 8.1 },
  { month: 'Mar', solved: 158, battles: 68, score: 8.4 },
  { month: 'Apr', solved: 142, battles: 61, score: 8.0 },
  { month: 'May', solved: 175, battles: 72, score: 8.6 },
  { month: 'Jun', solved: 198, battles: 85, score: 8.9 },
];

const weakAreas = [
  { topic: 'Graphs & Backtracking', score: 58, improvement: '-5%' },
  { topic: 'System Design', score: 65, improvement: '-2%' },
  { topic: 'Greedy Algorithms', score: 72, improvement: '+3%' },
];

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-primary" />
                Performance Analytics
              </h1>
              <p className="text-muted-foreground">
                Track your progress and identify improvement areas
              </p>
            </div>
            <Button variant="outline" className="border-border/50 gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Overall Accuracy</p>
              <p className="text-3xl font-bold mt-2 text-primary">78.4%</p>
              <p className="text-xs text-muted-foreground mt-2">↑ 2.3% from last month</p>
            </Card>

            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Avg Score (Interviews)</p>
              <p className="text-3xl font-bold mt-2 text-accent">8.3/10</p>
              <p className="text-xs text-muted-foreground mt-2">Trending up ↑</p>
            </Card>

            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Total Problems</p>
              <p className="text-3xl font-bold mt-2">428</p>
              <p className="text-xs text-muted-foreground mt-2">+47 this month</p>
            </Card>
          </div>

          {/* Main Charts */}
          <Tabs defaultValue="topics" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/30">
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="weekly">Weekly Activity</TabsTrigger>
              <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            </TabsList>

            {/* Topics Tab */}
            <TabsContent value="topics" className="space-y-6">
              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="text-lg font-bold mb-6">Accuracy by Topic</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={performanceByTopic}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="topic" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="accuracy" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border/50 bg-card/50 p-6">
                  <h3 className="text-lg font-bold mb-6">Difficulty Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={difficultyDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {difficultyDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="border-border/50 bg-card/50 p-6">
                  <h3 className="text-lg font-bold mb-4">Weak Areas</h3>
                  <div className="space-y-4">
                    {weakAreas.map((area, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{area.topic}</p>
                          <Badge
                            className={
                              area.improvement.includes('-')
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-green-500/20 text-green-400 border-green-500/30'
                            }
                          >
                            {area.improvement}
                          </Badge>
                        </div>
                        <div className="w-full bg-card rounded-full h-2">
                          <div
                            className="bg-accent rounded-full h-2"
                            style={{ width: `${area.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{area.score}% Accuracy</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Weekly Activity Tab */}
            <TabsContent value="weekly" className="space-y-6">
              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="text-lg font-bold mb-6">Weekly Activity Breakdown</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="problems"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--color-primary)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="battles"
                      stroke="var(--color-accent)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--color-accent)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="interviews"
                      stroke="var(--color-secondary)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--color-secondary)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="text-lg font-bold mb-4">This Week Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">57</p>
                    <p className="text-sm text-muted-foreground">Problems Solved</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">24</p>
                    <p className="text-sm text-muted-foreground">Battles Played</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">6</p>
                    <p className="text-sm text-muted-foreground">Interviews Done</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">3,210</p>
                    <p className="text-sm text-muted-foreground">XP Earned</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="text-lg font-bold mb-6">6-Month Performance Trend</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" yAxisId="left" />
                    <YAxis stroke="var(--color-muted-foreground)" yAxisId="right" orientation="right" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="solved"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      name="Problems Solved"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="battles"
                      stroke="var(--color-accent)"
                      strokeWidth={2}
                      name="Battles"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="score"
                      stroke="var(--color-secondary)"
                      strokeWidth={2}
                      name="Avg Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="text-lg font-bold mb-4">Key Insights</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
                    <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">
                      Your performance has improved by 14% over the last 6 months. Keep up the momentum!
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
                    <Target className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <p className="text-sm">
                      Focus on Graph problems - they're your weakest area with only 68% accuracy.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/30">
                    <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">
                      Your most consistent performance is on Array problems (92% accuracy over 45 attempts).
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
