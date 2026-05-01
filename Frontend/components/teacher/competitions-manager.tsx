'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
    Code, 
    Plus, 
    Copy, 
    Users, 
    Clock, 
    Trophy, 
    Trash2, 
    Edit2, 
    Share2, 
    BarChart3, 
    Zap, 
    Sword,
    ShieldCheck,
    LayoutDashboard,
    Search
} from 'lucide-react'
import { createGameRoom } from '@/lib/actions/teacher-competitions'
import { forceDeleteRoom } from '@/lib/actions/force-delete'
import { toast } from 'sonner'
import Link from 'next/link'

import { createClient } from '@/lib/supabase-client'

interface GameRoom {
    id: string
    title: string
    description: string | null
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | null
    start_time: string | null
    end_time: string | null
    max_participants: number | null
    invite_code: string
    is_quiz_mode: boolean
    is_battle_test: boolean
    participants_count?: number
    pending_requests?: number
    creator_id: string
}

interface CompetitionsManagerProps {
    initialRooms: any[]
    initialProblems: any[]
    classrooms: any[]
}

export default function CompetitionsManager({ initialRooms, initialProblems, classrooms }: CompetitionsManagerProps) {
    const [gameRooms, setGameRooms] = useState<GameRoom[]>(initialRooms)
    const [showModal, setShowModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'ALL' | 'QUIZ' | 'BATTLE'>('ALL')
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'INTERMEDIATE' as const,
        maxParticipants: 50,
        durationMinutes: 120,
        selectedProblems: [] as string[],
        isQuizMode: false,
        isBattleTest: false,
        classroomId: ''
    })

    const [problemSearch, setProblemSearch] = useState('')
    const [problemDifficulty, setProblemDifficulty] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL')
    const [creationStep, setCreationStep] = useState(1)

    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        const fetchLatestData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: comps } = await supabase
                .from('competitions')
                .select('*')
                .eq('creator_id', user.id)
                .order('created_at', { ascending: false })

            if (comps) {
                const { data: participants } = await supabase
                    .from('competition_participants')
                    .select('competition_id, status')
                    .in('competition_id', comps.map(c => c.id))

                const newFormatted = comps.map((c: any) => {
                    const pList = participants?.filter(p => p.competition_id === c.id) || []
                    return {
                        ...c,
                        participants_count: pList.filter(p => p.status === 'ACCEPTED' || !p.status).length,
                        pending_requests: pList.filter(p => p.status === 'PENDING').length
                    }
                })

                // Check for new requests to notify teacher
                const totalNewPending = newFormatted.reduce((acc, r) => acc + (r.pending_requests || 0), 0)
                const totalOldPending = gameRooms.reduce((acc, r) => acc + (r.pending_requests || 0), 0)
                
                if (totalNewPending > totalOldPending) {
                    toast.message("New Entry Request", {
                        description: "A student is waiting for approval in one of your arenas.",
                        icon: <Users className="w-4 h-4 text-primary" />,
                    })
                }

                setGameRooms(newFormatted)
            }
        }

        // Subscribe to both competitions and participants for this teacher
        const channel = supabase
            .channel('teacher-dashboard-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'competitions' }, fetchLatestData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'competition_participants' }, fetchLatestData)
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleCreateGameRoom = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.isQuizMode && !formData.isBattleTest && formData.selectedProblems.length === 0) {
            toast.error('Please select problems or enable a mode.')
            return
        }

        setIsLoading(true)
        try {
            const result = await createGameRoom(formData)
            if (!result.success || !result.room) throw new Error(result.error || 'Failed to create room')
            
            toast.success('Session launched successfully!')
            setShowModal(false)
            setFormData({
                title: '',
                description: '',
                difficulty: 'INTERMEDIATE',
                maxParticipants: 50,
                durationMinutes: 120,
                selectedProblems: [],
                isQuizMode: false,
                isBattleTest: false,
                classroomId: ''
            })
            setCreationStep(1)
            fetchLatestData()
        } catch (error: any) {
            console.error('Error creating room:', error)
            toast.error(error.message || 'Failed to create session')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteRoom = async (id: string) => {
        if (!confirm("Delete this room?")) return
        setIsDeleting(id)
        try {
            const result = await forceDeleteRoom(id)
            if (result.success) {
                setGameRooms(gameRooms.filter(r => r.id !== id))
                toast.success('Room deleted')
            } else throw new Error(result.error)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsDeleting(null)
        }
    }

    const handleCopyLink = (code: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/join?code=${code}`)
        toast.success('Invite link copied!')
    }

    const toggleProblem = (id: string) => {
        setFormData(prev => ({
            ...prev,
            selectedProblems: prev.selectedProblems.includes(id) 
                ? prev.selectedProblems.filter(p => p !== id)
                : [...prev.selectedProblems, id]
        }))
    }

    const handleSelectRandomProblems = () => {
        const easy = initialProblems.filter(p => p.difficulty === 'EASY').sort(() => 0.5 - Math.random()).slice(0, 2);
        const medium = initialProblems.filter(p => p.difficulty === 'MEDIUM').sort(() => 0.5 - Math.random()).slice(0, 2);
        const hard = initialProblems.filter(p => p.difficulty === 'HARD').sort(() => 0.5 - Math.random()).slice(0, 1);
        
        const randomProblems = [...easy, ...medium, ...hard];
        setFormData(prev => ({
            ...prev,
            selectedProblems: randomProblems.map(p => p.id),
            isQuizMode: true,
            isBattleTest: false
        }));
        toast.success('Selected 2 Easy, 2 Medium, and 1 Hard problem!');
    }

    const handleSelectHardThree = () => {
        const hard = initialProblems.filter(p => p.difficulty === 'HARD').sort(() => 0.5 - Math.random()).slice(0, 3);
        setFormData(prev => ({
            ...prev,
            selectedProblems: hard.map(p => p.id),
            isBattleTest: true,
            isQuizMode: false
        }));
        toast.success('Selected 3 Hard problems for Battle Test!');
    }

    const filteredRooms = useMemo(() => {
        return gameRooms.filter(room => {
            const matchesSearch = room.title.toLowerCase().includes(searchQuery.toLowerCase())
            const isQuiz = room.title.startsWith('[QUIZ]')
            const isBattle = room.title.startsWith('[BATTLE]')
            
            if (activeTab === 'QUIZ') return matchesSearch && isQuiz
            if (activeTab === 'BATTLE') return matchesSearch && isBattle
            
            return matchesSearch
        })
    }, [gameRooms, searchQuery, activeTab])

    const filteredProblems = useMemo(() => {
        return initialProblems.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(problemSearch.toLowerCase())
            const matchesDiff = problemDifficulty === 'ALL' || p.difficulty === problemDifficulty
            return matchesSearch && matchesDiff
        })
    }, [initialProblems, problemSearch, problemDifficulty])

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500/10 text-green-400 border-green-500/20'
            case 'COMPLETED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        }
    }

    return (
        <div className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
                            <LayoutDashboard className="w-10 h-10 text-primary" />
                            Management Hub
                        </h1>
                        <p className="text-slate-400 mt-2">Create and manage your quizzes and battle arenas.</p>
                    </div>
                    <Button onClick={() => setShowModal(true)} size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                        <Plus className="w-5 h-5 mr-2" /> Create New Session
                    </Button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-6 bg-slate-900/50 border-white/5 backdrop-blur-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Quizzes</p>
                        <p className="text-3xl font-black text-primary mt-1">{gameRooms.filter(r => r.status === 'ACTIVE' && r.is_quiz_mode).length}</p>
                    </Card>
                    <Card className="p-6 bg-slate-900/50 border-white/5 backdrop-blur-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Battles</p>
                        <p className="text-3xl font-black text-red-500 mt-1">{gameRooms.filter(r => r.status === 'ACTIVE' && r.is_battle_test).length}</p>
                    </Card>
                    <Card className="p-6 bg-slate-900/50 border-white/5 backdrop-blur-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Participants</p>
                        <p className="text-3xl font-black text-blue-500 mt-1">
                            {gameRooms.reduce((acc, r) => acc + (r.participants_count || 0), 0)}
                        </p>
                    </Card>
                    <Card className="p-6 bg-slate-900/50 border-white/5 backdrop-blur-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Completed Sessions</p>
                        <p className="text-3xl font-black text-green-500 mt-1">{gameRooms.filter(r => r.status === 'COMPLETED').length}</p>
                    </Card>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-slate-900/30 p-2 rounded-2xl border border-white/5">
                    <div className="flex gap-2 p-1 bg-black/40 rounded-xl w-full md:w-auto">
                        <button 
                            onClick={() => setActiveTab('ALL')}
                            className={`flex-1 md:w-32 px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'ALL' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <LayoutDashboard className="w-4 h-4" /> All
                        </button>
                        <button 
                            onClick={() => setActiveTab('QUIZ')}
                            className={`flex-1 md:w-48 px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'QUIZ' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Zap className="w-4 h-4" /> Classroom Quizzes
                        </button>
                        <button 
                            onClick={() => setActiveTab('BATTLE')}
                            className={`flex-1 md:w-48 px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'BATTLE' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Sword className="w-4 h-4" /> Battle Arena
                        </button>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder={`Search ${activeTab === 'QUIZ' ? 'quizzes' : 'battles'}...`}
                            className="pl-11 bg-black/40 border-white/10 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Session List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredRooms.length === 0 ? (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center bg-slate-900/20 border-2 border-dashed border-white/5 rounded-3xl">
                            <div className="w-20 h-20 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border border-white/5 group-hover:border-primary/20 transition-all">
                                <Trophy className="w-10 h-10 text-slate-700" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">No {activeTab} Sessions Found</h3>
                            <p className="text-slate-500 mt-2 max-w-xs text-center font-medium">
                                You haven't created any {activeTab.toLowerCase()} sessions yet. Start one now to challenge your students.
                            </p>
                            <Button onClick={() => setShowModal(true)} className="mt-8 bg-white text-black font-black uppercase italic px-8 h-12 hover:bg-slate-200">
                                <Plus className="w-5 h-5 mr-2" /> Create First {activeTab === 'QUIZ' ? 'Quiz' : 'Battle'}
                            </Button>
                        </div>
                    ) : (
                        filteredRooms.map((room) => (
                            <Card key={room.id} className="group relative bg-slate-900/40 border-white/5 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    {room.is_battle_test ? <Sword className="w-24 h-24 text-red-500" /> : <Zap className="w-24 h-24 text-primary" />}
                                </div>
                                
                                <div className="p-6 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold text-white">
                                                    {room.title.replace(/^\[(QUIZ|BATTLE)\]\s*/, '')}
                                                </h3>
                                                <Badge className={getStatusColor(room.status)}>
                                                    {room.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-400 line-clamp-1">{room.description || "Challenge your students with this session."}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => handleCopyLink(room.invite_code)} className="h-9 w-9 text-slate-400 hover:text-white hover:bg-white/10">
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-9 w-9 text-red-500/50 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteRoom(room.id)} disabled={isDeleting === room.id}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-black/40 rounded-xl p-3 border border-white/5 relative">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase mb-1">
                                                <Users className="w-3 h-3 text-primary" /> Joined
                                            </div>
                                            <p className="text-lg font-black text-white">{room.participants_count || 0} / {room.max_participants}</p>
                                            
                                            {room.pending_requests > 0 && (
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg animate-bounce border-2 border-slate-950">
                                                    {room.pending_requests}
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase mb-1">
                                                <Code className="w-3 h-3 text-primary" /> Invite Code
                                            </div>
                                            <p className="text-lg font-black text-white font-mono tracking-wider">{room.invite_code}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 2h Limit</span>
                                            <span className={`flex items-center gap-1 ${room.is_battle_test ? 'text-red-400' : 'text-primary'}`}>
                                                {room.is_battle_test ? <ShieldCheck className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                                                {room.is_battle_test ? 'BATTLE MODE' : 'QUIZ MODE'}
                                            </span>
                                        </div>
                                        <Link href={`/competitions/${room.id}`}>
                                            <Button size="sm" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold">
                                                Manage Arena <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Improved Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-xl overflow-y-auto animate-in fade-in zoom-in duration-300">
                    <Card className="w-full max-w-4xl bg-slate-900/90 border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row h-auto md:h-[600px]">
                        {/* Modal Sidebar (Steps) */}
                        <div className="w-full md:w-64 bg-black/40 p-8 border-r border-white/5 space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">New Session</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Setup Wizard</p>
                            </div>
                            
                            <div className="space-y-4">
                                {[
                                    { step: 1, label: 'BASIC INFO', icon: <Edit2 className="w-4 h-4" /> },
                                    { step: 2, label: 'CONFIGURATION', icon: <Zap className="w-4 h-4" /> },
                                    { step: 3, label: 'PROBLEMS', icon: <Code className="w-4 h-4" /> }
                                ].map((s) => (
                                    <div key={s.step} className={`flex items-center gap-4 transition-all ${creationStep === s.step ? 'text-primary' : 'text-slate-600'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${creationStep === s.step ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5'}`}>
                                            {s.step}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-12">
                                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white group">
                                    <Plus className="w-4 h-4 mr-2 rotate-45 group-hover:rotate-90 transition-transform" /> CANCEL
                                </Button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 p-8 overflow-y-auto scrollbar-hide relative">
                            <form onSubmit={handleCreateGameRoom} className="h-full flex flex-col">
                                <div className="flex-1">
                                    {creationStep === 1 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Session Title</Label>
                                                <Input 
                                                    required 
                                                    value={formData.title} 
                                                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                                                    className="bg-black/40 border-white/10 h-14 text-xl font-bold rounded-2xl focus:ring-primary/20" 
                                                    placeholder="Enter a legendary title..." 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</Label>
                                                <textarea 
                                                    value={formData.description} 
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]" 
                                                    placeholder="Set the stage for your students..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Classroom (Optional)</Label>
                                                <select 
                                                    value={formData.classroomId} 
                                                    onChange={e => setFormData({ ...formData, classroomId: e.target.value })} 
                                                    className="w-full bg-black/40 border border-white/10 rounded-2xl h-14 px-4 text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                                >
                                                    <option value="" className="bg-slate-900">Personal Session (No Classroom)</option>
                                                    {classrooms && classrooms.map(c => (
                                                        <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                                                    ))}
                                                </select>
                                                <p className="text-[8px] text-slate-500 font-bold uppercase mt-1 px-1">Linking to a classroom auto-enrolls all students.</p>
                                            </div>
                                        </div>
                                    )}

                                    {creationStep === 2 && (
                                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div 
                                                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col items-center text-center gap-3 ${formData.isQuizMode ? 'border-primary bg-primary/10 shadow-2xl shadow-primary/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`} 
                                                    onClick={() => setFormData({...formData, isQuizMode: true, isBattleTest: false})}
                                                >
                                                    <div className={`p-4 rounded-2xl ${formData.isQuizMode ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400'}`}>
                                                        <Zap className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white uppercase italic">Quiz Mode</p>
                                                        <p className="text-[10px] text-slate-500 mt-1">Structured learning with balanced problems.</p>
                                                    </div>
                                                </div>
                                                <div 
                                                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col items-center text-center gap-3 ${formData.isBattleTest ? 'border-red-600 bg-red-600/10 shadow-2xl shadow-red-600/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`} 
                                                    onClick={() => setFormData({...formData, isBattleTest: true, isQuizMode: false})}
                                                >
                                                    <div className={`p-4 rounded-2xl ${formData.isBattleTest ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                                        <Sword className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white uppercase italic">Battle Arena</p>
                                                        <p className="text-[10px] text-slate-500 mt-1">High-intensity competitive coding.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Max Participants</Label>
                                                    <Input type="number" value={formData.maxParticipants} onChange={e => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })} className="bg-black/40 border-white/10 h-12 rounded-xl" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration (Minutes)</Label>
                                                    <Input type="number" value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })} className="bg-black/40 border-white/10 h-12 rounded-xl" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {creationStep === 3 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                                <div className="relative w-full md:w-64">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                    <Input 
                                                        placeholder="Search bank..." 
                                                        className="pl-10 h-10 bg-black/40 border-white/10 rounded-xl text-xs"
                                                        value={problemSearch}
                                                        onChange={(e) => setProblemSearch(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex gap-2 w-full md:w-auto">
                                                    <Button type="button" size="sm" onClick={handleSelectRandomProblems} className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-[10px] font-black uppercase">
                                                        Auto-Quiz
                                                    </Button>
                                                    <Button type="button" size="sm" onClick={handleSelectHardThree} className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 text-[10px] font-black uppercase">
                                                        Hard-Battle
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-2 mb-2">
                                                {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((d: any) => (
                                                    <button
                                                        key={d}
                                                        type="button"
                                                        onClick={() => setProblemDifficulty(d)}
                                                        className={`py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase transition-all ${problemDifficulty === d ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                                                    >
                                                        {d}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="max-h-[250px] overflow-y-auto border border-white/5 rounded-2xl p-2 space-y-1 bg-black/20 custom-scrollbar">
                                                {filteredProblems.length === 0 ? (
                                                    <div className="py-12 text-center text-slate-600 text-xs font-bold uppercase tracking-widest">
                                                        No matching problems
                                                    </div>
                                                ) : (
                                                    filteredProblems.map(p => (
                                                        <div 
                                                            key={p.id} 
                                                            onClick={() => toggleProblem(p.id)}
                                                            className={`flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer border ${formData.selectedProblems.includes(p.id) ? 'bg-primary/10 border-primary/30' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                                                        >
                                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${formData.selectedProblems.includes(p.id) ? 'bg-primary border-primary' : 'border-white/10'}`}>
                                                                {formData.selectedProblems.includes(p.id) && <Plus className="w-3 h-3 text-white rotate-45" />}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-bold text-white">{p.title}</p>
                                                            </div>
                                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${p.difficulty === 'EASY' ? 'bg-green-500/10 text-green-400' : p.difficulty === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                                                                {p.difficulty}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase text-right tracking-widest">
                                                {formData.selectedProblems.length} Problems Selected
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center pt-8 mt-auto border-t border-white/5">
                                    <div className="flex gap-2">
                                        {creationStep > 1 && (
                                            <Button type="button" variant="outline" onClick={() => setCreationStep(prev => prev - 1)} className="border-white/10 text-slate-400 hover:text-white rounded-xl">
                                                Previous
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        {creationStep < 3 ? (
                                            <Button type="button" onClick={() => setCreationStep(prev => prev + 1)} className="px-10 bg-primary hover:bg-primary/90 font-black rounded-xl">
                                                Continue
                                            </Button>
                                        ) : (
                                            <Button type="submit" disabled={isLoading} className="px-12 bg-primary hover:bg-primary/90 font-black shadow-xl shadow-primary/20 rounded-xl">
                                                {isLoading ? 'Creating...' : 'Launch Session'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight ${className}`}>
            {children}
        </span>
    )
}

function ChevronRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}
