'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Play,
  Clock,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Users,
  Zap,
} from 'lucide-react';

const interviewTypes = [
  {
    id: 1,
    company: 'Google',
    role: 'Software Engineer',
    difficulty: 'Hard',
    duration: '45 min',
    completed: 5,
    description: 'System design and coding interviews',
  },
  {
    id: 2,
    company: 'Meta',
    role: 'Backend Engineer',
    difficulty: 'Hard',
    duration: '50 min',
    completed: 3,
    description: 'Distributed systems and algorithms',
  },
  {
    id: 3,
    company: 'Amazon',
    role: 'SDE',
    difficulty: 'Medium',
    duration: '40 min',
    completed: 7,
    description: 'Two-pointer and sorting problems',
  },
  {
    id: 4,
    company: 'Microsoft',
    role: 'Software Engineer',
    difficulty: 'Medium',
    duration: '45 min',
    completed: 4,
    description: 'Trees and dynamic programming',
  },
  {
    id: 5,
    company: 'Apple',
    role: 'Software Engineer',
    difficulty: 'Hard',
    duration: '50 min',
    completed: 2,
    description: 'Advanced algorithms and optimization',
  },
  {
    id: 6,
    company: 'Tesla',
    role: 'Software Engineer',
    difficulty: 'Medium',
    duration: '40 min',
    completed: 1,
    description: 'General coding and problem-solving',
  },
];

const previousInterviews = [
  {
    id: 1,
    company: 'Google',
    score: '8.5/10',
    feedback: 'Great approach but could optimize better',
    date: '2 days ago',
  },
  {
    id: 2,
    company: 'Meta',
    score: '7.2/10',
    feedback: 'Good solution but slow communication',
    date: '5 days ago',
  },
  {
    id: 3,
    company: 'Amazon',
    score: '9.1/10',
    feedback: 'Excellent explanation and edge case handling',
    date: '1 week ago',
  },
];

export default function InterviewsPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="w-8 h-8 text-accent" />
              AI Interview Simulator
            </h1>
            <p className="text-muted-foreground">
              Practice with company-specific interview questions powered by AI
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Interviews Completed</p>
              <p className="text-3xl font-bold mt-2">22</p>
              <p className="text-xs text-muted-foreground mt-2">+3 this week</p>
            </Card>

            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Average Score</p>
              <p className="text-3xl font-bold mt-2">8.2/10</p>
              <p className="text-xs text-muted-foreground mt-2">Trending up ↑</p>
            </Card>

            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Companies Practiced</p>
              <p className="text-3xl font-bold mt-2">12</p>
              <p className="text-xs text-muted-foreground mt-2">All FAANG+</p>
            </Card>

            <Card className="border-border/50 bg-card/50 p-6">
              <p className="text-muted-foreground text-sm">Total Time</p>
              <p className="text-3xl font-bold mt-2">18h 32m</p>
              <p className="text-xs text-muted-foreground mt-2">Practice logged</p>
            </Card>
          </div>

          {/* Interview Types Grid */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Start an Interview</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviewTypes.map((interview) => (
                <Card
                  key={interview.id}
                  className="border-border/50 bg-card/50 hover:bg-card/80 transition-colors p-6 flex flex-col"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{interview.company}</h3>
                        <p className="text-sm text-muted-foreground">{interview.role}</p>
                      </div>
                      <Badge
                        className={
                          interview.difficulty === 'Easy'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : interview.difficulty === 'Medium'
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }
                      >
                        {interview.difficulty}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">{interview.description}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {interview.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        {interview.completed} done
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-4 bg-accent hover:bg-accent/90 gap-2">
                    <Play className="w-4 h-4" />
                    Start Interview
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Previous Interviews */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recent Interview Results</h2>
            <div className="grid gap-4">
              {previousInterviews.map((interview) => (
                <Card
                  key={interview.id}
                  className="border-border/50 bg-card/50 p-6 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg">{interview.company} Interview</h3>
                        <Badge className="bg-accent/20 text-accent border-accent/30">
                          {interview.score}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{interview.feedback}</p>
                      <p className="text-xs text-muted-foreground">{interview.date}</p>
                    </div>
                    <Button variant="outline" className="border-border/50 bg-transparent">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Tips & Recommendations */}
          <Card className="border-border/50 bg-card/50 p-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Interview Tips for This Week</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • Focus on explaining your thought process clearly - this improves scores by 15%
                  </li>
                  <li>
                    • Practice system design questions - your score here is lowest (6.8/10)
                  </li>
                  <li>
                    • Review edge cases after each interview session
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
