'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { SettingsForm } from '@/components/settings/settings-form';
import { Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto relative">
                {/* Ambient Background Gradient */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="container max-w-5xl p-8 space-y-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6"
                    >
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <SettingsIcon className="w-6 h-6 text-primary" />
                                </div>
                                Account Settings
                            </h1>
                            <p className="text-muted-foreground ml-1">
                                Customize your profile, manage security, and preferences.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium border border-green-500/20">
                            <ShieldCheck className="w-4 h-4" />
                            Account Secure
                        </div>
                    </motion.div>

                    <SettingsForm />
                </div>
            </main>
        </div>
    );
}
