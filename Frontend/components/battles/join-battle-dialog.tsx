'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

export function JoinBattleDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Call backend API to join battle with code
            const data = await fetchApi(`/battles/join/${joinCode}`, {
                method: 'POST',
            });

            // Success - redirect to battle room
            setOpen(false);
            router.push(`/battles/${data.battleId}`);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to join battle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Join with Code
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Join Battle Room</DialogTitle>
                    <DialogDescription>
                        Enter the battle code provided by your teacher to join the competition.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="joinCode">Battle Code</Label>
                            <Input
                                id="joinCode"
                                placeholder="e.g., ABC123"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                className="uppercase text-center text-lg font-mono tracking-widest"
                                maxLength={6}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the 6-character code shared by your teacher
                            </p>
                        </div>
                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                {error}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !joinCode}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Join Battle
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
