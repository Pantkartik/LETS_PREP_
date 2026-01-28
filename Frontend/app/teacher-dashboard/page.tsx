'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Plus,
  Settings,
  BarChart3,
  Play,
  Clock,
  TrendingUp,
  MessageSquare,
  Download,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';

const studentPerformance = [
  { topic: 'Arrays', averageScore: 82, submittedCount: 24 },
  { topic: 'Trees', averageScore: 75, submittedCount: 20 },
  { topic: 'Graphs', averageScore: 68, submittedCount: 18 },
  { topic: 'DP', averageScore: 72, submittedCount: 16 },
  { topic: 'Strings', averageScore: 88, submittedCount: 22 },
];

const classStats = [
  { week: 'Week 1', participated: 28, avgScore: 7.2, completion: 92 },
  { week: 'Week 2', participated: 32, avgScore: 7.5, completion: 96 },
  { week: 'Week 3', participated: 30, avgScore: 7.8, completion: 94 },
  { week: 'Week 4', participated: 35, avgScore: 8.1, completion: 98 },
];

const classes = [
  {
    id: 1,
    name: 'DSA Fundamentals - Section A',
    students: 34,
    createdDate: 'Jan 10, 2024',
    nextClass: 'Today 2:00 PM',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Advanced Algorithms - Section B',
    students: 28,
    createdDate: 'Jan 15, 2024',
    nextClass: 'Tomorrow 3:00 PM',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Interview Prep Bootcamp',
    students: 45,
    createdDate: 'Dec 20, 2023',
    nextClass: 'This Saturday',
    status: 'Active',
  },
];

const assignments = [
  {
    id: 1,
    title: 'Binary Tree Traversal',
    class: 'DSA Fundamentals - Section A',
    dueDate: 'Jan 28, 2024',
    submitted: 28,
    total: 34,
    avgScore: 8.2,
  },
  {
    id: 2,
    title: 'Graph Algorithms',
    class: 'Advanced Algorithms - Section B',
    dueDate: 'Jan 25, 2024',
    submitted: 26,
    total: 28,
    avgScore: 7.8,
  },
  {
    id: 3,
    title: 'System Design Interview',
    class: 'Interview Prep Bootcamp',
    dueDate: 'Jan 30, 2024',
    submitted: 18,
    total: 45,
    avgScore: 7.5,
  },
];

export default function TeacherDashboardPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="w-8 h-8 text-accent" />
                Teacher Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage classes, monitor student progress, and create assignments
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              Create Class
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Total Students</p>
              <p className="text-3xl font-bold mt-2">107</p>
              <p className="text-xs text-muted-foreground mt-2">Across 3 classes</p>
            </Card>

            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Class Average</p>
              <p className="text-3xl font-bold mt-2 text-primary">7.9/10</p>
              <p className="text-xs text-muted-foreground mt-2">↑ 0.3 from last week</p>
            </Card>

            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Assignments Given</p>
              <p className="text-3xl font-bold mt-2">12</p>
              <p className="text-xs text-muted-foreground mt-2">3 pending review</p>
            </Card>

            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Participation Rate</p>
              <p className="text-3xl font-bold mt-2">94%</p>
              <p className="text-xs text-muted-foreground mt-2">93 of 107 students</p>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="classes" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/30">
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Classes Tab */}
            <TabsContent value="classes" className="space-y-4">
              <div className="grid gap-4">
                {classes.map((classItem) => (
                  <Card
                    key={classItem.id}
                    className="border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg">{classItem.name}</h3>
                          <Badge className="bg-accent/20 text-accent border-accent/30">
                            {classItem.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {classItem.students} students
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Next: {classItem.nextClass}
                          </div>
                          <div>Created: {classItem.createdDate}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Assignments Tab */}
            <TabsContent value="assignments" className="space-y-4">
              <div className="flex gap-3 mb-4">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="w-4 h-4" />
                  Create Assignment
                </Button>
                <Button variant="outline" className="border-border/50 gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  Export Results
                </Button>
              </div>

              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Card
                    key={assignment.id}
                    className="border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div>
                          <h3 className="font-bold text-lg">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">{assignment.class}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            Due: {assignment.dueDate}
                          </div>
                          <div>
                            <span className="font-semibold text-primary">
                              {assignment.submitted}/{assignment.total}
                            </span>
                            <span className="text-muted-foreground"> submitted</span>
                          </div>
                          <div>
                            Avg Score:{' '}
                            <span className="font-semibold text-accent">{assignment.avgScore}/10</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="text-lg font-bold mb-6">Class Performance Trend</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={classStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" yAxisId="left" />
                    <YAxis
                      stroke="var(--color-muted-foreground)"
                      yAxisId="right"
                      orientation="right"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="avgScore"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="completion"
                      stroke="var(--color-accent)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="text-lg font-bold mb-6">Topic Performance by Class</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={studentPerformance}>
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
                    <Bar dataKey="averageScore" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
