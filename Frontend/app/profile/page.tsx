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
      { label: 'Current Streak', value: `${profile?.current_streak || 0} Days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
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

            <div className="flex flex-col gap-3 mt-4 md:mt-0">
              <div className="flex gap-3">
                <Link href="/settings">
                    <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 transition-all">
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                    </Button>
                </Link>
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10">
                    <Share2 className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Social Links in Header */}
              <div className="flex items-center gap-2 mt-2">
                {[
                    { icon: Github, value: (profile as any)?.github_username, url: 'https://github.com/' },
                    { icon: Twitter, value: (profile as any)?.twitter_username, url: 'https://twitter.com/' },
                    { icon: Linkedin, value: (profile as any)?.linkedin_username, url: 'https://linkedin.com/in/' },
                    { icon: Globe, value: (profile as any)?.website, url: '' },
                ].map((social, i) => social.value ? (
                    <a 
                        key={i} 
                        href={social.icon === Globe ? social.value : `${social.url}${social.value}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-all border border-border/50"
                    >
                        <social.icon className="w-4 h-4" />
                    </a>
                ) : null)}
              </div>
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
                          easy={profile?.judge_stats?.Easy || 0}
                          medium={profile?.judge_stats?.Medium || 0}
                          hard={profile?.judge_stats?.Hard || 0}
                          total={profile?.judge_stats?.total || 0}
                          size="md"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Latest Submissions Section */}
                  <Card className="border-border/50 bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Latest Submissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {profile?.latest_submissions && profile.latest_submissions.length > 0 ? (
                          profile.latest_submissions.map((sub: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${sub.verdict === 'Accepted' ? 'bg-green-500' : 'bg-red-500'}`} />
                                <div>
                                  <p className="text-sm font-semibold">{sub.question_id?.title || 'Unknown Problem'}</p>
                                  <p className="text-xs text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <Badge variant="outline" className="text-[10px]">
                                  {sub.question_id?.difficulty}
                                </Badge>
                                <span className={`text-xs font-mono ${sub.verdict === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}>
                                  {sub.verdict}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No submissions yet. Start coding to see your progress!
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location and member info */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>Remote</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {joinDate}</span>
                    </div>
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
                        {[
                          { id: 1, name: 'First Accepted', icon: Trophy, unlocked: (profile?.judge_stats?.total || 0) > 0, color: 'text-yellow-500' },
                          { id: 2, name: 'Easy Solver', icon: Zap, unlocked: (profile?.judge_stats?.Easy || 0) >= 5, color: 'text-blue-500' },
                          { id: 3, name: 'Medium Master', icon: Star, unlocked: (profile?.judge_stats?.Medium || 0) >= 5, color: 'text-purple-500' },
                          { id: 4, name: 'Hard Hitter', icon: Flame, unlocked: (profile?.judge_stats?.Hard || 0) >= 1, color: 'text-orange-500' },
                          { id: 5, name: 'Battle Winner', icon: Swords, unlocked: (profile?.total_wins || 0) > 0, color: 'text-green-500' },
                          { id: 6, name: 'Elite Coder', icon: Award, unlocked: (profile?.xp || 0) >= 1000, color: 'text-red-500' },
                        ].map((badge) => (
                          <div 
                            key={badge.id} 
                            className={`aspect-square rounded-full flex items-center justify-center transition-all cursor-help border ${
                              badge.unlocked 
                                ? `bg-accent/20 border-accent/40 shadow-lg shadow-accent/5` 
                                : 'bg-muted/10 border-border/30 grayscale opacity-40'
                            }`}
                            title={badge.unlocked ? badge.name : `Locked: ${badge.name}`}
                          >
                            <badge.icon className={`w-5 h-5 ${badge.unlocked ? badge.color : 'text-muted-foreground'}`} />
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
