'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { JudgeService, Question } from '@/lib/judge-service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Code, ChevronRight, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JudgeQuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await JudgeService.getQuestions();
                setQuestions(data);
            } catch (error) {
                console.error('Failed to fetch questions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                            DSA Problem Judge
                        </h1>
                        <p className="text-gray-400">Master your skills with our industry-standard code judge.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                            <Trophy className="text-yellow-500 w-6 h-6" />
                            <div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Solved</div>
                                <div className="text-xl font-bold">0 / {questions.length}</div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {questions.map((q, idx) => (
                        <motion.div
                            key={q._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link href={`/judge/${q._id}`}>
                                <Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-all group cursor-pointer h-full">
                                    <CardHeader>
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge className={
                                                q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                q.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                'bg-red-500/10 text-red-500 border-red-500/20'
                                            }>
                                                {q.difficulty}
                                            </Badge>
                                            <Code className="text-gray-600 group-hover:text-primary transition-colors" size={18} />
                                        </div>
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{q.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                                            {q.description}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Play size={12} />
                                                <span>1.2k attempts</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                                                Solve <ChevronRight size={16} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
