'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    Loader2, User, Bell, Shield, AlertTriangle, Calendar, Save,
    Globe, Github, Twitter, Linkedin, Camera, CheckCircle2
} from 'lucide-react';
import { useUserProfile } from '@/lib/hooks/use-user-profile';
import { motion, AnimatePresence } from 'framer-motion';

export function SettingsForm() {
    const { profile, loading: profileLoading } = useUserProfile();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [activeTab, setActiveTab] = useState("general");

    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        bio: '',
        website: '',
        github_username: '',
        twitter_username: '',
        linkedin_username: '',
    });

    const [daysWait, setDaysWait] = useState<number>(0);

    // Initialize form
    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                username: profile.username || '',
                bio: (profile as any).bio || '',
                website: (profile as any).website || '',
                github_username: (profile as any).github_username || '',
                twitter_username: (profile as any).twitter_username || '',
                linkedin_username: (profile as any).linkedin_username || '',
            });

            if ((profile as any).last_name_change_at) {
                const lastChange = new Date((profile as any).last_name_change_at);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - lastChange.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setDaysWait(diffDays < 30 ? 30 - diffDays : 0);
            }
        }
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const updates: any = { ...formData, updated_at: new Date().toISOString() };

            if (formData.full_name !== profile?.full_name) {
                if (daysWait > 0) throw new Error(`You can change your name again in ${daysWait} days.`);
                updates.last_name_change_at = new Date().toISOString();
            }

            const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
            if (error) throw error;

            setMessage({ type: 'success', text: 'Settings saved successfully' });
            if (updates.full_name && formData.full_name !== profile?.full_name) setDaysWait(30);

            // Clear message after 3s
            setTimeout(() => setMessage(null), 3000);

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    if (profileLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
            </div>
        );
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <nav className="lg:w-64 flex-shrink-0 space-y-2">
                <TabsList className="flex lg:flex-col h-auto bg-transparent p-0 gap-2 justify-start items-stretch">
                    {['general', 'social', 'appearance'].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab}
                            className="bg-card/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground 
                                       data-[state=active]:shadow-lg justify-start px-4 py-3 rounded-xl border border-border/50
                                       transition-all duration-300 hover:bg-muted/50 text-muted-foreground w-full"
                        >
                            <span className="capitalize text-base font-medium">{tab}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 space-y-6">
                <AnimatePresence mode="wait">
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success'
                                    ? 'bg-green-500/10 border-green-500/20 text-green-600'
                                    : 'bg-destructive/10 border-destructive/20 text-destructive'
                                }`}
                        >
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            <span className="font-medium">{message.text}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <TabsContent value="general" className="mt-0 space-y-6">
                        {/* Profile Header Card */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                            <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
                            <CardContent className="relative pt-0">
                                <div className="absolute -top-12 left-6">
                                    <div className="relative group">
                                        <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                            <AvatarImage src={profile?.avatar_url} />
                                            <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                                                {profile?.full_name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg 
                                                         opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1/4 translate-y-1/4">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-14 space-y-1">
                                    <h3 className="text-2xl font-bold">{profile?.full_name}</h3>
                                    <p className="text-muted-foreground">@{profile?.username} • {profile?.role}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Edit Form */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form id="settings-form" onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    name="full_name"
                                                    value={formData.full_name}
                                                    onChange={handleChange}
                                                    className="pl-9 bg-background/50"
                                                    disabled={daysWait > 0}
                                                />
                                            </div>
                                            {daysWait > 0 && (
                                                <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 p-2 rounded-lg">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Available in {daysWait} days</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Username</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-muted-foreground font-mono">@</span>
                                                <Input
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    className="pl-8 bg-background/50 font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Bio</Label>
                                        <Input
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            className="bg-background/50"
                                            placeholder="Tell us a bit about yourself..."
                                        />
                                    </div>
                                </form>
                            </CardContent>
                            <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-4">
                                <Button type="submit" form="settings-form" disabled={isLoading} className="ml-auto">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="social" className="mt-0">
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Social Connections</CardTitle>
                                <CardDescription>Display your social links on your profile.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    {[
                                        { name: 'website', icon: Globe, label: 'Website', placeholder: 'https://yourportfolio.com' },
                                        { name: 'github_username', icon: Github, label: 'GitHub', placeholder: 'username' },
                                        { name: 'twitter_username', icon: Twitter, label: 'Twitter', placeholder: 'handle' },
                                        { name: 'linkedin_username', icon: Linkedin, label: 'LinkedIn', placeholder: 'profile-url' }
                                    ].map((item) => (
                                        <div key={item.name} className="flex items-center gap-4 p-3 border border-border/50 rounded-xl bg-background/40 hover:bg-background/60 transition-colors">
                                            <div className="p-2.5 bg-muted rounded-lg text-muted-foreground">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <Label className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</Label>
                                                <Input
                                                    name={item.name}
                                                    value={(formData as any)[item.name]}
                                                    onChange={handleChange}
                                                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50 shadow-none text-base"
                                                    placeholder={item.placeholder}
                                                />
                                            </div>
                                            {(formData as any)[item.name] && (
                                                <CheckCircle2 className="w-5 h-5 text-green-500 animate-in zoom-in" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-4">
                                <Button onClick={handleUpdateProfile} disabled={isLoading} className="ml-auto">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appearance" className="mt-0">
                        <Card className="border opacity-60">
                            <CardHeader>
                                <CardTitle className="text-muted-foreground">Coming Soon</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Theme customization features are under development.</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </motion.div>
            </div>
        </Tabs>
    );
}
