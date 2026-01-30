'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  MoreVertical,
  Copy,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CreateBattleDialog } from '@/components/battles/create-battle-dialog';
import { UserProfileCard } from '@/components/user-profile-card';
import { useUserProfile } from '@/lib/hooks/use-user-profile';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

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

interface DashboardClientProps {
  stats: {
    activeRooms: number
    totalStudents: number
    draftRooms: number
  }
  recentRooms: any[]
  activeBattles: any[]
}

export default function DashboardClient({ stats, recentRooms, activeBattles }: DashboardClientProps) {
  const { profile, loading, error } = useUserProfile();
  const router = useRouter();
  const supabase = createClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Combine stats for display
  const totalActive = activeBattles.filter(b => b.status === 'ACTIVE' || b.status === 'WAITING').length;

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from('battles').delete().eq('id', id);
      if (error) throw error;

      toast.success("Room deleted successfully");
      router.refresh();
    } catch (error: any) {
      toast.error("Failed to delete room: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Room code copied!");
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* User Profile Section */}
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Profile</AlertTitle>
              <AlertDescription>
                {error}. Please try refreshing the page or contact support if the issue persists.
              </AlertDescription>
            </Alert>
          ) : profile ? (
            <UserProfileCard profile={profile} />
          ) : null}

          {/* Header with Accent Theme */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="w-8 h-8 text-accent" />
                Teacher Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage competitions, monitor student progress, and create assignments
              </p>
            </div>
            <CreateBattleDialog />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Total Students</p>
              <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
              <p className="text-xs text-muted-foreground mt-2">On platform</p>
            </Card>

            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Active Rooms</p>
              <p className="text-3xl font-bold mt-2 text-primary">{totalActive}</p>
              <p className="text-xs text-muted-foreground mt-2">Running competitions</p>
            </Card>

            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Drafts</p>
              <p className="text-3xl font-bold mt-2">{stats.draftRooms}</p>
              <p className="text-xs text-muted-foreground mt-2">Pending launch</p>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="classes" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/30">
              <TabsTrigger value="classes">Battle Rooms</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Classes/Rooms Tab */}
            <TabsContent value="classes" className="space-y-4">
              <div className="grid gap-4">
                {activeBattles.length === 0 ? (
                  <Card className="p-12 text-center text-muted-foreground border-dashed border-2 border-border/50 bg-card/30">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No active battle rooms</h3>
                    <p className="mb-6">Create a room to start a new competition for your students.</p>
                    <div className="flex justify-center">
                      <CreateBattleDialog />
                    </div>
                  </Card>
                ) : (
                  activeBattles.map((room) => (
                    <Card
                      key={room.id}
                      className="border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{room.title}</h3>
                            <Badge className={
                              room.status === 'ACTIVE' ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" :
                                room.status === 'WAITING' ? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30" :
                                  "bg-muted text-muted-foreground"
                            }>
                              {room.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2" title="Participants">
                              <Users className="w-4 h-4 text-primary" />
                              <span className="font-medium text-foreground">{room.current_players || 0}</span>
                              <span>/ {room.max_players}</span>
                            </div>
                            <div className="flex items-center gap-2 group-hover:text-foreground transition-colors cursor-pointer" onClick={() => copyCode(room.room_code)} title="Click to copy">
                              <Clock className="w-4 h-4" />
                              <span>Code:</span>
                              <span className="font-mono font-bold tracking-wider">{room.room_code}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs font-normal border-border/50">{room.difficulty}</Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button asChild size="sm" className="hidden sm:flex bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-0">
                            <a href={`/teacher-dashboard/battles/${room.id}`}>
                              <Settings className="w-4 h-4 mr-2" />
                              Manage
                            </a>
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/teacher-dashboard/battles/${room.id}`)}>
                                <Settings className="w-4 h-4 mr-2" />
                                Manage Room
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyCode(room.room_code)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Code
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                onClick={() => handleDelete(room.id)}
                                disabled={deletingId === room.id}
                              >
                                {deletingId === room.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                Delete Room
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
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
