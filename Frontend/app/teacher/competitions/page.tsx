'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Code, Plus, Copy, Users, Clock, Trophy, Trash2, Edit2, Share2, BarChart3, Eye } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard-sidebar';
import ActivityHeatmap from '@/components/activity-heatmap';

interface GameRoom {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  startTime: string;
  endTime: string;
  participants: number;
  maxParticipants: number;
  inviteLink: string;
  topics: string[];
  status: 'draft' | 'active' | 'completed';
}

// Sample heatmap data for student participation in competitions
const gameRoomParticipationHeatmap = [
  // Week 1
  { date: '2024-01-01', count: 3 },
  { date: '2024-01-02', count: 5 },
  { date: '2024-01-03', count: 2 },
  { date: '2024-01-04', count: 4 },
  { date: '2024-01-05', count: 8 },
  { date: '2024-01-06', count: 7 },
  { date: '2024-01-07', count: 1 },
  // Week 2
  { date: '2024-01-08', count: 4 },
  { date: '2024-01-09', count: 6 },
  { date: '2024-01-10', count: 3 },
  { date: '2024-01-11', count: 7 },
  { date: '2024-01-12', count: 6 },
  { date: '2024-01-13', count: 5 },
  { date: '2024-01-14', count: 0 },
  // Week 3
  { date: '2024-01-15', count: 3 },
  { date: '2024-01-16', count: 8 },
  { date: '2024-01-17', count: 4 },
  { date: '2024-01-18', count: 6 },
  { date: '2024-01-19', count: 9 },
  { date: '2024-01-20', count: 8 },
  { date: '2024-01-21', count: 2 },
  // Week 4
  { date: '2024-01-22', count: 5 },
  { date: '2024-01-23', count: 6 },
  { date: '2024-01-24', count: 3 },
  { date: '2024-01-25', count: 7 },
  { date: '2024-01-26', count: 7 },
  { date: '2024-01-27', count: 9 },
  { date: '2024-01-28', count: 4 },
];

export default function TeacherCompetitionsPage() {
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([
    {
      id: '1',
      name: 'Data Structures Battle Royale',
      description: 'Students compete in real-time DSA challenges',
      difficulty: 'intermediate',
      startTime: '2024-01-28T10:00:00',
      endTime: '2024-01-29T10:00:00',
      participants: 24,
      maxParticipants: 50,
      inviteLink: 'https://eduplatform.com/join/dsbr-2024',
      topics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues'],
      status: 'active',
    },
    {
      id: '2',
      name: 'Algorithm Mastery Challenge',
      description: 'Advanced algorithmic problem-solving tournament',
      difficulty: 'advanced',
      startTime: '2024-01-30T14:00:00',
      endTime: '2024-01-31T14:00:00',
      participants: 18,
      maxParticipants: 40,
      inviteLink: 'https://eduplatform.com/join/amc-2024',
      topics: ['DP', 'Graphs', 'Sorting', 'Greedy'],
      status: 'active',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'intermediate' as const,
    maxParticipants: 50,
    topics: '',
  });

  const handleCreateGameRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newRoom: GameRoom = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      difficulty: formData.difficulty,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      participants: 0,
      maxParticipants: formData.maxParticipants,
      inviteLink: `https://eduplatform.com/join/${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      topics: formData.topics.split(',').map((t) => t.trim()),
      status: 'draft',
    };

    setGameRooms([newRoom, ...gameRooms]);
    setFormData({ name: '', description: '', difficulty: 'intermediate', maxParticipants: 50, topics: '' });
    setShowModal(false);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleDeleteRoom = (id: string) => {
    setGameRooms(gameRooms.filter((r) => r.id !== id));
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
              <div>
                <h1 className="text-2xl font-bold">Game Rooms</h1>
                <p className="text-xs text-muted-foreground">Manage competitions and view student participation</p>
              </div>
            </div>
            <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90 flex gap-2">
              <Plus className="w-4 h-4" />
              Create Game Room
            </Button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Participation Heatmap */}
            <ActivityHeatmap 
              data={gameRoomParticipationHeatmap} 
              title="Game Room Participation Heatmap (Last 4 Weeks)" 
              maxCount={9} 
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-border/50 bg-card/50 p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Active Game Rooms</p>
                  <p className="text-3xl font-bold">{gameRooms.filter((r) => r.status === 'active').length}</p>
                </div>
              </Card>
              <Card className="border-border/50 bg-card/50 p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                  <p className="text-3xl font-bold">{gameRooms.reduce((sum, r) => sum + r.participants, 0)}</p>
                </div>
              </Card>
              <Card className="border-border/50 bg-card/50 p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Completed Rooms</p>
                  <p className="text-3xl font-bold">{gameRooms.filter((r) => r.status === 'completed').length}</p>
                </div>
              </Card>
            </div>

            {/* Game Rooms List */}
            <div className="space-y-4">
              {gameRooms.length === 0 ? (
                <Card className="border-border/50 bg-card/50 p-12 text-center">
                  <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No game rooms yet</h3>
                  <p className="text-muted-foreground mb-6">Create your first game room to engage students</p>
                  <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90">
                    Create Game Room
                  </Button>
                </Card>
              ) : (
                gameRooms.map((room) => (
                  <Card key={room.id} className="border-border/50 bg-card/50 p-6 hover:border-border transition-colors">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start mb-4">
                      <div className="md:col-span-2">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold">{room.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">{room.description}</p>
                        
                        {/* Topics */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {room.topics.map((topic) => (
                            <span key={topic} className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{room.participants} / {room.maxParticipants} participants</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-accent" />
                          <span>Ends {new Date(room.endTime).toLocaleDateString()}</span>
                        </div>
                        <div className={`text-sm font-semibold ${getDifficultyColor(room.difficulty)}`}>
                          {room.difficulty.charAt(0).toUpperCase() + room.difficulty.slice(1)}
                        </div>
                      </div>

                      <div className="flex gap-2 md:justify-end md:flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRoom(room)}
                          className="border-border/50 bg-transparent flex gap-1"
                          title="View analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(room.inviteLink)}
                          className="border-border/50 bg-transparent flex gap-1"
                        >
                          <Share2 className="w-4 h-4" />
                          {copiedLink === room.inviteLink ? 'Copied!' : 'Share'}
                        </Button>
                        <Button variant="outline" size="sm" className="border-border/50 bg-transparent">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRoom(room.id)}
                          className="border-border/50 bg-transparent hover:border-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Invite Link */}
                    <div className="bg-background/50 rounded p-3 flex items-center gap-2">
                      <Input
                        value={room.inviteLink}
                        readOnly
                        className="bg-transparent border-0 text-sm text-muted-foreground"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleCopyLink(room.inviteLink)}
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

      {/* Create Game Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="border-border/50 bg-card p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Create Game Room</h2>

            <form onSubmit={handleCreateGameRoom} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Data Structures Battle Royale"
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
                  placeholder="What is this room about?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topics">Topics (comma-separated)</Label>
                <Input
                  id="topics"
                  placeholder="e.g., Arrays, Lists, Trees"
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
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
                  Create Room
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
