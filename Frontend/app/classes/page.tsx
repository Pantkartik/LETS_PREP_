'use client';

import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Users,
    Trophy,
    BookOpen,
    BarChart3,
    Search,
    Plus,
    Calendar,
    ChevronRight,
    GraduationCap,
    MoreVertical,
    Trash2,
    Loader2,
    UserPlus
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';
import { CreateClassDialog } from '@/components/teacher/create-class-dialog';
import { getTeacherClasses, deleteClassroom } from '@/lib/actions/teacher-classes';
import { getTeacherGameRooms } from '@/lib/actions/teacher-competitions';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ClassesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [classes, setClasses] = useState<any[]>([]);
    const [activeSessionsCount, setActiveSessionsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [classesData, roomsData] = await Promise.all([
                getTeacherClasses(),
                getTeacherGameRooms()
            ]);

            setClasses(classesData);

            // Count rooms that are strictly ACTIVE (matching dashboard logic)
            const activeCount = roomsData.filter((r: any) => r.status === 'ACTIVE').length;
            setActiveSessionsCount(activeCount);
        } catch (error) {
            console.error('Error loading classes data:', error);
            toast.error('Failed to sync classroom data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this class? All student associations will be removed.')) return;

        setDeletingId(id);
        const result = await deleteClassroom(id);

        if (result.success) {
            toast.success('Class deleted successfully');
            setClasses(classes.filter(c => c.id !== id));
        } else {
            toast.error(result.error || 'Failed to delete class');
        }
        setDeletingId(null);
    };

    const filteredClasses = classes.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Dynamic stats calculation
    const totalStudents = classes.reduce((acc, curr) => acc + (curr.student_count || 0), 0);
    const avgSuccess = classes.length > 0 ? (classes.reduce((acc, curr) => acc + (curr.avgPerformance || 0), 0) / classes.length).toFixed(0) : '0';

    return (
        <div className="flex h-screen bg-background text-foreground">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/5 via-background to-background">
                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-amber-500 font-semibold tracking-wider uppercase text-sm"
                            >
                                <GraduationCap className="w-4 h-4" />
                                Education Management
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-bold tracking-tight"
                            >
                                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">Classrooms</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-muted-foreground text-lg max-w-lg"
                            >
                                Manage your student groups, track collective progress, and orchestrate learning experiences.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3"
                        >
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
                                <Input
                                    placeholder="Search classes..."
                                    className="pl-10 w-64 bg-card/40 border-border/40 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all backdrop-blur-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <CreateClassDialog onSuccess={loadData} />
                        </motion.div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Students', value: totalStudents.toString(), icon: Users, color: 'text-blue-400' },
                            { label: 'Total Classes', value: classes.length.toString(), icon: Trophy, color: 'text-amber-400' },
                            { label: 'Active Sessions', value: activeSessionsCount.toString(), icon: BookOpen, color: 'text-emerald-400' },
                            { label: 'Avg Success Rate', value: `${avgSuccess}%`, icon: BarChart3, color: 'text-purple-400' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="p-4 bg-card/30 border-border/40 backdrop-blur-md flex items-center justify-between group hover:border-amber-500/30 transition-all cursor-default">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-2xl font-bold mt-1 group-hover:scale-110 transition-transform origin-left">{stat.value}</p>
                                    </div>
                                    <div className={`p-2 rounded-lg bg-background/50 border border-white/5 ${stat.color}`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Classes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <Card key={i} className="h-64 border-border/40 bg-card/40 animate-pulse" />
                            ))
                        ) : filteredClasses.length > 0 ? (
                            filteredClasses.map((classroom, i) => (
                                <motion.div
                                    key={classroom.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -5 }}
                                    layout
                                >
                                    <Card className={`relative overflow-hidden border-border/40 bg-card/40 backdrop-blur-xl group hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all h-full flex flex-col`}>
                                        <div className={`absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[80px] bg-gradient-to-br from-amber-500/20 to-orange-500/20 opacity-30 group-hover:opacity-60 transition-opacity`} />

                                        <div className="p-6 relative z-10 space-y-4 flex-1">
                                            <div className="flex justify-between items-start">
                                                <div className={`p-2 rounded-xl bg-background/60 border border-white/10`}>
                                                    <GraduationCap className="w-6 h-6 text-amber-500" />
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-card/90 backdrop-blur-lg border-white/10">
                                                        <DropdownMenuItem className="focus:bg-white/5">Edit Details</DropdownMenuItem>
                                                        <DropdownMenuItem className="focus:bg-white/5">View Analytics</DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="focus:bg-red-500/10 text-red-500 focus:text-red-500"
                                                            onClick={() => handleDelete(classroom.id)}
                                                            disabled={deletingId === classroom.id}
                                                        >
                                                            {deletingId === classroom.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                                            Delete Class
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold group-hover:text-amber-500 transition-colors line-clamp-1">{classroom.name}</h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Code: <span className="font-mono font-bold text-foreground">{classroom.invite_code}</span>
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Students</p>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-blue-400" />
                                                        <span className="font-bold">{classroom.student_count}</span>
                                                        <span className="text-[10px] text-muted-foreground">/ {classroom.max_students}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Difficulty</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px] border-amber-500/20 text-amber-500">
                                                            {classroom.difficulty}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 border-t border-white/5 bg-white/5 flex gap-2">
                                            <Link href={`/classes/${classroom.id}`} className="flex-1">
                                                <Button variant="ghost" className="w-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium uppercase tracking-wider">
                                                    View Students
                                                </Button>
                                            </Link>
                                            <Link href={`/classes/${classroom.id}`} className="flex-1">
                                                <Button className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-xs font-medium uppercase tracking-wider group/btn">
                                                    Manage
                                                    <ChevronRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto border border-dashed border-border/50">
                                    <Users className="w-10 h-10 text-muted-foreground opacity-20" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">No classrooms found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search or create a new student group.</p>
                                </div>
                                <Button variant="outline" onClick={() => setSearchQuery('')}>Clear search</Button>
                            </div>
                        )}

                        {!loading && filteredClasses.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                whileHover={{ y: -5 }}
                            >
                                <CreateClassDialog onSuccess={loadData}>
                                    <Card className="h-full border-2 border-dashed border-border/40 bg-transparent flex flex-col items-center justify-center p-8 group hover:border-amber-500/50 transition-all cursor-pointer min-h-[250px]">
                                        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <UserPlus className="w-8 h-8 text-amber-500" />
                                        </div>
                                        <h3 className="mt-4 font-bold text-lg">Create New Class</h3>
                                        <p className="text-sm text-center text-muted-foreground mt-2 px-6">
                                            Start a new student cohort and begin tracking their success.
                                        </p>
                                    </Card>
                                </CreateClassDialog>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

