'use client';

import React from "react"
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserProfile } from '@/lib/hooks/use-user-profile';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Trophy,
  Flame,
  Zap,
  Calendar,
  Edit2,
  Share2,
  MapPin,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Clock,
  Target,
  Award,
  TrendingUp,
  Code,
  Users,
  Star,
  Swords
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { ProblemDial } from '@/components/analytics/problem-dial';

// Mock data for charts (until we have real historical data)
const activityData = [
  { name: 'Mon', xp: 400, battles: 2 },
  { name: 'Tue', xp: 300, battles: 1 },
  { name: 'Wed', xp: 600, battles: 4 },
  { name: 'Thu', xp: 200, battles: 1 },
  { name: 'Fri', xp: 800, battles: 5 },
  { name: 'Sat', xp: 500, battles: 3 },
  { name: 'Sun', xp: 900, battles: 6 },
];

const topicPerformance = [
  { subject: 'Arrays', A: 120, fullMark: 150 },
  { subject: 'Trees', A: 98, fullMark: 150 },
  { subject: 'DP', A: 86, fullMark: 150 },
  { subject: 'Graphs', A: 99, fullMark: 150 },
  { subject: 'Strings', A: 85, fullMark: 150 },
];

export default function ProfilePage() {
  const { profile, loading } = useUserProfile();

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <DashboardSidebar />
        <main className="flex-1 p-8">
          <div className="space-y-6">
            <div className="flex gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calculate join date
  const joinDate = profile ? new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024';

  let stats;

  if (profile?.role === 'TEACHER') {
    const teacherStats = profile.teacher_stats || {
      students_participated: 0,
      rating: 0,
      contests_held: 0,
      battles_held: 0
    };

    stats = [
      { label: 'Students Reached', value: teacherStats.students_participated.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { label: 'Student Rating', value: teacherStats.rating > 0 ? teacherStats.rating.toFixed(1) : 'N/A', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
      { label: 'Contests Held', value: teacherStats.contests_held.toString(), icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10' },
      { label: 'Battles Hosted', value: teacherStats.battles_held.toString(), icon: Swords, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    ];
  } else {
    stats = [
      { label: 'Global Rank', value: `#${profile?.rank_position || 'N/A'}`, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
      { label: 'Current Streak', value: `${profile?.xp ? Math.floor(profile.xp / 100) : 0} Days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
      { label: 'Total XP', value: profile?.xp?.toLocaleString() || '0', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { label: 'Battles Won', value: profile?.total_wins || '0', icon: Target, color: 'text-green-500', bg: 'bg-green-500/10' },
    ];
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto bg-muted/5 relative">
        {/* Ambient Background Gradient */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container max-w-6xl p-8 space-y-8 relative z-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-start justify-between gap-6"
          >
            <div className="flex items-start gap-6">
              <Avatar className="w-28 h-28 border-4 border-background shadow-xl">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                  {profile?.full_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 mt-2">
                <h1 className="text-4xl font-bold tracking-tight">{profile?.full_name}</h1>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <Code className="w-4 h-4" />
                    {profile?.role || 'Student'}
                  </p>
                  <span>•</span>
                  <p className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {/* Location is not in DB yet, dynamic placeholder */}
                    Remote
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="secondary" className="font-mono">@{profile?.username}</Badge>
                  {(profile as any)?.bio && (
                    <span className="text-sm text-muted-foreground ml-2 truncate max-w-md">
                      {(profile as any).bio}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4 md:mt-0">
              <Link href="/settings">
                <Button variant="outline" className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
              </Link>
              <Button variant="ghost" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => (
              <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50 p-1 border border-border/50 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
              <TabsTrigger value="activity" className="rounded-lg px-6">Activity</TabsTrigger>
              <TabsTrigger value="achievements" className="rounded-lg px-6">Achievements</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Problem Solving Overview - Only for Students or Teachers who code */}
                  <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Problem Solving Stats
                      </CardTitle>
                      <CardDescription>
                        {profile?.role === 'TEACHER' ? 'Problems you have created or tested' : 'Your distribution across difficulty levels'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center py-4">
                        <ProblemDial
                          easy={profile?.total_battles ? Math.floor(profile.total_battles * 0.4) : 12}
                          medium={profile?.total_battles ? Math.floor(profile.total_battles * 0.5) : 8}
                          hard={profile?.total_battles ? Math.floor(profile.total_battles * 0.1) : 3}
                          total={profile?.total_battles || 23}
                          size="md"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Links (Dynamic) */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { label: 'GitHub', value: (profile as any)?.github_username, icon: Github, url: 'https://github.com/' },
                      { label: 'Twitter', value: (profile as any)?.twitter_username, icon: Twitter, url: 'https://twitter.com/' },
                      { label: 'Website', value: (profile as any)?.website, icon: Globe, url: '' }, // Direct URL
                    ].map((item, i) => item.value ? (
                      <a
                        href={item.label === 'Website' ? item.value : `${item.url}${item.value}`}
                        target="_blank"
                        rel="noreferrer"
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 transition-colors"
                      >
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                        <div className="overflow-hidden">
                          <p className="text-xs text-muted-foreground font-medium uppercase">{item.label}</p>
                          <p className="text-sm font-semibold truncate">{item.value}</p>
                        </div>
                      </a>
                    ) : null)}
                  </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                  <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Profile Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-border/30">
                        <span className="text-muted-foreground text-sm">Member Since</span>
                        <span className="font-medium text-sm flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {joinDate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-border/30">
                        <span className="text-muted-foreground text-sm">
                          {profile?.role === 'TEACHER' ? 'Battles Created' : 'Total Battles'}
                        </span>
                        <span className="font-medium text-sm">
                          {profile?.role === 'TEACHER' ? (profile.teacher_stats?.battles_held || 0) : (profile?.total_battles || 0)} Matches
                        </span>
                      </div>
                      {profile?.role === 'STUDENT' && (
                        <div className="flex items-center justify-between py-2 border-b border-border/30">
                          <span className="text-muted-foreground text-sm">Win Rate</span>
                          <span className="font-medium text-sm text-green-500">
                            {profile?.total_battles ? Math.round(((profile.total_wins || 0) / profile.total_battles) * 100) : 0}%
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Badges Preview */}
                  <Card className="border-border/50 bg-gradient-to-br from-card/50 to-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        Top Badges
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((badge) => (
                          <div key={badge} className="aspect-square rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-help" title="Badge Locked">
                            <Trophy className="w-5 h-5 text-accent" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="border-border/50 bg-card/50 h-[400px] flex items-center justify-center text-muted-foreground">
                Detailed activity history coming soon...
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Mock Achievements until we hook up the table */}
                {[
                  { title: 'First Blood', desc: 'Win your first battle', unlocked: (profile?.total_wins || 0) > 0 },
                  { title: 'Veteran', desc: 'Participate in 50 battles', unlocked: (profile?.total_battles || 0) > 50 },
                  { title: 'Level Up', desc: 'Reach Level 5', unlocked: (profile?.level || 1) >= 5 },
                ].map((ach, i) => (
                  <Card key={i} className={`border-border/50 ${ach.unlocked ? 'bg-primary/5 border-primary/20' : 'bg-card/30 opacity-60'}`}>
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${ach.unlocked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold">{ach.title}</h4>
                        <p className="text-sm text-muted-foreground">{ach.desc}</p>
                        {ach.unlocked && <Badge variant="secondary" className="mt-2 text-[10px] h-5">Unlocked</Badge>}
                      </div>
                    </CardContent>
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
