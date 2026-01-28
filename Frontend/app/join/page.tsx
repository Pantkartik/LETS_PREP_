'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Code, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function JoinCompetitionPage() {
  const [inviteCode, setInviteCode] = useState('');
  const [competitionData, setCompetitionData] = useState<any>(null);
  const [joinStatus, setJoinStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearchCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      if (inviteCode.includes('dsc')) {
        setCompetitionData({
          name: 'Data Structures Challenge',
          description: 'Master arrays, linked lists, and trees in this interactive challenge.',
          difficulty: 'Intermediate',
          startTime: '2024-01-28T10:00:00',
          endTime: '2024-01-29T10:00:00',
          participants: 24,
          maxParticipants: 50,
          createdBy: 'Dr. Smith',
          topics: ['Arrays', 'Linked Lists', 'Trees', 'Hashing'],
        });
        setJoinStatus('idle');
      } else if (inviteCode.includes('algo')) {
        setCompetitionData({
          name: 'Algorithms Showdown',
          description: 'Solve complex algorithmic problems and compete with peers.',
          difficulty: 'Advanced',
          startTime: '2024-01-30T14:00:00',
          endTime: '2024-01-31T14:00:00',
          participants: 18,
          maxParticipants: 40,
          createdBy: 'Prof. Johnson',
          topics: ['Dynamic Programming', 'Graphs', 'Sorting', 'Greedy'],
        });
        setJoinStatus('idle');
      } else {
        setErrorMessage('Competition not found. Please check your invite code.');
        setJoinStatus('error');
      }
    }, 1000);
  };

  const handleJoinCompetition = () => {
    setJoinStatus('loading');
    setTimeout(() => {
      setJoinStatus('success');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <nav className="border-b border-border/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">EduPlatform</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl space-y-8">
          {/* Welcome Section */}
          {!competitionData && joinStatus !== 'success' && (
            <>
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Join a Competition</h1>
                <p className="text-muted-foreground text-lg">Enter your invite code or competition link to get started</p>
              </div>

              {/* Search Form */}
              <Card className="border-border/50 bg-card/50 p-8">
                <form onSubmit={handleSearchCompetition} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Invite Code or Link</label>
                    <input
                      type="text"
                      placeholder="e.g., dsc-2024 or https://eduplatform.com/join/dsc-2024"
                      value={inviteCode}
                      onChange={(e) => {
                        setInviteCode(e.target.value);
                        setErrorMessage('');
                        setCompetitionData(null);
                      }}
                      className="w-full px-4 py-3 bg-background/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  {errorMessage && (
                    <div className="flex gap-3 p-3 bg-destructive/20 border border-destructive/50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{errorMessage}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={joinStatus === 'loading'}
                  >
                    {joinStatus === 'loading' ? 'Searching...' : 'Find Competition'}
                  </Button>
                </form>
              </Card>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-border/50 bg-card/50 p-6">
                  <Users className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Compete with Peers</h3>
                  <p className="text-sm text-muted-foreground">Join live competitions and rank on the leaderboard</p>
                </Card>
                <Card className="border-border/50 bg-card/50 p-6">
                  <Clock className="w-6 h-6 text-accent mb-3" />
                  <h3 className="font-semibold mb-2">Time-Limited Challenges</h3>
                  <p className="text-sm text-muted-foreground">Race against the clock to solve problems first</p>
                </Card>
              </div>
            </>
          )}

          {/* Competition Details */}
          {competitionData && joinStatus !== 'success' && (
            <Card className="border-border/50 bg-card/50 p-8 space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">{competitionData.name}</h2>
                <p className="text-muted-foreground text-lg">{competitionData.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border/30">
                  <div>
                    <p className="text-xs text-muted-foreground">Difficulty</p>
                    <p className={`font-semibold mt-1 ${
                      competitionData.difficulty === 'Intermediate' ? 'text-yellow-400' : 
                      competitionData.difficulty === 'Advanced' ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {competitionData.difficulty}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Participants</p>
                    <p className="font-semibold mt-1">{competitionData.participants} / {competitionData.maxParticipants}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-semibold mt-1">24 hours</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created By</p>
                    <p className="font-semibold mt-1">{competitionData.createdBy}</p>
                  </div>
                </div>
              </div>

              {/* Topics */}
              <div className="space-y-3">
                <h3 className="font-semibold">Topics Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {competitionData.topics.map((topic: string) => (
                    <span key={topic} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Join Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCompetitionData(null);
                    setInviteCode('');
                  }}
                  className="flex-1 border-border/50 bg-transparent"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleJoinCompetition}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={joinStatus === 'loading'}
                >
                  {joinStatus === 'loading' ? 'Joining...' : 'Join Competition'}
                </Button>
              </div>
            </Card>
          )}

          {/* Success State */}
          {joinStatus === 'success' && (
            <Card className="border-border/50 bg-card/50 p-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Welcome to the Competition!</h2>
                <p className="text-muted-foreground">You've successfully joined. Redirecting to dashboard...</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
