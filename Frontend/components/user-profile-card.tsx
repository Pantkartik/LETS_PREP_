'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/lib/hooks/use-user-profile';
import { Trophy, Zap, Target, GraduationCap, Users } from 'lucide-react';

interface UserProfileCardProps {
    profile: UserProfile;
}

export function UserProfileCard({ profile }: UserProfileCardProps) {
    const isStudent = profile.role === 'STUDENT';
    const isTeacher = profile.role === 'TEACHER';

    const getRoleIcon = () => {
        if (isTeacher) return <Users className="w-4 h-4" />;
        return <GraduationCap className="w-4 h-4" />;
    };

    const getRoleBadgeColor = () => {
        if (isTeacher) return 'bg-accent/20 text-accent border-accent/30';
        return 'bg-primary/20 text-primary border-primary/30';
    };

    const getInitials = () => {
        if (profile.full_name) {
            const names = profile.full_name.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[1][0]}`.toUpperCase();
            }
            return profile.full_name.charAt(0).toUpperCase();
        }
        if (profile.username) {
            return profile.username.charAt(0).toUpperCase();
        }
        return profile.email?.charAt(0).toUpperCase() || 'U';
    };

    return (
        <Card className="border-border/50 bg-card/50 p-6">
            <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary/20">
                    <AvatarImage src={profile.avatar_url} alt={profile.username || profile.email} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                        {getInitials()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold">
                                {profile.full_name || profile.username || 'User'}
                            </h3>
                            <Badge className={getRoleBadgeColor()}>
                                <span className="flex items-center gap-1">
                                    {getRoleIcon()}
                                    {profile.role}
                                </span>
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            @{profile.username || profile.email?.split('@')[0] || 'user'}
                        </p>
                    </div>

                    {isStudent && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Trophy className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Rank</p>
                                    <p className="font-bold">#{profile.rank_position || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-accent" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">XP</p>
                                    <p className="font-bold">{profile.xp ?? 0}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <Target className="w-4 h-4 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Level</p>
                                    <p className="font-bold">{profile.level ?? 1}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Trophy className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Wins</p>
                                    <p className="font-bold">
                                        {profile.total_wins ?? 0}/{profile.total_battles ?? 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isTeacher && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-accent" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Role</p>
                                    <p className="font-bold">Educator</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
