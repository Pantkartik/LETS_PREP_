'use client';

import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Play,
  Clock,
  Brain,
  Code,
  MessageSquare,
  Settings,
  Award,
  TrendingUp,
} from 'lucide-react';

const interviewTypes = [
  {
    id: 'technical',
    title: 'Technical Interview',
    description: 'Practice coding problems and system design',
    icon: Code,
    difficulty: 'Medium',
    duration: '45 min',
    color: 'primary',
  },
  {
    id: 'behavioral',
    title: 'Behavioral Interview',
    description: 'Practice STAR method and soft skills',
    icon: MessageSquare,
    difficulty: 'Easy',
    duration: '30 min',
    color: 'accent',
  },
  {
    id: 'system-design',
    title: 'System Design',
    description: 'Design scalable systems and architectures',
    icon: Brain,
    difficulty: 'Hard',
    duration: '60 min',
    color: 'destructive',
  },
];

const pastInterviews = [
  {
    id: 1,
    type: 'Technical Interview',
    date: '2 days ago',
    score: 85,
    feedback: 'Strong problem-solving skills',
    duration: '42 min',
  },
  {
    id: 2,
    type: 'Behavioral Interview',
    date: '1 week ago',
    score: 92,
    feedback: 'Excellent communication',
    duration: '28 min',
  },
  {
    id: 3,
    type: 'System Design',
    date: '2 weeks ago',
    score: 78,
    feedback: 'Good architectural thinking',
    duration: '58 min',
  },
];

export default function InterviewSimulatorPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Video className="w-8 h-8 text-primary" />
              Interview Simulator
            </h1>
            <p className="text-muted-foreground">
              Practice interviews with AI-powered feedback and improve your skills
            </p>
          </div>

          <Tabs defaultValue="start" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/30">
              <TabsTrigger value="start">Start Interview</TabsTrigger>
              <TabsTrigger value="history">Past Interviews</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Start Interview Tab */}
            <TabsContent value="start" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {interviewTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.id}
                      className="border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-all hover:scale-105 cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-1">{type.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {type.description}
                          </p>
                          <div className="flex items-center gap-2 mb-4">
                            <Badge
                              className={
                                type.difficulty === 'Easy'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : type.difficulty === 'Medium'
                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }
                            >
                              {type.difficulty}
                            </Badge>
                            <Badge variant="outline" className="border-border/50">
                              <Clock className="w-3 h-3 mr-1" />
                              {type.duration}
                            </Badge>
                          </div>
                          <Button
                            className="w-full bg-primary hover:bg-primary/90"
                            onClick={async () => {
                              try {
                                const { startInterview } = await import('@/lib/actions/interviews');
                                const session = await startInterview(type.id, type.difficulty, 'General');
                                window.location.href = `/interviews/${session.id}`;
                              } catch (e) {
                                console.error(e);
                                // toast.error("Failed to start interview");
                              }
                            }}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Interview
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Quick Setup */}
              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="font-bold text-lg mb-4">Quick Setup</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Camera Preview
                      </label>
                      <div className="aspect-video bg-muted/20 rounded-lg flex items-center justify-center border border-border/30">
                        {isVideoOff ? (
                          <VideoOff className="w-12 h-12 text-muted-foreground" />
                        ) : (
                          <div className="text-muted-foreground text-sm">Camera feed will appear here</div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={isVideoOff ? 'bg-destructive/20' : ''}
                      >
                        {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMuted(!isMuted)}
                        className={isMuted ? 'bg-destructive/20' : ''}
                      >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Interview Settings
                      </label>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Difficulty Level</label>
                          <select className="w-full mt-1 px-3 py-2 bg-card/50 border border-border/50 rounded-md">
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Focus Area</label>
                          <select className="w-full mt-1 px-3 py-2 bg-card/50 border border-border/50 rounded-md">
                            <option>Data Structures</option>
                            <option>Algorithms</option>
                            <option>System Design</option>
                            <option>Behavioral</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Duration (minutes)</label>
                          <Input
                            type="number"
                            defaultValue={30}
                            min={15}
                            max={90}
                            className="mt-1 bg-card/50 border-border/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Past Interviews Tab */}
            {/* Past Interviews Tab */}
            <TabsContent value="history" className="space-y-4">
              {/* fetching logic handled inside a component would be better for server components, 
                   but since this is a client page (use client), we can fetch in useEffect */}
              <HistoryList />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border/50 bg-card/50 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-2xl font-bold">85%</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-500">+5% from last month</p>
                </Card>

                <Card className="border-border/50 bg-card/50 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Practice</p>
                      <p className="text-2xl font-bold">12.5 hrs</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Across 15 sessions</p>
                </Card>

                <Card className="border-border/50 bg-card/50 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Improvement</p>
                      <p className="text-2xl font-bold">+18%</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-500">Keep it up!</p>
                </Card>
              </div>

              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="font-bold text-lg mb-4">Performance by Category</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Technical Skills', score: 88, color: 'bg-primary' },
                    { name: 'Communication', score: 92, color: 'bg-accent' },
                    { name: 'Problem Solving', score: 85, color: 'bg-green-500' },
                    { name: 'System Design', score: 78, color: 'bg-yellow-500' },
                  ].map((category) => (
                    <div key={category.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">{category.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${category.color} transition-all`}
                          style={{ width: `${category.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function HistoryList() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/lib/actions/interviews').then(({ getInterviewHistory }) => {
      getInterviewHistory().then(data => {
        setHistory(data);
        setLoading(false);
      });
    });
  }, []);

  if (loading) return <div>Loading history...</div>;
  if (history.length === 0) return <div className="text-muted-foreground p-4">No interviews yet. Start one!</div>;

  return (
    <div className="grid gap-4">
      {history.map((interview) => (
        <Card
          key={interview.id}
          className="border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg capitalize">{interview.type}</h3>
                <Badge
                  className={
                    (interview.score || 0) >= 90
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : (interview.score || 0) >= 70
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }
                >
                  Score: {interview.score || 0}%
                </Badge>
                <Badge variant="outline">{interview.status}</Badge>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(interview.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            {interview.status === 'completed' && (
              <Button variant="ghost" onClick={() => window.location.href = `/interviews/${interview.id}`}>Review</Button>
            )}
            {interview.status === 'in_progress' && (
              <Button variant="default" size="sm" onClick={() => window.location.href = `/interviews/${interview.id}`}>Resume</Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
