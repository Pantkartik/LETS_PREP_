'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, GraduationCap, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { createClassroom } from '@/lib/actions/teacher-classes';
import { useRouter } from 'next/navigation';

interface CreateClassDialogProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
}

export function CreateClassDialog({ children, onSuccess }: CreateClassDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            difficulty: formData.get('difficulty') as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
            maxStudents: parseInt(formData.get('maxStudents') as string) || 50,
        };

        const result = await createClassroom(data);

        if (result.success) {
            toast.success('Class cohort created successfully!');
            setOpen(false);
            if (onSuccess) onSuccess();
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to create class');
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)] border-0 gap-2">
                        <Plus className="w-4 h-4" />
                        New Class
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card/90 backdrop-blur-xl border-white/10 shadow-2xl">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                        <GraduationCap className="w-6 h-6 text-amber-500" />
                    </div>
                    <DialogTitle className="text-2xl font-bold">Create New Classroom</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Set up a new student cohort to start managing their learning journey.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Class Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Data Structures & Algorithms - Section C"
                                className="bg-background/50 border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Briefly describe the focus of this class..."
                                className="bg-background/50 border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20 min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="difficulty" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Difficulty Level</Label>
                                <Select name="difficulty" defaultValue="INTERMEDIATE">
                                    <SelectTrigger className="bg-background/50 border-white/10 focus:ring-amber-500/20">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-white/10">
                                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="maxStudents" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capacity</Label>
                                <Input
                                    id="maxStudents"
                                    name="maxStudents"
                                    type="number"
                                    placeholder="e.g. 50"
                                    defaultValue={50}
                                    className="bg-background/50 border-white/10 focus:border-amber-500/50 focus:ring-amber-500/20"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <p className="text-[10px] text-amber-200/70 leading-tight">
                                    This will generate a unique class code and invitation link for your students to join automatically.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-amber-500 hover:bg-amber-600 text-white min-w-[120px]"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Class'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
