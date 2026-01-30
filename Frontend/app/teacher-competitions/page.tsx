'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { createClient } from '@/lib/supabase-client';
import { Plus, Trophy, Users, Clock, Calendar, Copy, Trash2, ExternalLink } from 'lucide-react';
import { useJsonToCsv } from '@/lib/hooks/use-json-to-csv'; // hypothetical hook, or just manual logic
import { toast } from 'sonner'; // or existing toast

interface Tournament {
    id: string;
    title: string;
    description: string;
    status: 'UPCOMING' | 'REGISTRATION' | 'ACTIVE' | 'COMPLETED';
    start_time: string;
    end_time: string;
    max_participants: number;
    current_participants: number;
    created_at: string;
}

export default function TeacherCompetitionsPage() {
    const [competitions, setCompetitions] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        max_participants: 100, // Default > 50 as requested
        start_time: '',
        end_time: '',
    });

    const supabase = createClient();

    useEffect(() => {
        fetchCompetitions();
    }, []);

    const fetchCompetitions = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('tournaments')
                .select('*')
                .eq('created_by', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCompetitions(data || []);
        } catch (error) {
            console.error('Error fetching competitions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Validate dates
            const start = new Date(formData.start_time);
            const end = new Date(formData.end_time);

            if (end <= start) {
                alert('End time must be after start time');
                setCreating(false);
                return;
            }

            const { data, error } = await supabase.from('tournaments').insert([
                {
                    title: formData.title,
                    description: formData.description,
                    max_participants: formData.max_participants,
                    start_time: start.toISOString(),
                    end_time: end.toISOString(),
                    created_by: user.id,
                    status: 'UPCOMING', // Default status
                    tournament_type: 'SINGLE_ELIMINATION' // Default type for now
                }
            ]).select().single();

            if (error) throw error;

            setCompetitions([data, ...competitions]);
            setShowModal(false);
            setFormData({
                title: '',
                description: '',
                max_participants: 100,
                start_time: '',
                end_time: '',
            });
        } catch (error: any) {
            console.error('Error creating competition:', error);
            alert('Failed to create competition: ' + error.message);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this competition?')) return;

        try {
            const { error } = await supabase.from('tournaments').delete().eq('id', id);
            if (error) throw error;
            setCompetitions(competitions.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting competition:', error);
        }
    };

    const copyInviteLink = (id: string) => {
        const link = `${window.location.origin}/join/${id}`; // Simplified join link
        navigator.clipboard.writeText(link);
        alert('Invite link copied to clipboard!');
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto bg-muted/5 p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Trophy className="w-8 h-8 text-primary" />
                                Competition Rooms
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Create and manage large-scale competitions for your students
                            </p>
                        </div>
                        <Button size="lg" onClick={() => setShowModal(true)} className="gap-2">
                            <Plus className="w-5 h-5" />
                            Create Room
                        </Button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">Loading competitions...</div>
                    ) : competitions.length === 0 ? (
                        <Card className="p-12 text-center border-dashed border-2 bg-card/50">
                            <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold mb-2">No Competition Rooms Yet</h3>
                            <p className="text-muted-foreground mb-6">
                                Create a room to host a competition for your students. Can support 50+ participants.
                            </p>
                            <Button onClick={() => setShowModal(true)}>Create Your First Room</Button>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {competitions.map((comp) => (
                                <Card key={comp.id} className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all">
                                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold">{comp.title}</h3>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${comp.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' :
                                                        comp.status === 'COMPLETED' ? 'bg-gray-500/20 text-gray-500' :
                                                            'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                    {comp.status}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground">{comp.description || 'No description provided.'}</p>

                                            <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    <span>{comp.current_participants || 0} / {comp.max_participants} Enrolled</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(comp.start_time).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        {new Date(comp.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                        {new Date(comp.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                            <Button variant="outline" className="justify-start gap-2" onClick={() => copyInviteLink(comp.id)}>
                                                <Copy className="w-4 h-4" />
                                                Copy Invite
                                            </Button>
                                            <Button variant="destructive" className="justify-start gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20" onClick={() => handleDelete(comp.id)}>
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg p-6 bg-card border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-6">Create Competition Room</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Room Title</Label>
                                <Input
                                    required
                                    placeholder="e.g. Final Semester Coding Exam"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    placeholder="Instructions for students..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Max Participants</Label>
                                    <Input
                                        type="number"
                                        min="2"
                                        value={formData.max_participants}
                                        onChange={e => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                                    />
                                    <p className="text-xs text-muted-foreground">Capacity can be 50+</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Input
                                        type="datetime-local"
                                        required
                                        value={formData.start_time}
                                        onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input
                                    type="datetime-local"
                                    required
                                    value={formData.end_time}
                                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1" disabled={creating}>
                                    {creating ? 'Creating Room...' : 'Create Room'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
