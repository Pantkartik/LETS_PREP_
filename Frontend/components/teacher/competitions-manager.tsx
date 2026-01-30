'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Code, Plus, Copy, Users, Clock, Trophy, Trash2, Edit2, Share2, BarChart3 } from 'lucide-react'
import ActivityHeatmap from '@/components/activity-heatmap'
import { createGameRoom } from '@/lib/actions/teacher-competitions'
import { forceDeleteRoom } from '@/lib/actions/force-delete'
import { toast } from 'sonner' // Assuming sonner is installed, or use window.alert/console

// Interface matching Database + UI needs
interface GameRoom {
    id: string
    title: string
    description: string | null
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null // DB uses UPPERCASE
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | null
    start_time: string | null
    end_time: string | null
    max_participants: number | null
    invite_code: string
    participants_count?: number
}

interface CompetitionsManagerProps {
    initialRooms: any[] // Using any strictly to avoid tedious DB type mapping for now
}

export default function CompetitionsManager({ initialRooms }: CompetitionsManagerProps) {
    const [gameRooms, setGameRooms] = useState<GameRoom[]>(initialRooms)
    const [showModal, setShowModal] = useState(false)
    const [copiedLink, setCopiedLink] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'INTERMEDIATE' as const,
        maxParticipants: 50,
    })

    // --- Handlers ---

    const handleCreateGameRoom = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const result = await createGameRoom({
                title: formData.title,
                description: formData.description,
                difficulty: formData.difficulty,
                maxParticipants: formData.maxParticipants
            })

            if (!result.success || !result.room) {
                throw new Error(result.error || 'Failed to create room')
            }

            // Optimistic Update or just append result
            const newRoom = result.room
            setGameRooms([newRoom, ...gameRooms])

            // Reset Form
            setFormData({ title: '', description: '', difficulty: 'INTERMEDIATE', maxParticipants: 50 })
            setShowModal(false)
            toast.success('Game Room Created!')

        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDeleteRoom = async (id: string) => {
        if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;

        setIsDeleting(id);
        const toastId = toast.loading('Deleting room...');

        try {
            const result = await forceDeleteRoom(id)
            if (result.success) {
                setGameRooms(gameRooms.filter(r => r.id !== id))
                toast.success('Room deleted successfully', { id: toastId })
            } else {
                console.error('Deletion error:', result.error);
                throw new Error(result.error)
            }
        } catch (error: any) {
            toast.error(`Failed to delete: ${error.message}`, { id: toastId })
        } finally {
            setIsDeleting(null);
        }
    }

    const handleCopyLink = (code: string) => {
        const link = `${window.location.origin}/join?code=${code}`
        navigator.clipboard.writeText(link)
        setCopiedLink(code)
        setTimeout(() => setCopiedLink(null), 2000)
        toast.success('Invite link copied!')
    }

    // --- UI Helpers ---

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500/20 text-green-400'
            case 'COMPLETED': return 'bg-muted text-muted-foreground'
            default: return 'bg-yellow-500/20 text-yellow-400' // Draft
        }
    }

    const getDifficultyColor = (diff: string | null) => {
        switch (diff) {
            case 'BEGINNER': return 'text-blue-400'
            case 'INTERMEDIATE': return 'text-yellow-400'
            case 'ADVANCED': return 'text-red-400'
            default: return 'text-gray-400'
        }
    }

    return (
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold tracking-tight">Game Rooms</h2>
                    <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90 gap-2">
                        <Plus className="w-4 h-4" /> Create Room
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-border/50 bg-card/50 p-6">
                        <p className="text-sm text-muted-foreground">Active Rooms</p>
                        <p className="text-3xl font-bold">{gameRooms.filter((r) => r.status === 'ACTIVE').length}</p>
                    </Card>
                    <Card className="border-border/50 bg-card/50 p-6">
                        <p className="text-sm text-muted-foreground">Total Participants</p>
                        {/* Need to ensure participants_count is coming from DB view/query */}
                        <p className="text-3xl font-bold">
                            {gameRooms.reduce((sum, r) => sum + ((Array.isArray(r.participants_count) && r.participants_count[0]?.count) || 0), 0)}
                        </p>
                    </Card>
                    <Card className="border-border/50 bg-card/50 p-6">
                        <p className="text-sm text-muted-foreground">Drafts</p>
                        <p className="text-3xl font-bold">{gameRooms.filter((r) => r.status === 'DRAFT').length}</p>
                    </Card>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {gameRooms.length === 0 ? (
                        <Card className="border-border/50 bg-card/50 p-12 text-center text-muted-foreground">
                            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No game rooms created yet.</p>
                        </Card>
                    ) : (
                        gameRooms.map((room) => (
                            <Card key={room.id} className="border-border/50 bg-card/50 p-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">

                                    {/* Details */}
                                    <div className="md:col-span-2 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold">{room.title}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(room.status)}`}>
                                                {room.status}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground text-sm line-clamp-2">
                                            {room.description || "No description provided."}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs font-mono bg-muted/30 px-2 py-1 rounded w-fit">
                                            <Code className="w-3 h-3" /> Code: {room.invite_code}
                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-primary" />
                                            <span>
                                                {Array.isArray(room.participants_count) && room.participants_count[0]?.count || 0} / {room.max_participants} joined
                                            </span>
                                        </div>
                                        <div className={`font-bold ${getDifficultyColor(room.difficulty)}`}>
                                            {room.difficulty}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 justify-end">
                                        <Button size="icon" variant="ghost" onClick={() => handleCopyLink(room.invite_code)}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDeleteRoom(room.id)}
                                            disabled={isDeleting === room.id}
                                        >
                                            <Trash2 className={`w-4 h-4 ${isDeleting === room.id ? 'opacity-50' : ''}`} />
                                        </Button>
                                    </div>

                                </div>
                            </Card>
                        ))
                    )}
                </div>

            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <Card className="border-border bg-card p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-6">Create New Room</h2>
                        <form onSubmit={handleCreateGameRoom} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Room Title</Label>
                                <Input
                                    id="title"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Weekly DSA Battle"
                                />
                            </div>
                            <div>
                                <Label htmlFor="desc">Description</Label>
                                <Input
                                    id="desc"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Optional details"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="diff">Difficulty</Label>
                                    <select
                                        id="diff"
                                        className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.difficulty}
                                        onChange={(e: any) => setFormData({ ...formData, difficulty: e.target.value })}
                                    >
                                        <option value="BEGINNER">Beginner</option>
                                        <option value="INTERMEDIATE">Intermediate</option>
                                        <option value="ADVANCED">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="max">Max Users</Label>
                                    <Input
                                        id="max"
                                        type="number"
                                        min={1}
                                        max={500}
                                        value={formData.maxParticipants}
                                        onChange={e => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end mt-4">
                                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit">Create</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

        </div>
    )
}
