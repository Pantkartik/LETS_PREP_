'use client';

import React from "react"

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useRef } from 'react';
import {
  User,
  Mail,
  MapPin,
  Link as LinkIcon,
  Trophy,
  Flame,
  Zap,
  Calendar,
  Edit2,
  Share2,
  Upload,
  Download,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const userStats = [
  { label: 'Ranking', value: '#127', icon: Trophy },
  { label: 'Current Streak', value: '12 Days', icon: Flame },
  { label: 'Total XP', value: '32,450', icon: Zap },
  { label: 'Member Since', value: 'Jan 2023', icon: Calendar },
];

const achievements = [
  { id: 1, name: 'First Blood', description: 'Won your first battle', unlocked: true },
  { id: 2, name: 'Week Warrior', description: 'Maintained a 7-day streak', unlocked: true },
  { id: 3, name: 'Century Club', description: 'Solved 100 problems', unlocked: true },
  { id: 4, name: 'Interview Master', description: 'Completed 10 interviews', unlocked: true },
  { id: 5, name: 'Legend', description: 'Reached #1 in leaderboards', unlocked: false },
  { id: 6, name: 'Tournament Winner', description: 'Won a tournament', unlocked: false },
];

const badges = [
  { id: 1, name: 'Early Adopter', date: 'Jan 2023' },
  { id: 2, name: 'DSA Master', date: 'Mar 2023' },
  { id: 3, name: 'Interview Ace', date: 'May 2023' },
  { id: 4, name: 'Community Star', date: 'Jul 2023' },
  { id: 5, name: 'Consistent Solver', date: 'Aug 2023' },
];

export default function ProfilePage() {
  const [avatarUrl, setAvatarUrl] = useState('https://github.com/shadcn.png');
  const [userName, setUserName] = useState('johndoe');
  const [fullName, setFullName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@email.com');
  const [location, setLocation] = useState('San Francisco, USA');
  const [bio, setBio] = useState('Passionate software engineer preparing for FAANG interviews.');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadProgress = () => {
    const progressData = {
      username: userName,
      fullName: fullName,
      email: email,
      stats: {
        ranking: '#127',
        streak: '12 Days',
        totalXP: '32,450',
        memberSince: 'Jan 2023',
      },
      achievements: achievements.filter(a => a.unlocked),
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(progressData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `progress-${userName}-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      console.log('Account deletion initiated for:', userName);
      window.location.href = '/login';
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Header with Avatar */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-primary/30">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/20 text-2xl">{getInitials(fullName)}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center border-2 border-background transition-colors"
                >
                  <Upload className="w-4 h-4 text-primary-foreground" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{fullName}</h1>
                <p className="text-muted-foreground">Software Engineer | Interview Prep Expert</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge className="bg-accent/20 text-accent border-accent/30">@{userName}</Badge>
                  <Badge variant="outline" className="border-border/50">
                    <MapPin className="w-3 h-3 mr-1" />
                    {location}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-border/50 gap-2 bg-transparent">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
              <Button variant="outline" className="border-border/50 gap-2 bg-transparent">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {userStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border-border/50 bg-card/50 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-card/50 border border-border/30">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* About Section */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-border/50 bg-card/50 p-6">
                    <h3 className="text-lg font-bold mb-4">About</h3>
                    <p className="text-muted-foreground">
                      Passionate software engineer preparing for FAANG interviews. I love solving algorithmic problems and sharing knowledge with the community. Currently focused on System Design and Advanced Data Structures.
                    </p>
                  </Card>

                  <Card className="border-border/50 bg-card/50 p-6">
                    <h3 className="text-lg font-bold mb-4">Bio Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-semibold">john.doe@email.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-semibold">San Francisco, USA</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <LinkIcon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Website</p>
                          <p className="font-semibold text-primary hover:underline cursor-pointer">
                            johndoe.dev
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-border/50 bg-card/50 p-6">
                    <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="pb-4 border-b border-border/30 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">Won battle against CodeNinja23</p>
                              <p className="text-sm text-muted-foreground">
                                Problem: Two Sum in {i + 1} minutes
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">{i} hours ago</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Badges Sidebar */}
                <Card className="border-border/50 bg-card/50 p-6 h-fit">
                  <h3 className="text-lg font-bold mb-4">Latest Badges</h3>
                  <div className="space-y-3">
                    {badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="p-3 rounded-lg bg-card/50 border border-border/30"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-4 h-4 text-accent" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{badge.name}</p>
                            <p className="text-xs text-muted-foreground">{badge.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="text-lg font-bold mb-6">Achievements Unlocked</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-6 rounded-lg border ${
                        achievement.unlocked
                          ? 'border-accent/30 bg-accent/10'
                          : 'border-border/30 bg-card/50 opacity-60'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 bg-accent/20">
                        <Trophy className="w-6 h-6 text-accent" />
                      </div>
                      <h4 className="font-semibold">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                      {achievement.unlocked && (
                        <Badge className="mt-3 bg-accent/20 text-accent border-accent/30">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="text-lg font-bold mb-4">Achievement Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold">Legend</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                    <div className="w-full bg-card rounded-full h-2">
                      <div className="bg-accent rounded-full h-2" style={{ width: '78%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Reach rank #1 globally</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold">Tournament Winner</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                    <div className="w-full bg-card rounded-full h-2">
                      <div className="bg-primary rounded-full h-2" style={{ width: '45%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Win a tournament</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {/* Profile Information */}
              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="text-lg font-bold mb-6">Profile Information</h3>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-card/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value.toLowerCase())}
                        className="bg-card/50 border-border/50"
                        prefix="@"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-card/50 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="bg-card/50 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="bg-card/50 border-border/50 min-h-24"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
                </div>
              </Card>

              {/* Avatar Management */}
              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="text-lg font-bold mb-6">Avatar</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20 border-2 border-primary/30">
                      <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/20">{getInitials(fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Upload a new avatar (JPG, PNG, GIF)</p>
                      <Button 
                        variant="outline" 
                        className="border-border/50 bg-transparent gap-2"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Download & Export */}
              <Card className="border-border/50 bg-card/50 p-6 border-primary/30">
                <h3 className="text-lg font-bold mb-4 text-primary">Data & Export</h3>
                <p className="text-muted-foreground mb-4">Download your progress data, achievements, and statistics as a JSON file.</p>
                <Button 
                  onClick={handleDownloadProgress}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Download className="w-4 h-4" />
                  Download My Progress
                </Button>
              </Card>

              {/* Privacy & Notifications */}
              <Card className="border-border/50 bg-card/50 p-6">
                <h3 className="text-lg font-bold mb-6">Privacy & Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/30">
                    <div>
                      <p className="font-semibold">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates on activity</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-border/50 bg-transparent">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/30">
                    <div>
                      <p className="font-semibold">Profile Visibility</p>
                      <p className="text-sm text-muted-foreground">Other users can see your profile</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30">Public</Badge>
                  </div>
                </div>
              </Card>

              {/* Delete Account Section */}
              <Card className="border-red-500/30 bg-red-950/10 p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2 text-red-400">Danger Zone</h3>
                    <p className="text-muted-foreground mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    {showDeleteConfirm ? (
                      <div className="space-y-3 p-4 rounded-lg bg-red-950/30 border border-red-500/50">
                        <p className="font-semibold text-red-300">Are you sure you want to delete your account?</p>
                        <p className="text-sm text-muted-foreground">
                          This will permanently delete your account and all progress. Type your username to confirm.
                        </p>
                        <div className="flex gap-3">
                          <Button 
                            variant="destructive" 
                            onClick={handleDeleteAccount}
                            className="gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Yes, Delete My Account
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="border-border/50 bg-transparent"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
