'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Code, Plus, Copy, Users, Clock, Trophy, Trash2, Edit2, Share2 } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard-sidebar';

interface Competition {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  startTime: string;
  endTime: string;
  participants: number;
  maxParticipants: number;
  inviteLink: string;
  createdBy: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([
    {
      id: '1',
      name: 'Data Structures Challenge',
      description: 'Master arrays, linked lists, and trees',
      status: 'active',
      startTime: '2024-01-28T10:00:00',
      endTime: '2024-01-29T10:00:00',
      participants: 24,
      maxParticipants: 50,
      inviteLink: 'https://eduplatform.com/join/dsc-2024',
      createdBy: 'Dr. Smith',
      difficulty: 'intermediate',
    },
    {
      id: '2',
      name: 'Algorithms Showdown',
      description: 'Solve complex algorithmic problems',
      status: 'active',
      startTime: '2024-01-30T14:00:00',
      endTime: '2024-01-31T14:00:00',
      participants: 18,
      maxParticipants: 40,
      inviteLink: 'https://eduplatform.com/join/algo-2024',
      createdBy: 'Prof. Johnson',
      difficulty: 'advanced',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'intermediate' as const,
    maxParticipants: 50,
  });

  const handleCreateCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newCompetition: Competition = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      status: 'draft',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      participants: 0,
      maxParticipants: formData.maxParticipants,
      inviteLink: `https://eduplatform.com/join/${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      createdBy: 'You',
      difficulty: formData.difficulty,
    };

    setCompetitions([newCompetition, ...competitions]);
    setFormData({ name: '', description: '', difficulty: 'intermediate', maxParticipants: 50 });
    setShowModal(false);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleDeleteCompetition = (id: string) => {
    setCompetitions(competitions.filter((c) => c.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-blue-400';
      case 'intermediate':
        return 'text-yellow-400';
      default:
        return 'text-red-400';
    }
  };

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
              <h1 className="text-2xl font-bold">Competitions</h1>
            </div>
            <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90 flex gap-2">
              <Plus className="w-4 h-4" />
              Create Competition
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="border-border/50 bg-card/50 p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Active Competitions</p>
                  <p className="text-3xl font-bold">{competitions.filter((c) => c.status === 'active').length}</p>
                </div>
              </Card>
              <Card className="border-border/50 bg-card/50 p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                  <p className="text-3xl font-bold">{competitions.reduce((sum, c) => sum + c.participants, 0)}</p>
                </div>
              </Card>
              <Card className="border-border/50 bg-card/50 p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold">{competitions.filter((c) => c.status === 'completed').length}</p>
                </div>
              </Card>
            </div>

            {/* Competition List */}
            <div className="space-y-4">
              {competitions.length === 0 ? (
                <Card className="border-border/50 bg-card/50 p-12 text-center">
                  <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No competitions yet</h3>
                  <p className="text-muted-foreground mb-6">Create your first competition to get started</p>
                  <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90">
                    Create Competition
                  </Button>
                </Card>
              ) : (
                competitions.map((competition) => (
                  <Card key={competition.id} className="border-border/50 bg-card/50 p-6 hover:border-border transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start mb-4">
                      <div className="md:col-span-2">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold">{competition.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(competition.status)}`}>
                            {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">{competition.description}</p>
                        <div className="mt-3 flex gap-3 text-sm">
                          <span className={`font-semibold ${getDifficultyColor(competition.difficulty)}`}>
                            {competition.difficulty.charAt(0).toUpperCase() + competition.difficulty.slice(1)}
                          </span>
                          <span className="text-muted-foreground">by {competition.createdBy}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{competition.participants} / {competition.maxParticipants} participants</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-accent" />
                          <span>Ends {new Date(competition.endTime).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 md:justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(competition.inviteLink)}
                          className="border-border/50 bg-transparent flex gap-1"
                        >
                          <Share2 className="w-4 h-4" />
                          {copiedLink === competition.inviteLink ? 'Copied!' : 'Share'}
                        </Button>
                        <Button variant="outline" size="sm" className="border-border/50 bg-transparent">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCompetition(competition.id)}
                          className="border-border/50 bg-transparent hover:border-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Invite Link */}
                    <div className="bg-background/50 rounded p-3 flex items-center gap-2">
                      <Input
                        value={competition.inviteLink}
                        readOnly
                        className="bg-transparent border-0 text-sm text-muted-foreground"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleCopyLink(competition.inviteLink)}
                        variant="ghost"
                        className="text-primary hover:bg-primary/10"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Competition Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="border-border/50 bg-card p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Create Competition</h2>

            <form onSubmit={handleCreateCompetition} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Competition Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Data Structures Challenge"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background/50 border-border/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="What is this competition about?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                  className="bg-background/50 border-border/50"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border-border/50 bg-transparent"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                  Create
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
