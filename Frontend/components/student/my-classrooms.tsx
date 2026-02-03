'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    GraduationCap,
    Users,
    Calendar,
    ExternalLink,
    UserMinus,
    Loader2
} from 'lucide-react'
import { getMyClassrooms, leaveClassroom } from '@/lib/actions/student-classes'
import { toast } from 'sonner'
import Link from 'next/link'
import { JoinClassDialog } from './join-class-dialog'

export function MyClassrooms() {
    const [classrooms, setClassrooms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [leavingId, setLeavingId] = useState<string | null>(null)

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

    if (loading) {
        return (
            <Card className="border-border/50 bg-card/50 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">My Classrooms</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </Card>
        )
    }

    return (
        <Card className="border-border/50 bg-card/50 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    My Classrooms
                </h3>
                <JoinClassDialog>
                    <Button size="sm" variant="outline" className="gap-2">
                        <Users className="w-4 h-4" />
                        Join Class
                    </Button>
                </JoinClassDialog>
            </div>

            {classrooms.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                        <GraduationCap className="w-8 h-8 text-muted-foreground opacity-50" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-1">No classrooms yet</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Join a classroom to start learning with your teacher and classmates
                        </p>
                        <JoinClassDialog>
                            <Button className="gap-2">
                                <Users className="w-4 h-4" />
                                Join Your First Class
                            </Button>
                        </JoinClassDialog>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {classrooms.map((classroom: any) => (
                        <div
                            key={classroom.id}
                            className="flex items-start justify-between p-4 rounded-lg bg-card/50 border border-border/30 hover:border-border/50 transition-all group"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold group-hover:text-primary transition-colors">
                                        {classroom.name}
                                    </h4>
                                    <Badge
                                        variant="outline"
                                        className="text-xs border-primary/30 text-primary"
                                    >
                                        {classroom.difficulty}
                                    </Badge>
                                </div>

                                {classroom.description && (
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                        {classroom.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        <span>Teacher: {classroom.teacher?.full_name || classroom.teacher?.username || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>Code: {classroom.invite_code}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                                <Link href={`/classes/${classroom.id}`}>
                                    <Button size="sm" variant="ghost" className="gap-1">
                                        <ExternalLink className="w-3 h-3" />
                                        View
                                    </Button>
                                </Link>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                    onClick={() => handleLeave(classroom.id, classroom.name)}
                                    disabled={leavingId === classroom.id}
                                >
                                    {leavingId === classroom.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <UserMinus className="w-3 h-3" />
                                    )}
                                    Leave
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}
