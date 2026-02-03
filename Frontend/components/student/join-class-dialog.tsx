'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Loader2, CheckCircle2 } from 'lucide-react'
import { joinClassroom } from '@/lib/actions/student-classes'
import { toast } from 'sonner'

interface JoinClassDialogProps {
    children?: React.ReactNode
}

export function JoinClassDialog({ children }: JoinClassDialogProps) {
    const [open, setOpen] = useState(false)
    const [inviteCode, setInviteCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!inviteCode.trim()) {
            toast.error('Please enter an invite code')
            return
        }

        setLoading(true)
        setSuccess(false)

        try {
            const result = await joinClassroom(inviteCode.trim())

            if (result.success) {
                setSuccess(true)
                toast.success(result.message || 'Successfully joined classroom!')

                // Reset and close after a short delay
                setTimeout(() => {
                    setOpen(false)
                    setInviteCode('')
                    setSuccess(false)
                    router.refresh()
                }, 1500)
            } else {
                toast.error(result.error || 'Failed to join classroom')
            }
        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!loading) {
            setOpen(newOpen)
            if (!newOpen) {
                // Reset state when closing
                setInviteCode('')
                setSuccess(false)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-primary hover:bg-primary/90 gap-2">
                        <UserPlus className="w-4 h-4" />
                        Join Class
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        Join a Classroom
                    </DialogTitle>
                    <DialogDescription>
                        Enter the 6-character invite code provided by your teacher to join their classroom.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="inviteCode">Invite Code</Label>
                        <Input
                            id="inviteCode"
                            placeholder="ABC123"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            className="text-center text-lg font-mono tracking-widest uppercase"
                            disabled={loading || success}
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground">
                            The code is case-insensitive and exactly 6 characters long
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={loading || success}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || success || inviteCode.length !== 6}
                            className="flex-1 gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Joining...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Joined!
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Join Class
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
