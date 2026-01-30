'use client';

import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, Target, Zap, Calendar, Download,
  Activity, Award, ArrowUpRight, ArrowDownRight, Filter,
  CheckCircle2, AlertCircle, Clock, Percent
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Sector
} from 'recharts';

// --- MOCK DATA ---
const activityData = Array.from({ length: 12 }, (_, i) => ({
  name: new Date(0, i).toLocaleString('en-US', { month: 'short' }),
  solved: Math.floor(Math.random() * 50) + 20,
  battles: Math.floor(Math.random() * 30) + 10,
  xp: Math.floor(Math.random() * 5000) + 2000,
}));

const topicRadarData = [
  { subject: 'Arrays', A: 120, fullMark: 150 },
  { subject: 'DP', A: 98, fullMark: 150 },
  { subject: 'Graphs', A: 86, fullMark: 150 },
  { subject: 'Trees', A: 99, fullMark: 150 },
  { subject: 'Strings', A: 85, fullMark: 150 },
  { subject: 'Greedy', A: 65, fullMark: 150 },
];

const submissionsData = [
  { status: 'Accepted', value: 450, color: '#22c55e' },
  { status: 'Wrong Answer', value: 120, color: '#ef4444' },
  { status: 'Time Limit', value: 45, color: '#eab308' },
  { status: 'Runtime Error', value: 15, color: '#f97316' },
];

const recentActivity = [
  { id: 1, action: 'Solved "Two Sum"', type: 'solve', time: '2 hours ago', xp: '+50' },
  { id: 2, action: 'Won Battle vs @alex', type: 'battle', time: '5 hours ago', xp: '+120' },
  { id: 3, action: 'Completed Mock Interview', type: 'interview', time: '1 day ago', xp: '+200' },
  { id: 4, action: 'New Streak Record (14 Days)', type: 'achievement', time: '2 days ago', xp: '+500' },
];

// Data for the dial
const difficultyData = [
  { name: 'Easy', value: 180, total: 200, color: '#22c55e', accuracy: 92 },
  { name: 'Medium', value: 215, total: 300, color: '#eab308', accuracy: 78 },
  { name: 'Hard', value: 55, total: 80, color: '#ef4444', accuracy: 64 },
];

const totalSolved = difficultyData.reduce((acc, curr) => acc + curr.value, 0);

// --- COMPONENTS ---

// 1. Interactive LeetCode Style Dial
const ProblemDial = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const activeItem = activeIndex !== null ? difficultyData[activeIndex] : null;

  // Custom Active Shape for hover effect
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8} // Make it pop out
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={innerRadius - 6}
          outerRadius={innerRadius - 2}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-4">
      {/* The Dial */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex !== null ? activeIndex : -1}
                activeShape={renderActiveShape}
                data={difficultyData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                stroke="none"
              >
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem ? activeItem.name : 'total'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              {activeItem ? (
                <>
                  <p className="text-sm font-medium text-muted-foreground uppercase">{activeItem.name}</p>
                  <h3 className="text-4xl font-bold" style={{ color: activeItem.color }}>{activeItem.value}</h3>
                  <div className="flex items-center justify-center gap-1 mt-1 text-xs font-medium bg-background/80 px-2 py-0.5 rounded-full shadow-sm border border-border/50">
                    <Target className="w-3 h-3" />
                    <span>{activeItem.accuracy}% Acc.</span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-muted-foreground uppercase">Total Solved</p>
                  <h3 className="text-4xl font-bold">{totalSolved}</h3>
                  <p className="text-xs text-muted-foreground">Across all topics</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* The Breakdown Legend with Hover Interaction */}
      <div className="space-y-4 w-full max-w-xs">
        {difficultyData.map((item, index) => (
          <div
            key={item.name}
            className={`space-y-1 p-2 rounded-lg transition-colors cursor-pointer ${activeIndex === index ? 'bg-muted/50' : 'hover:bg-muted/20'}`}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium" style={{ color: activeIndex === index ? item.color : undefined }}>
                {item.name}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {item.accuracy}% Acc
                </span>
                <span className="font-mono font-medium">
                  {item.value} <span className="text-muted-foreground text-xs">/ {item.total}</span>
                </span>
              </div>
            </div>
            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / item.total) * 100}%` }}
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto relative">
        {/* Background FX */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container max-w-7xl p-8 space-y-8 relative z-10">

          {/* Header */}
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
            <div className="flex gap-2">
              <Select defaultValue="month">
                <SelectTrigger className="w-[140px] bg-card/50 backdrop-blur-sm">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2 bg-card/50 backdrop-blur-sm">
                <Download className="w-4 h-4" /> Export
              </Button>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard title="Total XP" value="125,450" sub="vs last month" icon={Zap} trend="up" />
            <StatCard title="Problems Solved" value={totalSolved} sub="vs last month" icon={CheckCircle2} trend="up" />
            <StatCard title="Battle Win Rate" value="68.4%" sub="vs last month" icon={Award} trend="down" />
            <StatCard title="Study Hours" value="142h" sub="vs last month" icon={Clock} trend="up" />
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">

              {/* Problem Solving Dial Section */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle>Problem Solving Overview</CardTitle>
                  <CardDescription>Hover over segments to see accuracy rates.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProblemDial />
                </CardContent>
              </Card>

              {/* Activity Graph */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Activity Trends</CardTitle>
                    <CardDescription>Problems solved & XP gained over time.</CardDescription>
                  </div>
                  <Tabs defaultValue="xp" className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="xp">XP</TabsTrigger>
                      <TabsTrigger value="solved">Solved</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area type="monotone" dataKey="xp" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

            </div>

            {/* RIGHT COLUMN (1/3 width) */}
            <div className="space-y-8">

              {/* Topic Radar */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle>Skill Radar</CardTitle>
                  <CardDescription>Your strength across topics.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topicRadarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                      <Radar name="Skills" dataKey="A" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.5} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Submission Status Donut */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle>Submission Stats</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={submissionsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {submissionsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Activity List */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                        <div className={`p-2 rounded-full ${item.type === 'solve' ? 'bg-green-500/10 text-green-500' :
                          item.type === 'battle' ? 'bg-red-500/10 text-red-500' :
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                          {item.type === 'solve' ? <CheckCircle2 className="w-4 h-4" /> :
                            item.type === 'battle' ? <Target className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-medium truncate">{item.action}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">{item.xp}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
