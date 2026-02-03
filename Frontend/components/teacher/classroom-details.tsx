'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Trophy,
    BookOpen,
    BarChart3,
    Search,
    Filter,
    ArrowLeft,
    Calendar,
    GraduationCap,
    TrendingUp,
    CheckCircle2,
    Clock,
    UserPlus,
    MoreHorizontal,
    Share2,
    Shield,
    Flame,
    Zap,
    ExternalLink
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase-client';
import { QuickStartCompetition } from './quick-start-competition';
import Link from 'next/link';
import { toast } from 'sonner';

interface ClassroomDetailsProps {
    initialClassroom: any;
    initialStudents: any[];
}

export default function ClassroomDetails({ initialClassroom, initialStudents }: ClassroomDetailsProps) {
    const [students, setStudents] = useState(initialStudents);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('students');
    const supabase = useMemo(() => createClient(), []);

    // Set up real-time subscription for student joins
    useEffect(() => {
        const channel = supabase
            .channel(`classroom-${initialClassroom.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'classroom_students',
                    filter: `classroom_id=eq.${initialClassroom.id}`
                },
                async (payload) => {
                    // Fetch the full profile for the new student
                    const { data: newParticipant, error } = await supabase
                        .from('classroom_students')
                        .select(`
                            *,
                            profile:student_id(
                                id,
                                username,
                                full_name,
                                avatar_url,
                                xp,
                                level,
                                total_battles,
                                total_wins
                            )
                        `)
                        .eq('id', payload.new.id)
                        .single();

                    if (newParticipant && !error) {
                        setStudents(prev => [newParticipant, ...prev]);
                        toast.success(`New student joined: ${newParticipant.profile.full_name || newParticipant.profile.username}`);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [initialClassroom.id]);

    const filteredStudents = students.filter(s =>
    (s.profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.profile.username?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Dynamic stats
    const totalXP = students.reduce((acc, s) => acc + (s.profile.xp || 0), 0);
    const avgLevel = students.length > 0 ? (students.reduce((acc, s) => acc + (s.profile.level || 1), 0) / students.length).toFixed(1) : '1.0';
    const totalWins = students.reduce((acc, s) => acc + (s.profile.total_wins || 0), 0);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
            {/* Breadcrumbs & Navigation */}
            <div className="flex items-center justify-between">
                <Link href="/classes">
                    <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Classrooms
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-white/10 bg-white/5 gap-2">
                        <Share2 className="w-4 h-4" />
                        Invite Link
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="border-white/10 bg-white/5">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-white/10">
                            <DropdownMenuItem>Edit Settings</DropdownMenuItem>
                            <DropdownMenuItem>Export Roster</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">Archive Class</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/30 backdrop-blur-2xl p-8 md:p-12">
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-2xl shadow-amber-500/20">
                        <GraduationCap className="w-12 h-12" />
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase tracking-widest text-[10px] px-3 py-1">
                                {initialClassroom.difficulty}
                            </Badge>
                            <Badge variant="outline" className="bg-white/5 text-muted-foreground border-white/10 text-[10px] px-3 py-1 uppercase tracking-widest">
                                Section {initialClassroom.invite_code}
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                            {initialClassroom.name}
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                            {initialClassroom.description || "Manage your cohort's daily learning, track their competitive progress, and launch live coding battles instantly."}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
                            Live sync enabled <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-1" />
                        </p>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                    {[
                        { label: 'Enrolled', value: students.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                        { label: 'Collective XP', value: totalXP.toLocaleString(), icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                        { label: 'Avg Mastery', value: `Lv. ${avgLevel}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                        { label: 'Global Wins', value: totalWins, icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                    ].map((stat) => (
                        <div key={stat.label} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-white/20 transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                            </div>
                            <div className="mt-3 text-2xl font-black text-white">{stat.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-2">
                    <TabsList className="bg-white/5 border-white/10 p-1 rounded-xl h-auto">
                        <TabsTrigger value="students" className="rounded-lg py-2.5 px-6 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all text-xs font-bold uppercase tracking-widest">
                            <Users className="w-4 h-4 mr-2" />
                            Roster
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="rounded-lg py-2.5 px-6 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all text-xs font-bold uppercase tracking-widest">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Performance
                        </TabsTrigger>
                        <TabsTrigger value="history" className="rounded-lg py-2.5 px-6 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all text-xs font-bold uppercase tracking-widest">
                            <Clock className="w-4 h-4 mr-2" />
                            Battles
                        </TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                        {activeTab === 'students' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-3 w-full md:w-auto"
                            >
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Find student..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-white/5 border-white/10 focus:border-amber-500/50 h-10 rounded-xl"
                                    />
                                </div>
                                <Button variant="outline" size="icon" className="border-white/10 bg-white/5 h-10 w-10">
                                    <Filter className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <TabsContent value="students" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ y: -5 }}
                                    >
                                        <Card className="bg-card/40 border-white/10 p-6 backdrop-blur-xl relative group overflow-hidden h-full">
                                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />

                                            <div className="relative z-10 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-white/10 group-hover:border-amber-500/30 transition-all">
                                                            {item.profile.avatar_url ? (
                                                                <img src={item.profile.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
                                                            ) : (
                                                                <span className="text-xl font-black text-amber-500">
                                                                    {item.profile.full_name?.substring(0, 1) || item.profile.username?.substring(0, 1)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-card rounded-full" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg text-white group-hover:text-amber-500 transition-colors line-clamp-1">
                                                            {item.profile.full_name || item.profile.username}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Flame className="w-3 h-3 text-orange-500" />
                                                            {item.profile.xp} Total XP
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 pt-2">
                                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Level</div>
                                                        <div className="text-xl font-black text-amber-400">{item.profile.level || 1}</div>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Wins</div>
                                                        <div className="text-xl font-black text-purple-400">{item.profile.total_wins || 0}</div>
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <Button variant="ghost" className="w-full bg-white/5 border border-white/5 hover:bg-amber-500/10 hover:text-amber-500 text-[10px] uppercase tracking-widest font-bold">
                                                        View Full Performance
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center border border-dashed border-white/10">
                                        <Users className="w-8 h-8 text-muted-foreground opacity-30" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">No students found</h3>
                                        <p className="text-muted-foreground text-sm">Share the invite code <span className="text-amber-500 font-bold">{initialClassroom.invite_code}</span> with your students.</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </TabsContent>

                <TabsContent value="performance">
                    <Card className="p-12 border-white/10 bg-card/40 text-center space-y-4 backdrop-blur-xl">
                        <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500">
                            <TrendingUp className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Cumulative Performance Insights</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                We are aggregating data from this classroom. Detailed analytics including strength charts and weak areas will appear here shortly.
                            </p>
                        </div>
                        <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8">Generate Report</Button>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <div className="space-y-4">
                        <div className="p-6 rounded-2xl bg-card/40 border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
                            <div className="flex items-center gap-4 text-left w-full md:w-auto">
                                <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center animate-pulse">
                                    <Shield className="w-6 h-6 " />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                                        Live Arena Access
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white animate-bounce">NEW</span>
                                    </h4>
                                    <p className="text-muted-foreground text-xs font-medium">No active battles currently running for this class.</p>
                                </div>
                            </div>
                            <QuickStartCompetition
                                classroomId={initialClassroom.id}
                                className={initialClassroom.name}
                            />
                        </div>

                        {/* Recent History Placeholder */}
                        <div className="grid gap-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between opacity-50 grayscale">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-sm text-white">{initialClassroom.name} Competition #{i}</h5>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">December {15 + i}, 2025 • 45 Participants</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="gap-2 text-xs font-bold uppercase tracking-widest">
                                        Archive Results <ExternalLink className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
