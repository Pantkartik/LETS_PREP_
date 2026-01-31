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
import { Swords, Loader2, Sparkles, Trophy, Users, Shield } from 'lucide-react';
import { launchClassCompetition } from '@/lib/actions/teacher-classes';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface LaunchClassCompetitionDialogProps {
    classId: string;
    className: string;
}

export function LaunchClassCompetitionDialog({ classId, className }: LaunchClassCompetitionDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: `${className} - Battle Royale`,
        difficulty: 'INTERMEDIATE' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
        maxParticipants: 50,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await launchClassCompetition(classId, {
                title: formData.title,
                difficulty: formData.difficulty,
                maxParticipants: formData.maxParticipants,
                description: `Exclusive battle for students of ${className}`
            });

            if (result.success && result.room) {
                toast.success("Class battle launched! All students are being registered.");
                setOpen(false);
                // Redirect to the competition management page
                router.push(`/teacher-dashboard/battles/${result.room.id}`);
            } else {
                toast.error(result.error || "Failed to launch battle");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg border-0 gap-2 font-bold px-6 py-6 h-auto text-lg group">
                    <Swords className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Launch Class Battle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />

                <DialogHeader className="space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-2xl font-bold">Instant Classroom Battle</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Start a competition for <span className="text-amber-500 font-semibold">{className}</span>.
                            All students in this class will be automatically invited.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                Challenge Title
                            </Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="bg-background/50 border-white/10 focus:border-red-500/50 focus:ring-red-500/20 py-6"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    Difficulty
                                </Label>
                                <Select
                                    value={formData.difficulty}
                                    onValueChange={(val: any) => setFormData({ ...formData, difficulty: val })}
                                >
                                    <SelectTrigger className="bg-background/50 border-white/10 h-12">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-white/10">
                                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    Capacity
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={formData.maxParticipants}
                                        onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                                        className="bg-background/50 border-white/10 h-12 pl-10"
                                    />
                                    <Users className="w-4 h-4 absolute left-3 top-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-red-500/20 mt-1">
                                <Shield className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-red-200">Broadcast Mode Enabled</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Launching this battle will notify all students in the class. The leaderboard will update in real-time as they solve problems.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="h-12 border-0 hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-12 px-8 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-red-500/20 font-bold"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Launching...
                                </>
                            ) : (
                                'Go To Battle'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
