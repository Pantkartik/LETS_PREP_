'use client'

import { useEffect, useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
    GraduationCap,
    Users,
    Calendar,
    Search,
    UserPlus,
    ExternalLink,
    UserMinus,
    Loader2,
    Trophy,
    Clock
} from 'lucide-react'
import { getMyClassrooms, leaveClassroom } from '@/lib/actions/student-classes'
import { toast } from 'sonner'
import Link from 'next/link'
import { JoinClassDialog } from '@/components/student/join-class-dialog'
import { motion } from 'framer-motion'

export default function MyClassroomsPage() {
    const [classrooms, setClassrooms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [leavingId, setLeavingId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadClassrooms()
    }, [])

    const loadClassrooms = async () => {
        setLoading(true)
        try {
            const result = await getMyClassrooms()
            if (result.success) {
                setClassrooms(result.classrooms)
            } else {
                toast.error('Failed to load classrooms')
            }
        } catch (error) {
            toast.error('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleLeave = async (classroomId: string, classroomName: string) => {
        if (!confirm(`Are you sure you want to leave "${classroomName}"?`)) return

        setLeavingId(classroomId)
        try {
            const result = await leaveClassroom(classroomId)
            if (result.success) {
                toast.success(result.message)
                setClassrooms(classrooms.filter(c => c.id !== classroomId))
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error('Failed to leave classroom')
        } finally {
            setLeavingId(null)
        }
    }

    const filteredClassrooms = classrooms.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.teacher?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.teacher?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex h-screen bg-background">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-emerald-500 font-semibold tracking-wider uppercase text-sm"
                            >
                                <GraduationCap className="w-4 h-4" />
                                Learning Hub
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-bold tracking-tight"
                            >
                                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">Classrooms</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-muted-foreground text-lg max-w-lg"
                            >
                                Access your enrolled classrooms, join live competitions, and track your progress
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3"
                        >
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                                <Input
                                    placeholder="Search classrooms..."
                                    className="pl-10 w-64 bg-card/40 border-border/40 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all backdrop-blur-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <JoinClassDialog>
                                <Button className="bg-emerald-500 hover:bg-emerald-600 gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    Join Class
                                </Button>
                            </JoinClassDialog>
                        </motion.div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="p-4 bg-card/30 border-border/40 backdrop-blur-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Classes</p>
                                        <p className="text-2xl font-bold mt-1">{classrooms.length}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <GraduationCap className="w-5 h-5 text-emerald-500" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="p-4 bg-card/30 border-border/40 backdrop-blur-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Now</p>
                                        <p className="text-2xl font-bold mt-1">0</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <Trophy className="w-5 h-5 text-green-500" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="p-4 bg-card/30 border-border/40 backdrop-blur-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Teachers</p>
                                        <p className="text-2xl font-bold mt-1">{new Set(classrooms.map(c => c.teacher_id)).size}</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <Users className="w-5 h-5 text-blue-500" />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Classrooms Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-64" />
                            ))}
                        </div>
                    ) : filteredClassrooms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredClassrooms.map((classroom, i) => (
                                <motion.div
                                    key={classroom.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Card className="relative overflow-hidden border-border/40 bg-card/40 backdrop-blur-xl group hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all h-full flex flex-col">
                                        <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[80px] bg-gradient-to-br from-emerald-500/20 to-teal-500/20 opacity-30 group-hover:opacity-60 transition-opacity" />

                                        <div className="p-6 relative z-10 space-y-4 flex-1">
                                            <div className="flex justify-between items-start">
                                                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                                    <GraduationCap className="w-6 h-6 text-emerald-500" />
                                                </div>
                                                <Badge variant="outline" className="text-xs border-emerald-500/20 text-emerald-500">
                                                    {classroom.difficulty}
                                                </Badge>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold group-hover:text-emerald-500 transition-colors line-clamp-1">
                                                    {classroom.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                    <Users className="w-3 h-3" />
                                                    {classroom.teacher?.full_name || classroom.teacher?.username || 'Unknown Teacher'}
                                                </p>
                                            </div>

                                            {classroom.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {classroom.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                <span>Code: <span className="font-mono font-bold text-foreground">{classroom.invite_code}</span></span>
                                            </div>
                                        </div>

                                        <div className="p-4 border-t border-white/5 bg-white/5 flex gap-2">
                                            <Link href={`/classes/${classroom.id}`} className="flex-1">
                                                <Button className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 text-xs font-medium uppercase tracking-wider group/btn">
                                                    <ExternalLink className="w-3 h-3 mr-1 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                    Enter Classroom
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                onClick={() => handleLeave(classroom.id, classroom.name)}
                                                disabled={leavingId === classroom.id}
                                            >
                                                {leavingId === classroom.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <UserMinus className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-16 text-center border-dashed border-2">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/20">
                                <GraduationCap className="w-10 h-10 text-emerald-500 opacity-50" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">
                                {searchQuery ? 'No classrooms found' : 'No classrooms yet'}
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                {searchQuery
                                    ? 'Try adjusting your search or join a new classroom'
                                    : 'Get started by joining a classroom using an invite code from your teacher'
                                }
                            </p>
                            {searchQuery ? (
                                <Button variant="outline" onClick={() => setSearchQuery('')}>
                                    Clear Search
                                </Button>
                            ) : (
                                <JoinClassDialog>
                                    <Button className="bg-emerald-500 hover:bg-emerald-600 gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        Join Your First Class
                                    </Button>
                                </JoinClassDialog>
                            )}
                        </Card>
                    )}
                </div>
            </main>
        </div>
    )
}
