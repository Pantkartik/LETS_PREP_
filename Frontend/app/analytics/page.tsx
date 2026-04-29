'use client';

import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase-client';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import {
  BarChart3, TrendingUp, Target, Zap, Calendar, Download,
  Activity, Award, ArrowUpRight, ArrowDownRight, Filter,
  CheckCircle2, AlertCircle, Clock, Percent, Loader2
} from 'lucide-react';
import { ProblemDial } from '@/components/analytics/problem-dial';
import { useUserProfile } from '@/lib/hooks/use-user-profile';
import ActivityHeatmap from '@/components/activity-heatmap';

const StatCard = ({ title, value, sub, icon: Icon, trend }: any) => (
  <Card className="border-border/50 bg-card/50 hover:bg-card/80 transition-all backdrop-blur-sm">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
        </div>
        <div className="p-3 bg-primary/10 rounded-xl">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {trend === 'up' ? (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
            <ArrowUpRight className="w-3 h-3" /> +12%
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 gap-1">
            <ArrowDownRight className="w-3 h-3" /> -2%
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
    </CardContent>
  </Card>
)

export default function AnalyticsPage() {
  const { profile, loading: profileLoading } = useUserProfile();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
        try {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
            const res = await fetch(`${API_BASE_URL}/judge/performance/${session.user.id}`);
            if (res.ok) {
                const data = await res.json();
                setAnalyticsData(data);
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoading(false);
        }
    }

    if (profile) {
        fetchAnalytics();
    }
  }, [profile]);

  if (profileLoading || loading) {
    return (
        <div className="flex h-screen bg-background text-foreground">
            <DashboardSidebar />
            <main className="flex-1 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
            </main>
        </div>
    );
  }

  const {
    difficultyDistribution = [],
    topicData = [],
    submissionStats = [],
    activityTrends = [],
    totalSolved = 0,
    accuracy = 0
  } = analyticsData || {};

  const easy = difficultyDistribution.find((d: any) => d.name === 'Easy') || { value: 0, accuracy: 0 };
  const medium = difficultyDistribution.find((d: any) => d.name === 'Medium') || { value: 0, accuracy: 0 };
  const hard = difficultyDistribution.find((d: any) => d.name === 'Hard') || { value: 0, accuracy: 0 };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container max-w-7xl p-8 space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Activity className="w-8 h-8 text-primary" />
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">Deep dive into your problem solving performance.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard title="Total XP" value={profile?.xp || 0} sub="vs last month" icon={Zap} trend="up" />
            <StatCard title="Problems Solved" value={totalSolved} sub="vs last month" icon={CheckCircle2} trend="up" />
            <StatCard title="Global Accuracy" value={`${accuracy}%`} sub="Across all attempts" icon={Percent} trend="up" />
            <StatCard title="Current Streak" value={`${profile?.current_streak || 0} Days`} sub="Keep it up!" icon={TrendingUp} trend="up" />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle>Problem Solving Overview</CardTitle>
                  <CardDescription>Your distribution across difficulty levels and accuracy rates.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProblemDial 
                    easy={easy.value}
                    medium={medium.value}
                    hard={hard.value}
                    total={totalSolved}
                    easyAcc={easy.accuracy}
                    mediumAcc={medium.accuracy}
                    hardAcc={hard.accuracy}
                    size="lg"
                  />
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle>Activity Heatmap</CardTitle>
                  <CardDescription>Your coding consistency over the last 90 days.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityHeatmap data={activityTrends} maxCount={10} />
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Activity Trends</CardTitle>
                    <CardDescription>Daily performance (last 14 days).</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityTrends.slice(-14)}>
                      <defs>
                        <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area type="monotone" dataKey="solved" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSolved)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle>Skill Radar</CardTitle>
                  <CardDescription>Your strength across topics.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {topicData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topicData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                          <Radar name="Skills" dataKey="A" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.5} />
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                  ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                          Solve more problems to see topic analysis.
                      </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle>Submission Stats</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={submissionStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {submissionStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
