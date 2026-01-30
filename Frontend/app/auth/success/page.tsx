'use client';

import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AuthSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        // Auto-redirect to login after 5 seconds
        const timer = setTimeout(() => {
            router.push('/login');
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="max-w-md w-full p-8 border-border/50 bg-card/50">
                    <div className="text-center space-y-6">
                        <motion.div
                            className="flex justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        >
                            <div className="relative">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-12 h-12 text-green-500" />
                                </div>
                                <motion.div
                                    className="absolute -top-2 -right-2"
                                    animate={{ rotate: [0, 10, -10, 10, 0] }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                >
                                    <Sparkles className="w-6 h-6 text-yellow-500" />
                                </motion.div>
                            </div>
                        </motion.div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold">Email Confirmed! 🎉</h1>
                            <p className="text-muted-foreground">
                                Your email has been successfully verified.
                                You can now access all features of LETS PREP.
                            </p>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm">
                            <p className="text-green-800 dark:text-green-200 font-medium">
                                ✨ Welcome to LETS PREP!
                            </p>
                            <p className="text-green-700 dark:text-green-300 mt-1">
                                You're all set to start your interview preparation journey.
                            </p>
                        </div>

                        <div className="space-y-3 pt-4">
                            <Link href="/login" className="block">
                                <Button className="w-full" size="lg">
                                    Continue to Login
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                Redirecting automatically in 5 seconds...
                            </p>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <p className="text-sm text-muted-foreground">
                                Ready to explore? Log in to access:
                            </p>
                            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                <div className="bg-muted/50 rounded p-2">
                                    <span className="font-semibold">📚 Practice</span>
                                    <p className="text-muted-foreground">DSA Problems</p>
                                </div>
                                <div className="bg-muted/50 rounded p-2">
                                    <span className="font-semibold">🏆 Compete</span>
                                    <p className="text-muted-foreground">Battles</p>
                                </div>
                                <div className="bg-muted/50 rounded p-2">
                                    <span className="font-semibold">📊 Track</span>
                                    <p className="text-muted-foreground">Progress</p>
                                </div>
                                <div className="bg-muted/50 rounded p-2">
                                    <span className="font-semibold">🎯 Prepare</span>
                                    <p className="text-muted-foreground">Interviews</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
