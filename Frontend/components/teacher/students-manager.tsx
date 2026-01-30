'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, TrendingUp, BarChart3, Eye, ArrowLeft, Trophy } from 'lucide-react'
import ActivityHeatmap from '@/components/activity-heatmap'
import { getStudentStats } from '@/lib/actions/teacher-students'
import { toast } from 'sonner' // Assuming sonner

interface StudentProfile {
    id: string
    name: string | null
    email: string
    created_at: string
    avatar_url?: string | null
    role?: string
}

interface StudentsManagerProps {
    initialStudents: StudentProfile[]
}

interface StudentStats {
    profile: StudentProfile
    stats: {
        problemsSolved: number
        competitionsJoined: number
        xp: number
        level: number
    }
    recentActivity: any[]
}

export default function StudentsManager({ initialStudents }: StudentsManagerProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

    // Detailed Data State
    const [studentDetails, setStudentDetails] = useState<StudentStats | null>(null)
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [heatmapData, setHeatmapData] = useState<any[]>([])

    // Derived State
    const filteredStudents = initialStudents.filter(student =>
    (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const handleViewDetails = async (id: string) => {
        try {
            setLoadingDetails(true)
            setSelectedStudentId(id)

            // 1. Fetch Stats
            const data = await getStudentStats(id)

            if (!data) {
                toast.error("Could not fetch student details")
                setSelectedStudentId(null)
                return
            }

            setStudentDetails(data as any)

            // 2. Fetch Heatmap (Reusing the public analytics action)
            // In a real app, I'd fetch this from getStudentStats or separate call
            // For now, mocking heatmap data based on activity
            // TODO: Connect to getUserActivity(id) logic

            // Mock heatmap since we don't have separate endpoint exposed yet here
            setHeatmapData(generateMockHeatmap())

        } catch (error) {
            toast.error("Error loading student details")
        } finally {
            setLoadingDetails(false)
        }
    }

    const generateMockHeatmap = () => {
        // Just for visual until we hook up full activity log aggregation
        return Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 8)
        }))
    }

    // --- DETAIL VIEW ---
    if (selectedStudentId && studentDetails) {
        return (
            <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => setSelectedStudentId(null)} className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to List
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{studentDetails.profile.name || 'Unknown Student'}</h1>
                            <p className="text-muted-foreground">{studentDetails.profile.email}</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border-border/50 bg-card/50 p-6">
                            <p className="text-sm text-muted-foreground">Problems Solved</p>
                            <p className="text-3xl font-bold">{studentDetails.stats.problemsSolved}</p>
                        </Card>
                        <Card className="border-border/50 bg-card/50 p-6">
                            <p className="text-sm text-muted-foreground">Competitions</p>
                            <p className="text-3xl font-bold">{studentDetails.stats.competitionsJoined}</p>
                        </Card>
                        <Card className="border-border/50 bg-card/50 p-6">
                            <p className="text-sm text-muted-foreground">XP Earned</p>
                            <p className="text-3xl font-bold text-primary">{studentDetails.stats.xp}</p>
                        </Card>
                        <Card className="border-border/50 bg-card/50 p-6">
                            <p className="text-sm text-muted-foreground">Level</p>
                            <p className="text-3xl font-bold text-accent">{studentDetails.stats.level}</p>
                        </Card>
                    </div>

                    {/* Heatmap */}
                    <ActivityHeatmap
                        data={heatmapData}
                        title="Activity Heatmap (Last 30 Days)"
                        maxCount={8}
                    />

                    {/* Recent Activity Log */}
                    <Card className="border-border/50 bg-card/50 p-6">
                        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {studentDetails.recentActivity.length === 0 ? (
                                <p className="text-muted-foreground italic">No recent activity recorded.</p>
                            ) : (
                                studentDetails.recentActivity.map((log: any) => (
                                    <div key={log.id} className="flex items-center justify-between border-b border-border/30 pb-2">
                                        <span className="font-medium capitalize">{log.activity_type.replace('_', ' ').toLowerCase()}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(log.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                </div>
            </div>
        )
    }

    // --- LIST VIEW ---
    return (
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Student Activity Tracking</h1>
                    <div className="text-muted-foreground text-sm">
                        {filteredStudents.length} Students found
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {filteredStudents.length === 0 ? (
                        <Card className="p-12 text-center text-muted-foreground border-border/50">
                            No students found.
                        </Card>
                    ) : (
                        filteredStudents.map(student => (
                            <Card key={student.id} className="p-6 border-border/50 hover:border-primary/50 transition-colors">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {student.name ? student.name.substring(0, 2).toUpperCase() : '??'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{student.name || 'Unnamed Student'}</h3>
                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 text-sm text-muted-foreground w-full md:w-auto justify-between md:justify-end">
                                        <div>
                                            Joined: {new Date(student.created_at).toLocaleDateString()}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(student.id)}
                                            className="gap-2"
                                        >
                                            <BarChart3 className="w-4 h-4" /> View Analytics
                                        </Button>
                                    </div>

                                </div>
                            </Card>
                        ))
                    )}
                </div>

            </div>
        </div>
    )
}
