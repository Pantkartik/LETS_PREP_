'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    GraduationCap,
    Users,
    Trophy,
    Clock,
    Play,
    AlertCircle,
    CheckCircle2,
    Code,
    ArrowLeft,
    Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { toast } from 'sonner'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Competition {
    id: string
    title: string
    description: string
    status: string
    is_active: boolean
    started_at: string | null
    ended_at: string | null
    duration_minutes: number
    selected_problems: string[]
}

interface Problem {
    id: string
    title: string
    difficulty: string
    points: number
    solved?: boolean
}

export default function StudentClassroomView() {
    const params = useParams()
    const router = useRouter()
    const classroomId = params.id as string
    const supabase = createClient()

    const [classroom, setClassroom] = useState<any>(null)
    const [competitions, setCompetitions] = useState<Competition[]>([])
    const [activeCompetition, setActiveCompetition] = useState<Competition | null>(null)
    const [problems, setProblems] = useState<Problem[]>([])
    const [participants, setParticipants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<string>('')

    useEffect(() => {
        loadClassroomData()
        const cleanup = setupRealtimeSubscriptions()
        return cleanup
    }, [classroomId])

    // Timer for active competition
    useEffect(() => {
        if (!activeCompetition?.started_at) return

        const timer = setInterval(() => {
            const remaining = calculateTimeRemaining(
                activeCompetition.started_at!,
                activeCompetition.duration_minutes
            )
            setTimeRemaining(remaining)
        }, 1000)

        return () => clearInterval(timer)
    }, [activeCompetition])

    const loadClassroomData = async () => {
        setLoading(true)
        setError(null)

        try {
            // Load classroom details
            const { data: classData, error: classError } = await supabase
                .from('classrooms')
                .select(`
                    *,
                    teacher:teacher_id(
                        id,
                        username,
                        full_name
                    )
                `)
                .eq('id', classroomId)
                .single()

            if (classError) throw classError
            setClassroom(classData)

            // Load competitions for this classroom
            const { data: compsData, error: compsError } = await supabase
                .from('competitions')
                .select('*')
                .eq('classroom_id', classroomId)
                .order('created_at', { ascending: false })

            if (compsError) throw compsError
            setCompetitions(compsData || [])

            // Find active competition
            const active = compsData?.find(c => c.is_active && c.status === 'ACTIVE')
            if (active) {
                setActiveCompetition(active)
                await loadCompetitionDetails(active.id)
            }

        } catch (err: any) {
            console.error('Error loading classroom:', err)
            setError(err.message || 'Failed to load classroom')
            toast.error('Failed to load classroom data')
        } finally {
            setLoading(false)
        }
    }

    const loadCompetitionDetails = async (competitionId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Load problems for the competition
            const { data: comp } = await supabase
                .from('competitions')
                .select('selected_problems')
                .eq('id', competitionId)
                .single()

            if (comp?.selected_problems && comp.selected_problems.length > 0) {
                const { data: problemsData } = await supabase
                    .from('problems')
                    .select('*')
                    .in('id', comp.selected_problems)

                // Check which problems the user has solved
                const { data: participant } = await supabase
                    .from('competition_participants')
                    .select('id')
                    .eq('competition_id', competitionId)
                    .eq('user_id', user.id)
                    .single()

                if (participant) {
                    const { data: submissions } = await supabase
                        .from('competition_submissions')
                        .select('problem_id')
                        .eq('participant_id', participant.id)
                        .eq('status', 'ACCEPTED')

                    const solvedIds = new Set(submissions?.map(s => s.problem_id) || [])

                    const problemsWithStatus = problemsData?.map(p => ({
                        ...p,
                        solved: solvedIds.has(p.id)
                    })) || []

                    setProblems(problemsWithStatus)
                }
            }

            // Load participants/leaderboard
            const { data: participantsData } = await supabase
                .from('competition_participants')
                .select(`
                    *,
                    user:user_id(
                        id,
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .eq('competition_id', competitionId)
                .order('rank_position', { ascending: true })

            setParticipants(participantsData || [])

        } catch (err) {
            console.error('Error loading competition details:', err)
        }
    }

    const setupRealtimeSubscriptions = () => {
        // Subscribe to competition changes
        const competitionChannel = supabase
            .channel(`classroom-${classroomId}-competitions`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'competitions',
                    filter: `classroom_id=eq.${classroomId}`
                },
                (payload) => {
                    console.log('Competition update:', payload)
                    loadClassroomData()
                }
            )
            .subscribe()

        // Subscribe to participant changes for live leaderboard
        const participantChannel = supabase
            .channel(`classroom-${classroomId}-participants`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'competition_participants'
                },
                (payload) => {
                    console.log('Participant update:', payload)
                    if (activeCompetition) {
                        loadCompetitionDetails(activeCompetition.id)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(competitionChannel)
            supabase.removeChannel(participantChannel)
        }
    }

    const calculateTimeRemaining = (startedAt: string, durationMinutes: number) => {
        const start = new Date(startedAt).getTime()
        const end = start + (durationMinutes * 60 * 1000)
        const now = Date.now()
        const remaining = Math.max(0, end - now)

        const hours = Math.floor(remaining / 3600000)
        const minutes = Math.floor((remaining % 3600000) / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    if (loading) {
        return (
            <div className="flex h-screen bg-background">
                <DashboardSidebar />
                <main className="flex-1 overflow-auto p-8">
                    <Skeleton className="h-12 w-64 mb-6" />
                    <div className="grid gap-4">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </main>
            </div>
        )
    }

    if (error || !classroom) {
        return (
            <div className="flex h-screen bg-background">
                <DashboardSidebar />
                <main className="flex-1 overflow-auto p-8">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error || 'Classroom not found'}
                        </AlertDescription>
                    </Alert>
                    <Button className="mt-4" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </main>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-background">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto">
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="gap-2 mb-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <GraduationCap className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">{classroom.name}</h1>
                                    <p className="text-muted-foreground">
                                        Teacher: {classroom.teacher?.full_name || classroom.teacher?.username}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Badge className="text-sm">
                            {classroom.difficulty}
                        </Badge>
                    </div>

                    {/* Active Competition Banner */}
                    {activeCompetition && (
                        <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-primary" />
                                        <h2 className="text-xl font-bold">Active Competition</h2>
                                        <Badge className="bg-green-500 animate-pulse">LIVE</Badge>
                                    </div>
                                    <p className="text-lg font-semibold">{activeCompetition.title}</p>
                                    {activeCompetition.description && (
                                        <p className="text-muted-foreground">{activeCompetition.description}</p>
                                    )}
                                    {activeCompetition.started_at && (
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-primary" />
                                                <span className="font-mono text-lg font-bold text-primary">{timeRemaining}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {problems.filter(p => p.solved).length} / {problems.length} problems solved
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Link href={`/competitions/${activeCompetition.id}`}>
                                    <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                                        <Play className="w-5 h-5" />
                                        Enter Competition
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    )}

                    {/* Main Content */}
                    <Tabs defaultValue="problems" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="problems">Problems</TabsTrigger>
                            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>

                        {/* Problems Tab */}
                        <TabsContent value="problems" className="space-y-4">
                            {activeCompetition && problems.length > 0 ? (
                                <div className="grid gap-4">
                                    {problems.map((problem, index) => (
                                        <Card key={problem.id} className="p-6 hover:border-primary/50 transition-all group">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl font-bold text-muted-foreground">
                                                            {index + 1}.
                                                        </span>
                                                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                                            {problem.title}
                                                        </h3>
                                                        <Badge variant={
                                                            problem.difficulty === 'EASY' ? 'default' :
                                                                problem.difficulty === 'MEDIUM' ? 'secondary' : 'destructive'
                                                        }>
                                                            {problem.difficulty}
                                                        </Badge>
                                                        {problem.solved && (
                                                            <Badge className="bg-green-500">
                                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                Solved
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground ml-8">
                                                        Points: {problem.points}
                                                    </p>
                                                </div>
                                                <Link href={`/competitions/${activeCompetition.id}/problem/${problem.id}`}>
                                                    <Button className="gap-2">
                                                        <Code className="w-4 h-4" />
                                                        {problem.solved ? 'View Solution' : 'Solve Problem'}
                                                    </Button>
                                                </Link>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="p-12 text-center border-dashed">
                                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                                    <h3 className="text-xl font-semibold mb-2">No Active Competition</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Wait for your teacher to start a competition
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Listening for updates...</span>
                                    </div>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Leaderboard Tab */}
                        <TabsContent value="leaderboard" className="space-y-4">
                            {activeCompetition && participants.length > 0 ? (
                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-primary" />
                                            Live Rankings
                                        </h3>
                                        <Badge variant="outline" className="gap-1">
                                            <Users className="w-3 h-3" />
                                            {participants.length} participants
                                        </Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {participants.map((participant, index) => (
                                            <div
                                                key={participant.id}
                                                className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border/30 hover:border-primary/30 transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg' :
                                                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black shadow-md' :
                                                                index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md' :
                                                                    'bg-muted text-muted-foreground'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-lg">
                                                            {participant.user?.full_name || participant.user?.username}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                            <span>{participant.problems_solved} solved</span>
                                                            <span>•</span>
                                                            <span>{participant.total_submissions} submissions</span>
                                                            {participant.wrong_submissions > 0 && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-red-500">{participant.wrong_submissions} wrong</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-xl text-primary">{participant.score}</p>
                                                    <p className="text-xs text-muted-foreground">points</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            ) : (
                                <Card className="p-12 text-center border-dashed">
                                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                                    <h3 className="text-xl font-semibold mb-2">No Participants Yet</h3>
                                    <p className="text-muted-foreground">
                                        Leaderboard will appear when the competition starts
                                    </p>
                                </Card>
                            )}
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="history" className="space-y-4">
                            {competitions.length > 0 ? (
                                <div className="grid gap-4">
                                    {competitions.map((comp) => (
                                        <Card key={comp.id} className="p-6 hover:border-primary/30 transition-all">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-lg font-semibold">{comp.title}</h3>
                                                        <Badge className={
                                                            comp.status === 'ACTIVE' ? 'bg-green-500' :
                                                                comp.status === 'COMPLETED' ? 'bg-gray-500' :
                                                                    comp.status === 'DRAFT' ? 'bg-yellow-500' :
                                                                        'bg-red-500'
                                                        }>
                                                            {comp.status}
                                                        </Badge>
                                                    </div>
                                                    {comp.description && (
                                                        <p className="text-sm text-muted-foreground">{comp.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {comp.duration_minutes} minutes
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Code className="w-3 h-3" />
                                                            {comp.selected_problems?.length || 0} problems
                                                        </span>
                                                    </div>
                                                </div>
                                                {comp.status === 'ACTIVE' && comp.is_active && (
                                                    <Link href={`/competitions/${comp.id}`}>
                                                        <Button className="gap-2">
                                                            <Play className="w-4 h-4" />
                                                            Join Now
                                                        </Button>
                                                    </Link>
                                                )}
                                                {comp.status === 'COMPLETED' && (
                                                    <Link href={`/competitions/${comp.id}`}>
                                                        <Button variant="outline" className="gap-2">
                                                            <Trophy className="w-4 h-4" />
                                                            View Results
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="p-12 text-center border-dashed">
                                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                                    <h3 className="text-xl font-semibold mb-2">No Competitions Yet</h3>
                                    <p className="text-muted-foreground">
                                        Your teacher hasn't created any competitions yet
                                    </p>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}
