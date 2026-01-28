'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Code, Search, TrendingUp, BarChart3, Eye } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard-sidebar';
import ActivityHeatmap from '@/components/activity-heatmap';

interface Student {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  totalProblems: number;
  battlesParticipated: number;
  averageScore: number;
  rank: number;
}

export default function StudentActivityPage() {
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      joinDate: '2024-01-01',
      totalProblems: 156,
      battlesParticipated: 24,
      averageScore: 82,
      rank: 5,
    },
    {
      id: '2',
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      joinDate: '2024-01-05',
      totalProblems: 142,
      battlesParticipated: 20,
      averageScore: 78,
      rank: 12,
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael@example.com',
      joinDate: '2024-01-10',
      totalProblems: 128,
      battlesParticipated: 18,
      averageScore: 75,
      rank: 18,
    },
    {
      id: '4',
      name: 'Emma Davis',
      email: 'emma@example.com',
      joinDate: '2024-01-15',
      totalProblems: 164,
      battlesParticipated: 28,
      averageScore: 85,
      rank: 2,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Sample heatmap data for a student
  const studentHeatmapData = [
    { date: '2024-01-01', count: 3 },
    { date: '2024-01-02', count: 5 },
    { date: '2024-01-03', count: 2 },
    { date: '2024-01-04', count: 4 },
    { date: '2024-01-05', count: 6 },
    { date: '2024-01-06', count: 4 },
    { date: '2024-01-07', count: 0 },
    { date: '2024-01-08', count: 3 },
    { date: '2024-01-09', count: 5 },
    { date: '2024-01-10', count: 2 },
    { date: '2024-01-11', count: 4 },
    { date: '2024-01-12', count: 7 },
    { date: '2024-01-13', count: 5 },
    { date: '2024-01-14', count: 1 },
    { date: '2024-01-15', count: 4 },
    { date: '2024-01-16', count: 6 },
    { date: '2024-01-17', count: 3 },
    { date: '2024-01-18', count: 5 },
    { date: '2024-01-19', count: 7 },
    { date: '2024-01-20', count: 6 },
    { date: '2024-01-21', count: 2 },
    { date: '2024-01-22', count: 4 },
    { date: '2024-01-23', count: 5 },
    { date: '2024-01-24', count: 3 },
    { date: '2024-01-25', count: 5 },
    { date: '2024-01-26', count: 6 },
    { date: '2024-01-27', count: 7 },
    { date: '2024-01-28', count: 4 },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedStudent) {
    return (
      <div className="min-h-screen bg-background text-foreground flex">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <nav className="border-b border-border/30 py-4 sticky top-0 bg-background/50 backdrop-blur z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
                <div>
                  <h1 className="text-2xl font-bold">{selectedStudent.name}</h1>
                  <p className="text-xs text-muted-foreground">{selectedStudent.email}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                selectedStudent.rank <= 10 ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'
              }`}>
                Rank #{selectedStudent.rank}
              </span>
            </div>
          </nav>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border/50 bg-card/50 p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Problems Solved</p>
                    <p className="text-3xl font-bold">{selectedStudent.totalProblems}</p>
                  </div>
                </Card>
                <Card className="border-border/50 bg-card/50 p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Battles Participated</p>
                    <p className="text-3xl font-bold">{selectedStudent.battlesParticipated}</p>
                  </div>
                </Card>
                <Card className="border-border/50 bg-card/50 p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-3xl font-bold">{selectedStudent.averageScore}%</p>
                  </div>
                </Card>
                <Card className="border-border/50 bg-card/50 p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="text-lg font-bold">{new Date(selectedStudent.joinDate).toLocaleDateString()}</p>
                  </div>
                </Card>
              </div>

              {/* Activity Heatmap */}
              <ActivityHeatmap 
                data={studentHeatmapData} 
                title={`${selectedStudent.name}'s Activity Heatmap (Last 4 Weeks)`} 
                maxCount={7} 
              />

              {/* Insights */}
              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="text-lg font-bold mb-4">Activity Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <p className="text-sm font-semibold">Consistent Engagement</p>
                    </div>
                    <p className="text-sm text-muted-foreground">High daily activity with minimal gaps</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-accent" />
                      <p className="text-sm font-semibold">Above Average</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Scoring better than 78% of peers</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <p className="text-sm font-semibold">Trending Up</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Recent performance improving steadily</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <nav className="border-b border-border/30 py-4 sticky top-0 bg-background/50 backdrop-blur z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">Student Activity</h1>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card/50 border-border/50"
              />
            </div>

            {/* Students List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="border-border/50 bg-card/50 p-6 hover:border-border transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-bold">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">Joined {new Date(student.joinDate).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Problems</p>
                        <p className="font-bold text-lg">{student.totalProblems}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Battles</p>
                        <p className="font-bold text-lg">{student.battlesParticipated}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Score</p>
                        <p className="font-bold text-lg">{student.averageScore}%</p>
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-sm font-semibold text-center ${
                      student.rank <= 10 ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'
                    }`}>
                      Rank #{student.rank}
                    </div>

                    <div className="flex gap-2 md:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudent(student)}
                        className="border-border/50 bg-transparent flex gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View Heatmap
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <Card className="border-border/50 bg-card/50 p-12 text-center">
                <p className="text-muted-foreground">No students found matching your search</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
