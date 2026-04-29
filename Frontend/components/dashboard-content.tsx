'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import ActivityHeatmap from '@/components/activity-heatmap';
import { UserProfile } from '@/lib/hooks/use-user-profile';
import { createClient } from '@/lib/supabase-client';
import { motion } from 'framer-motion';
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
  Clock,
  UserPlus,
  CheckCircle2,
  Loader2,
  Swords
} from 'lucide-react';
import { JoinClassDialog } from '@/components/student/join-class-dialog';
import { MyClassrooms } from '@/components/student/my-classrooms';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface DashboardContentProps {
    profile?: UserProfile | null;
    loading?: boolean;
}

export function DashboardContent({ profile, loading: profileLoading }: DashboardContentProps) {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

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
            setLoadingAnalytics(false);
        }
    }

    if (profile) {
        fetchAnalytics();
    }
  }, [profile]);

  if (profileLoading) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 h-[400px] rounded-xl" />
                <Skeleton className="h-[400px] rounded-xl" />
            </div>
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

  const solvedCount = profile?.judge_stats?.total || 0;
  const xp = profile?.xp || 0;
  const streak = profile?.current_streak || 0;
  const wins = profile?.total_wins || 0;

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Stats */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.full_name?.split(' ')[0] || profile?.username || 'Coder'}!</h1>
            <p className="text-muted-foreground mt-1">Ready for today's challenge?</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20 gap-1.5 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Level {profile?.level || 1}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-all backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Current Streak</p>
                <p className="text-3xl font-bold mt-2">{streak}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                <Flame className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-all backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total XP</p>
                <p className="text-3xl font-bold mt-2">{xp.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <Zap className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-all backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Solved</p>
                <p className="text-3xl font-bold mt-2">{solvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-all backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Battles Won</p>
                <p className="text-3xl font-bold mt-2">{wins}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
                <Trophy className="w-6 h-6 text-yellow-500" />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/battles" className="block w-full">
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 gap-3 h-auto py-5 rounded-2xl shadow-lg shadow-primary/10 transition-all active:scale-[0.98]">
                <Zap className="w-6 h-6" />
                <div className="text-left">
                    <div className="font-bold text-lg">Battle Now</div>
                    <div className="text-xs opacity-80">Join a coding arena</div>
                </div>
                </Button>
            </Link>
            <Link href="/practice" className="block w-full">
                <Button size="lg" className="w-full bg-accent hover:bg-accent/90 gap-3 h-auto py-5 rounded-2xl shadow-lg shadow-accent/10 transition-all active:scale-[0.98]">
                <Brain className="w-6 h-6" />
                <div className="text-left">
                    <div className="font-bold text-lg">Practice</div>
                    <div className="text-xs opacity-80">Sharpen your skills</div>
                </div>
                </Button>
            </Link>
            <JoinClassDialog>
              <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-600 gap-3 h-auto py-5 rounded-2xl shadow-lg shadow-emerald-500/10 transition-all active:scale-[0.98]">
                <UserPlus className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-bold text-lg">Join Class</div>
                  <div className="text-xs opacity-80">Learn with others</div>
                </div>
              </Button>
            </JoinClassDialog>
          </div>

          {/* Activity Heatmap - Now using last 7 days from analytics for simple view, or generic if no data */}
          <Card className="border-border/50 bg-card/50 p-6 overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Recent Submissions</h3>
              <Link href="/analytics">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-primary">
                    Full Analytics <TrendingUp className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="h-[250px] w-full">
                {loadingAnalytics ? (
                    <div className="h-full w-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityTrends}>
                            <defs>
                                <linearGradient id="dashSolved" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Area type="monotone" dataKey="solved" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#dashSolved)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
          </Card>

          {/* My Classrooms */}
          <MyClassrooms />
        </div>

        {/* Right Column - Stats & Progress */}
        <div className="space-y-6">
          {/* Difficulty Distribution */}
          <Card className="border-border/50 bg-card/50 p-6 backdrop-blur-sm shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Difficulty
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Easy', count: profile?.judge_stats?.Easy || 0, color: 'bg-green-500', text: 'text-green-500' },
                { label: 'Medium', count: profile?.judge_stats?.Medium || 0, color: 'bg-yellow-500', text: 'text-yellow-500' },
                { label: 'Hard', count: profile?.judge_stats?.Hard || 0, color: 'bg-red-500', text: 'text-red-500' }
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-2.5">
                    <p className={`text-sm font-semibold ${item.text}`}>{item.label}</p>
                    <p className="font-mono text-sm">{item.count}</p>
                  </div>
                  <div className="w-full bg-muted/40 rounded-full h-2.5 overflow-hidden">
                    <div 
                        style={{ width: `${(item.count / (solvedCount || 1)) * 100}%`, transition: 'width 1s ease-in-out' }}
                        className={`${item.color} rounded-full h-full shadow-lg`} 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Global Accuracy</span>
                    <span className="text-lg font-bold text-primary">{accuracy}%</span>
                </div>
                <div className="w-full bg-muted/40 rounded-full h-2 overflow-hidden">
                    <div 
                        style={{ width: `${accuracy}%`, transition: 'width 1s ease-in-out' }}
                        className="bg-primary rounded-full h-full" 
                    />
                </div>
            </div>
          </Card>

          {/* Badges Preview */}
          <Card className="border-border/50 bg-card/50 p-6 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Badges
              </h3>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[
                    { id: 1, name: 'First Accepted', icon: Trophy, unlocked: (profile?.judge_stats?.total || 0) > 0, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                    { id: 2, name: 'Solved 10', icon: Zap, unlocked: (profile?.judge_stats?.total || 0) >= 10, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { id: 3, name: 'Winner', icon: Swords, unlocked: (profile?.total_wins || 0) > 0, color: 'text-green-500', bg: 'bg-green-500/10' },
                ].map((badge: any) => (
                    <div 
                        key={badge.id} 
                        className={`flex flex-col items-center gap-2 group cursor-default`}
                        title={badge.unlocked ? badge.name : `Locked: ${badge.name}`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${
                            badge.unlocked 
                                ? `${badge.bg} border-primary/20 shadow-lg shadow-primary/5` 
                                : 'bg-muted/10 border-border/30 grayscale opacity-40'
                        }`}>
                            {badge.icon ? <badge.icon className={`w-7 h-7 ${badge.unlocked ? badge.color : 'text-muted-foreground'}`} /> : <Trophy className="w-7 h-7 text-muted-foreground" />}
                        </div>
                        <p className={`text-[10px] text-center font-medium ${badge.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>{badge.name}</p>
                    </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


