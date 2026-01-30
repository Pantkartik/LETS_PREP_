'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase-client';
import { Plus, Loader2, Swords, Trophy, Users, Globe, Lock, Signal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function CreateBattleDialog({ onBattleCreated }: { onBattleCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const [formData, setFormData] = useState({
        title: '',
        difficulty: 'EASY',
        battle_type: 'PUBLIC',
        max_players: '10', // Default to 10
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("You must be logged in to create a battle");
                return;
            }

            const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            // 1. Create the battle
            const { data: battleData, error: battleError } = await supabase
                .from('battles')
                .insert([{
                    title: formData.title,
                    difficulty: formData.difficulty,
                    battle_type: formData.battle_type,
                    max_players: parseInt(formData.max_players),
                    created_by: user.id,
                    room_code: roomCode,
                    status: 'WAITING',
                    current_players: 1 // Creator counts as 1
                }])
                .select()
                .single();

            if (battleError) throw battleError;

            // 2. Add creator as participant
            const { error: participantError } = await supabase
                .from('battle_participants')
                .insert([{
                    battle_id: battleData.id,
                    user_id: user.id,
                    status: 'JOINED'
                }]);

            if (participantError) throw participantError;

            toast.success("Battle room created successfully!");
            setOpen(false);

            if (onBattleCreated) {
                onBattleCreated();
            } else {
                router.push(`/teacher-dashboard/battles/${battleData.id}`);
            }

        } catch (error: any) {
            console.error('Failed to create battle:', error);
            toast.error(error.message || 'Failed to create battle. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md border-0">
                    <Plus className="w-4 h-4" />
                    Create Room
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-card">
                <DialogHeader className="space-y-3 pb-4 border-b border-border/50">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <Swords className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-xl">Create Battle Room</DialogTitle>
                    <DialogDescription>
                        Set up a competitive environment for your students.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-muted-foreground" />
                            Room Title
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g. Weekly DSA Challenge"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-primary/20"
                            required
                            minLength={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Signal className="w-4 h-4 text-muted-foreground" />
                                Difficulty
                            </Label>
                            <Select
                                value={formData.difficulty}
                                onValueChange={(val) => setFormData({ ...formData, difficulty: val })}
                            >
                                <SelectTrigger className="bg-muted/30 border-muted-foreground/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EASY">Beginner</SelectItem>
                                    <SelectItem value="MEDIUM">Intermediate</SelectItem>
                                    <SelectItem value="HARD">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                {formData.battle_type === 'PUBLIC' ? <Globe className="w-4 h-4 text-muted-foreground" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                                Access
                            </Label>
                            <Select
                                value={formData.battle_type}
                                onValueChange={(val) => setFormData({ ...formData, battle_type: val })}
                            >
                                <SelectTrigger className="bg-muted/30 border-muted-foreground/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PUBLIC">Public (Listed)</SelectItem>
                                    <SelectItem value="PRIVATE">Private (Invite Only)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="players" className="text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            Max Participants
                        </Label>
                        <div className="relative">
                            <Input
                                id="players"
                                type="number"
                                min="2"
                                max="50"
                                value={formData.max_players}
                                onChange={(e) => setFormData({ ...formData, max_players: e.target.value })}
                                className="bg-muted/30 border-muted-foreground/20 pl-4"
                                required
                            />
                            <div className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                                Students
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Limit: 50 players per room.</p>
                    </div>

                    <DialogFooter className="pt-4 border-t border-border/50">
                        <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                            {loading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            Create Room
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
