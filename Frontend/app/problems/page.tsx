'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Code, CheckCircle, Brain, Filter, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProblemsPage() {
    const [problems, setProblems] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());

    const supabase = React.useMemo(() => createClient(), []);

    useEffect(() => {
        fetchProblems(0, true);
        fetchSolvedProblems();
    }, []);

    const fetchSolvedProblems = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1';
            const subRes = await fetch(`${API_BASE_URL}/judge/submissions/${session.user.id}`);
            if (subRes.ok) {
                const submissions = await subRes.json();
                const solved = new Set(
                    submissions
                        .filter((s: any) => s.verdict === 'Accepted')
                        .map((s: any) => s.question_id?.slug)
                        .filter(Boolean)
                );
                setSolvedProblems(solved as Set<string>);
            }
        } catch (err) {
            console.error('Failed to fetch solved problems:', err);
        }
    };

    const fetchRef = React.useRef(false);

    const fetchProblems = async (offset: number, isInitial = false) => {
        if (fetchRef.current && !isInitial) return;
        fetchRef.current = true;

        if (isInitial) setLoading(true);

        try {
            let query = supabase
                .from('problems')
                .select('id, title, difficulty, category, points, slug')
                .range(offset, offset + 19)
                .order('id', { ascending: true });

            if (searchTerm) {
                query = query.ilike('title', `%${searchTerm}%`);
            }

            const { data, error } = await query;

            if (error) {
                if (error.message?.includes('aborted')) {
                    console.log('Fetch aborted - likely transient');
                } else {
                    console.error('Supabase fetch error FULL:', JSON.stringify(error, null, 2));
                }
            } else if (data) {
                if (data.length < 20) setHasMore(false);
                if (isInitial) {
                    setProblems(data);
                } else {
                    setProblems(prev => [...prev, ...data]);
                }
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('Request aborted by browser');
            } else {
                console.error('Fetch exception:', err);
            }
        } finally {
            setLoading(false);
            fetchRef.current = false;
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Debounce search
    useEffect(() => {
        const timeout = setTimeout(() => {
            setPage(0);
            setHasMore(true);
            fetchProblems(0, true);
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProblems(nextPage * 20);
    };

    return (
        <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto bg-grid-white/[0.02] relative">
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-[#0a0a0a] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

                <div className="p-8 max-w-7xl mx-auto relative z-10">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">Practice Problems</h1>
                            <p className="text-gray-400">Master algorithms with our curated collection of active problems.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-black/40 border border-white/10 p-1 rounded-lg flex gap-1">
                                <Button variant="ghost" size="sm" className="bg-white/10">All</Button>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">Easy</Button>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">Medium</Button>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">Hard</Button>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mb-10 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                            <Input
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder="Search problems by name or tag..."
                                className="pl-12 h-12 bg-black/60 border-white/10 focus:border-purple-500/50 text-lg rounded-xl transition-all"
                            />
                        </div>
                    </div>

                    {/* Problems Grid (List View) */}
                    <div className="space-y-3">
                        {loading && page === 0 ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-20 bg-white/5 animate-pulse rounded-xl" />
                                ))}
                            </div>
                        ) : (
                            <>
                                {problems.map((problem) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={problem.id}
                                    >
                                        <Link href={`/problems/${problem.slug}`}>
                                            <div className="group relative bg-[#121212] border border-white/5 hover:border-purple-500/30 p-5 rounded-xl transition-all hover:bg-white/[0.03] flex items-center justify-between cursor-pointer">

                                                <div className="flex items-center gap-6">
                                                    {/* Status Icon */}
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                                        solvedProblems.has(problem.slug) 
                                                        ? 'bg-green-500/10 border border-green-500/20' 
                                                        : 'bg-white/5 border border-white/5 group-hover:bg-purple-500/10'
                                                    }`}>
                                                        {solvedProblems.has(problem.slug) ? (
                                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                                        ) : (
                                                            <Code className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <h3 className={`text-lg font-medium transition-colors ${
                                                            solvedProblems.has(problem.slug) ? 'text-green-400' : 'group-hover:text-purple-400'
                                                        }`}>
                                                            {problem.title}
                                                        </h3>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <Badge variant="outline" className={`
                                            border-0 uppercase text-[10px] tracking-wider font-bold px-2 py-0.5
                                            ${problem.difficulty === 'EASY' ? 'bg-green-500/10 text-green-400' : ''}
                                            ${problem.difficulty === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400' : ''}
                                            ${problem.difficulty === 'HARD' ? 'bg-red-500/10 text-red-400' : ''}
                                         `}>
                                                                {problem.difficulty}
                                                            </Badge>
                                                            <span className="text-xs text-gray-500">{problem.category}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                                                    <span className="text-sm text-gray-500">Solve Challenge</span>
                                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                                                        <ArrowRight className="w-4 h-4 text-purple-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Load More */}
                    {hasMore && !loading && (
                        <div className="mt-8 text-center">
                            <Button
                                onClick={loadMore}
                                variant="outline"
                                className="bg-transparent border-white/10 hover:bg-white/5 text-gray-400 hover:text-white"
                            >
                                Load More Problems
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
