'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, Home, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthErrorPage() {
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
                            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-12 h-12 text-red-500" />
                            </div>
                        </motion.div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold">Confirmation Failed</h1>
                            <p className="text-muted-foreground">
                                The confirmation link is invalid or has expired.
                            </p>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-4 text-sm text-left space-y-2">
                            <p className="font-semibold">This could happen if:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>The link has expired (links are valid for 24 hours)</li>
                                <li>The link was already used</li>
                                <li>The link was copied incorrectly</li>
                            </ul>
                        </div>

                        <div className="space-y-3 pt-4">
                            <Link href="/signup" className="block">
                                <Button className="w-full" size="lg">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Sign Up Again
                                </Button>
                            </Link>
                            <Link href="/login" className="block">
                                <Button variant="outline" className="w-full" size="lg">
                                    Back to Login
                                </Button>
                            </Link>
                            <Link href="/" className="block">
                                <Button variant="ghost" className="w-full">
                                    <Home className="w-4 h-4 mr-2" />
                                    Go Home
                                </Button>
                            </Link>
                        </div>

                        <p className="text-xs text-muted-foreground pt-4">
                            Need help? Contact support at support@letsprep.com
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
