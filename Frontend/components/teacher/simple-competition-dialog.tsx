'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SimpleCompetitionDialogProps {
    classroomId: string;
    className: string;
}

export function SimpleCompetitionDialog({ classroomId, className }: SimpleCompetitionDialogProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleCreate = () => {
        toast.success('Competition creation coming soon!');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold shadow-lg shadow-purple-500/20 group">
                    <Trophy className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Create Competition
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-purple-500" />
                        Create New Competition
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <p className="text-muted-foreground">
                        Competition creation for <span className="font-bold text-foreground">{className}</span>
                    </p>

                    <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                        >
                            <Trophy className="w-4 h-4 mr-2" />
                            Create Competition
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
