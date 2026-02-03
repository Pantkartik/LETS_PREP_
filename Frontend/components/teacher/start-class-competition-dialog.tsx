'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Trophy,
    Clock,
    Zap,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { createCompetition, getAvailableProblems, startCompetition } from '@/lib/actions/teacher-competitions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface StartClassCompetitionDialogProps {
    classroomId: string;
    className: string;
}

export function StartClassCompetitionDialog({ classroomId, className }: StartClassCompetitionDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingProblems, setLoadingProblems] = useState(false);
    const [problems, setProblems] = useState<any[]>([]);
    const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: `${className} Competition`,
        description: '',
        durationMinutes: 120,
        maxParticipants: 100
    });

    // Load problems when button is clicked, BEFORE opening dialog
    const handleOpenDialog = async () => {
        if (problems.length === 0) {
            setLoadingProblems(true);
            try {
                const result = await getAvailableProblems();
                if (result.success && result.problems) {
                    setProblems(result.problems);
                    setOpen(true); // Only open after problems are loaded
                } else {
                    toast.error('Failed to load problems');
                }
            } catch (error) {
                console.error('Error loading problems:', error);
                toast.error('Failed to load problems');
            } finally {
                setLoadingProblems(false);
            }
        } else {
            setOpen(true); // Problems already loaded, just open
        }
    };

    const toggleProblem = (problemId: string) => {
        setSelectedProblems(prev => {
            if (prev.includes(problemId)) {
                return prev.filter(id => id !== problemId);
            } else if (prev.length < 4) {
                return [...prev, problemId];
            } else {
                toast.error('You can only select 4 problems');
                return prev;
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedProblems.length !== 4) {
            toast.error('Please select exactly 4 problems');
            return;
        }

        setLoading(true);
        try {
            // Create competition
            const createResult = await createCompetition({
                classroomId,
                title: formData.title,
                description: formData.description,
                selectedProblems,
                durationMinutes: formData.durationMinutes,
                maxParticipants: formData.maxParticipants
            });

            if (!createResult.success || !createResult.competition) {
                toast.error(createResult.error || 'Failed to create competition');
                return;
            }

            // Start competition immediately
            const startResult = await startCompetition(createResult.competition.id);

            if (startResult.success) {
                toast.success('Competition started! All students have been registered.');
                setOpen(false);
                router.refresh();
            } else {
                toast.error(startResult.error || 'Failed to start competition');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty?.toUpperCase()) {
            case 'EASY': return 'text-green-400 bg-green-400/10';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10';
            case 'HARD': return 'text-red-400 bg-red-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button
                onClick={handleOpenDialog}
                disabled={loadingProblems}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold shadow-lg shadow-purple-500/20 group"
            >
                {loadingProblems ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Loading...
                    </>
                ) : (
                    <>
                        <Trophy className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                        Start Competition
                    </>
                )}
            </Button>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-purple-500" />
                        Start Competition for {className}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Competition Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Weekly DSA Challenge"
                                className="bg-white/5 border-white/10"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the competition objectives..."
                                className="bg-white/5 border-white/10 min-h-[80px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="duration">Duration (minutes)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min={30}
                                    max={480}
                                    value={formData.durationMinutes}
                                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                                    className="bg-white/5 border-white/10"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="maxParticipants">Max Participants</Label>
                                <Input
                                    id="maxParticipants"
                                    type="number"
                                    min={1}
                                    max={500}
                                    value={formData.maxParticipants}
                                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                                    className="bg-white/5 border-white/10"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Problem Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-bold">
                                Select 4 Problems
                            </Label>
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                                {selectedProblems.length} / 4 Selected
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto p-2 bg-white/5 rounded-lg border border-white/10">
                            {problems.map((problem) => {
                                const isSelected = selectedProblems.includes(problem.id);
                                return (
                                    <Card
                                        key={problem.id}
                                        className={`p-4 cursor-pointer transition-all ${isSelected
                                            ? 'bg-purple-500/20 border-purple-500/50'
                                            : 'bg-card/40 border-white/10 hover:border-white/20'
                                            }`}
                                        onClick={() => toggleProblem(problem.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleProblem(problem.id)}
                                                    className="border-white/20"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm">{problem.title}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {problem.category} • {problem.points} points
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={getDifficultyColor(problem.difficulty)}>
                                                {problem.difficulty}
                                            </Badge>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <Card className="p-3 bg-blue-500/10 border-blue-500/20">
                            <div className="flex items-center gap-2 text-blue-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs font-bold">10 min penalty/wrong</span>
                            </div>
                        </Card>
                        <Card className="p-3 bg-green-500/10 border-green-500/20">
                            <div className="flex items-center gap-2 text-green-400">
                                <Trophy className="w-4 h-4" />
                                <span className="text-xs font-bold">Top 3 Ranks</span>
                            </div>
                        </Card>
                        <Card className="p-3 bg-purple-500/10 border-purple-500/20">
                            <div className="flex items-center gap-2 text-purple-400">
                                <Zap className="w-4 h-4" />
                                <span className="text-xs font-bold">Real-time Leaderboard</span>
                            </div>
                        </Card>
                    </div>

                    {/* Warning */}
                    <Card className="p-4 bg-orange-500/10 border-orange-500/20">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-orange-200">Competition will start immediately</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    All students in this classroom will be automatically registered and notified.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || selectedProblems.length !== 4}
                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Starting...
                                </>
                            ) : (
                                <>
                                    <Trophy className="w-4 h-4 mr-2" />
                                    Start Competition
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
