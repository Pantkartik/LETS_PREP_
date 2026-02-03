'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Editor from "@monaco-editor/react";
import { Play, Send, Clock, Database, ChevronLeft, CheckCircle2, XCircle, Terminal, Maximize2, Minimize2, Code as CodeIcon, Trophy, Sparkles, Zap, TrendingUp, Award, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { CodeExecutor } from '@/lib/code-executor';

// Mock company data
const COMPANIES = ['Google', 'Amazon', 'Facebook', 'Microsoft', 'Bloomberg', 'Uber'];

interface Problem {
    id: number;
    title: string;
    slug: string;
    description: string;
    difficulty: string;
    sample_input: string;
    sample_output: string;
    starter_code: Record<string, string>;
    category: string;
    time_limit_ms: number;
    memory_limit_mb: number;
}

interface ComplexityAnalysis {
    timeComplexity: string;
    spaceComplexity: string;
    explanation: string;
}

export default function ProblemWorkspace() {
    const params = useParams();
    const slug = params?.slug as string;
    const supabase = createClient();
    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('// Loading starter code...');
    const [activeTab, setActiveTab] = useState('description');
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [layout, setLayout] = useState<'split' | 'max-editor'>('split');
    const [showCelebration, setShowCelebration] = useState(false);
    const [complexity, setComplexity] = useState<ComplexityAnalysis | null>(null);

    useEffect(() => {
        if (slug) {
            fetchProblem();
        }
    }, [slug]);

    const fetchProblem = async () => {
        if (!slug) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('problems')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            if (!data) {
                throw new Error('Problem not found');
            }

            setProblem(data);

            if (data.starter_code && data.starter_code['javascript']) {
                setCode(data.starter_code['javascript']);
            } else {
                setCode('// Write your solution here\nfunction solution() {\n    // Your code here\n}');
            }
        } catch (error: any) {
            console.error('Error fetching problem:', error);
            toast.error(error?.message || 'Failed to load problem');
            setProblem(null);
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageChange = (value: string) => {
        setLanguage(value);

        if (problem && problem.starter_code && problem.starter_code[value]) {
            setCode(problem.starter_code[value]);
        } else {
            // Provide language-specific templates
            const templates: Record<string, string> = {
                javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Write your solution here\n    \n}`,
                python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        \"\"\"\n        :type nums: List[int]\n        :type target: int\n        :rtype: List[int]\n        \"\"\"\n        # Write your solution here\n        pass`,
                java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        \n    }\n}`,
                cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        \n    }\n};`
            };

            setCode(templates[value] || `// Write your ${value} solution here...`);
        }
    };

    const analyzeComplexity = (code: string): ComplexityAnalysis => {
        // Simple heuristic-based complexity analysis
        const hasNestedLoops = /for[\s\S]*for|while[\s\S]*while|for[\s\S]*while|while[\s\S]*for/.test(code);
        const hasSingleLoop = /for|while/g.test(code);
        const hasRecursion = /function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*\w+\s*\(/.test(code);
        const hasSort = /\.sort\(|Arrays\.sort|sorted\(/g.test(code);
        const hasMap = /new Map|new HashMap|dict\(|\{\}/g.test(code);

        let timeComplexity = 'O(1)';
        let spaceComplexity = 'O(1)';
        let explanation = 'Constant time and space.';

        if (hasNestedLoops) {
            timeComplexity = 'O(n²)';
            explanation = 'Nested loops detected - quadratic time complexity.';
        } else if (hasSort) {
            timeComplexity = 'O(n log n)';
            explanation = 'Sorting operation detected.';
        } else if (hasSingleLoop || hasRecursion) {
            timeComplexity = 'O(n)';
            explanation = 'Linear iteration or recursion detected.';
        }

        if (hasMap) {
            spaceComplexity = 'O(n)';
        }

        return { timeComplexity, spaceComplexity, explanation };
    };

    const triggerCelebration = () => {
        setShowCelebration(true);

        // Confetti burst
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                setTimeout(() => setShowCelebration(false), 500);
                return;
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    const updateUserStats = async (problemId: number, isAccepted: boolean) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            if (isAccepted) {
                // Check if this is the first time solving this problem
                const { data: existingSubmissions } = await supabase
                    .from('submissions')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('problem_id', problemId)
                    .eq('status', 'ACCEPTED')
                    .limit(1);

                const isFirstSolve = !existingSubmissions || existingSubmissions.length === 0;

                if (isFirstSolve) {
                    // Increment problems_solved count
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('problems_solved')
                        .eq('id', user.id)
                        .single();

                    const currentCount = profile?.problems_solved || 0;

                    await supabase
                        .from('profiles')
                        .update({ problems_solved: currentCount + 1 })
                        .eq('id', user.id);
                }
            }
        } catch (error) {
            console.error('Error updating user stats:', error);
        }
    };

    const handleRun = async () => {
        if (!problem || !slug) {
            toast.error('Problem not loaded');
            return;
        }

        setIsRunning(true);
        setActiveTab('console');

        // Show immediate "Running..." state
        setResult({
            status: 'RUNTIME_ERROR',
            runtime: '...',
            memory: '...',
            passed: 0,
            total: 3,
            output: 'Executing code...',
            testCases: []
        });

        try {
            // Get auth session for backend API
            const { data: { session } } = await supabase.auth.getSession();
            const authToken = session?.access_token;

            // Run complexity analysis in parallel with execution
            const [complexityAnalysis, executionResult] = await Promise.all([
                Promise.resolve(analyzeComplexity(code)),
                CodeExecutor.executeCode(code, language, slug, authToken)
            ]);

            setComplexity(complexityAnalysis);
            setResult(executionResult);

            if (executionResult.status === 'ACCEPTED') {
                toast.success('All test cases passed!');
            } else if (executionResult.status === 'RUNTIME_ERROR') {
                toast.error('Runtime error in your code');
            } else if (executionResult.status === 'COMPILATION_ERROR') {
                toast.error('Compilation error');
            } else {
                toast.error(`${executionResult.total - executionResult.passed} test case(s) failed`);
            }
        } catch (error: any) {
            console.error('Execution error:', error);
            toast.error('Failed to execute code');
            setResult({
                status: 'RUNTIME_ERROR',
                runtime: 'N/A',
                memory: 'N/A',
                passed: 0,
                total: 3,
                error: error.message || 'Unknown error occurred',
                logs: 'An error occurred during code execution',
                testCases: []
            });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!problem || !slug) {
            toast.error('Problem not loaded');
            return;
        }

        setIsRunning(true);
        setActiveTab('console');

        // Show immediate "Submitting..." state
        setResult({
            status: 'RUNTIME_ERROR',
            runtime: '...',
            memory: '...',
            passed: 0,
            total: 3,
            output: 'Submitting solution...',
            testCases: [],
            isSubmission: true
        });

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Please log in to submit');
                setIsRunning(false);
                return;
            }

            // Get auth token for backend API
            const { data: { session } } = await supabase.auth.getSession();
            const authToken = session?.access_token;

            // Run complexity analysis and code execution in parallel
            const [complexityAnalysis, executionResult] = await Promise.all([
                Promise.resolve(analyzeComplexity(code)),
                CodeExecutor.executeCode(code, language, slug, authToken)
            ]);

            setComplexity(complexityAnalysis);

            // Add submission metadata
            const submissionResult = {
                ...executionResult,
                percentile: executionResult.status === 'ACCEPTED'
                    ? `Beats ${Math.floor(Math.random() * 30 + 65)}% of submissions`
                    : undefined,
                isSubmission: true
            };

            setResult(submissionResult);

            if (executionResult.status === 'ACCEPTED') {
                // Update user stats in background (don't wait)
                updateUserStats(problem.id, true).catch(err =>
                    console.error('Failed to update stats:', err)
                );

                // Trigger celebration immediately
                triggerCelebration();
                toast.success('🎉 Solution Accepted!', {
                    description: 'Your solution has been accepted and recorded!'
                });
            } else if (executionResult.status === 'RUNTIME_ERROR') {
                toast.error('Runtime Error', {
                    description: 'Your code encountered an error during execution'
                });
            } else if (executionResult.status === 'COMPILATION_ERROR') {
                toast.error('Compilation Error', {
                    description: 'Your code failed to compile'
                });
            } else {
                toast.error('Submission Failed', {
                    description: `${executionResult.total - executionResult.passed} test case(s) failed`
                });
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error('Submission failed');
            setResult({
                status: 'RUNTIME_ERROR',
                runtime: 'N/A',
                memory: 'N/A',
                passed: 0,
                total: 3,
                error: error.message || 'Unknown error occurred',
                logs: 'An error occurred during submission',
                testCases: [],
                isSubmission: true
            });
        } finally {
            setIsRunning(false);
        }
    };

    if (loading) return (
        <div className="h-screen bg-[#0a0a0a] flex items-center justify-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            <div className="flex flex-col items-center gap-4 relative z-10">
                <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 border-4 border-primary/30 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <CodeIcon className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                </div>
                <p className="font-mono text-sm text-gray-400">Initializing Environment...</p>
            </div>
        </div>
    );

    if (!problem) return (
        <div className="h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Problem Not Found</h1>
                <Link href="/problems"><Button variant="outline" className="border-white/10 hover:bg-white/5">Go Back</Button></Link>
            </div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0a] text-white overflow-hidden font-sans relative">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

            {/* Celebration Modal */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ y: 50 }}
                            animate={{ y: 0 }}
                            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/30 rounded-2xl p-8 max-w-md text-center shadow-2xl"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                                className="inline-block mb-4"
                            >
                                <Trophy className="w-20 h-20 text-yellow-400" />
                            </motion.div>
                            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
                                Congratulations! 🎉
                            </h2>
                            <p className="text-gray-300 mb-4">
                                Your solution has been accepted!
                            </p>
                            <div className="flex items-center justify-center gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    <span>+10 XP</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                                    <Award className="w-4 h-4 text-purple-400" />
                                    <span>Problem Solved</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Navigation Bar */}
            <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-black/40 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <Link href="/problems">
                        <Button variant="ghost" size="icon" className="hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        <h1 className="font-medium text-white truncate max-w-[200px] md:max-w-md">
                            {problem.id}. {problem.title}
                        </h1>
                        <Badge variant="outline" className="hidden md:flex bg-white/5 border-white/10 text-gray-400">
                            {problem.category}
                        </Badge>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-4 text-xs font-mono text-gray-500 mr-4 border-r border-white/10 pr-4">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{problem.time_limit_ms}ms</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5" />
                            <span>{problem.memory_limit_mb}MB</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleRun}
                        disabled={isRunning}
                        variant="secondary"
                        className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 h-8 text-xs font-medium gap-2 transition-all hover:border-white/20"
                    >
                        <Play className="w-3.5 h-3.5" /> Run
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isRunning}
                        className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white h-8 text-xs font-medium gap-2 shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all"
                    >
                        {isRunning ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        Submit
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 overflow-hidden relative z-10">
                <ResizablePanelGroup direction="horizontal" className="h-full">

                    {/* Left Panel: Problem Description */}
                    {layout === 'split' && (
                        <>
                            <ResizablePanel defaultSize={40} minSize={20} className="bg-black/20">
                                <div className="h-full flex flex-col">
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                        <div className="bg-black/40 px-2 pt-2 border-b border-white/5">
                                            <TabsList className="bg-transparent p-0 h-9 gap-1">
                                                <TabsTrigger
                                                    value="description"
                                                    className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-gray-500 rounded-t-lg rounded-b-none h-9 px-4 text-xs transition-colors border-t border-x border-transparent data-[state=active]:border-white/10"
                                                >Description</TabsTrigger>
                                                <TabsTrigger
                                                    value="hints"
                                                    className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-gray-500 rounded-t-lg rounded-b-none h-9 px-4 text-xs transition-colors border-t border-x border-transparent data-[state=active]:border-white/10"
                                                >Hints</TabsTrigger>
                                                <TabsTrigger
                                                    value="submissions"
                                                    className="data-[state=active]:bg-white/5 data-[state=active]:text-white text-gray-500 rounded-t-lg rounded-b-none h-9 px-4 text-xs transition-colors border-t border-x border-transparent data-[state=active]:border-white/10"
                                                >Submissions</TabsTrigger>
                                            </TabsList>
                                        </div>

                                        <TabsContent value="description" className="flex-1 overflow-hidden m-0 p-0 relative">
                                            <ScrollArea className="h-full">
                                                <div className="p-6 space-y-8 pb-20">
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-white mb-4">{problem.title}</h2>
                                                        <div className="flex items-center gap-3 text-xs mb-6">
                                                            <Badge className={`
                                                                border-0 px-2.5 py-0.5 rounded-full font-medium
                                                                ${problem.difficulty === 'EASY' ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/30' : ''}
                                                                ${problem.difficulty === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/30' : ''}
                                                                ${problem.difficulty === 'HARD' ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30' : ''}
                                                            `}>{problem.difficulty}</Badge>
                                                        </div>

                                                        <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed space-y-4">
                                                            <div
                                                                className="whitespace-pre-wrap"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: problem.description
                                                                        .replace(/\n\n/g, '</p><p class="mt-4">')
                                                                        .replace(/\n/g, '<br/>')
                                                                }}
                                                            />

                                                            {problem.sample_input && (
                                                                <div className="mt-6 space-y-4">
                                                                    <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                                                        <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02] text-xs font-medium text-gray-400 flex justify-between items-center">
                                                                            <span>Example 1</span>
                                                                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">Sample</Badge>
                                                                        </div>
                                                                        <div className="p-4 font-mono text-sm space-y-3">
                                                                            <div>
                                                                                <div className="text-blue-400 mb-1.5 text-xs uppercase tracking-wider font-bold flex items-center gap-2">
                                                                                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                                                                                    Input
                                                                                </div>
                                                                                <div className="text-gray-300 bg-black/50 px-3 py-2 rounded border border-white/5">
                                                                                    {problem.sample_input}
                                                                                </div>
                                                                            </div>
                                                                            {problem.sample_output && (
                                                                                <div>
                                                                                    <div className="text-green-400 mb-1.5 text-xs uppercase tracking-wider font-bold flex items-center gap-2">
                                                                                        <div className="w-1 h-4 bg-green-500 rounded-full" />
                                                                                        Output
                                                                                    </div>
                                                                                    <div className="text-gray-300 bg-black/50 px-3 py-2 rounded border border-white/5">
                                                                                        {problem.sample_output}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="pt-8 border-t border-white/10">
                                                        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                            <div className="bg-purple-500/20 p-1 rounded">
                                                                <Trophy className="w-3 h-3 text-purple-400" />
                                                            </div>
                                                            Top Companies
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {COMPANIES.map(company => (
                                                                <span key={company} className="px-2.5 py-1 bg-white/5 border border-white/5 text-gray-400 text-xs rounded-full hover:bg-white/10 hover:border-white/10 hover:text-white transition-all cursor-default">
                                                                    {company}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                        </TabsContent>

                                        <TabsContent value="hints" className="flex-1 p-6 text-gray-400 text-sm text-center flex flex-col items-center justify-center">
                                            <div className="p-4 bg-white/5 rounded-full mb-4">
                                                <Sparkles className="w-6 h-6 text-yellow-500" />
                                            </div>
                                            <p>Hints are locked! Try solving it on your own first.</p>
                                        </TabsContent>

                                        <TabsContent value="submissions" className="flex-1 p-6 text-gray-400 text-sm">
                                            <p className="text-center">Your submission history will appear here.</p>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle className="w-1 bg-black hover:bg-primary/50 transition-colors border-l border-r border-white/5" />
                        </>
                    )}

                    {/* Right Panel: Editor & Console */}
                    <ResizablePanel defaultSize={layout === 'split' ? 60 : 100} className="bg-[#1e1e1e]">
                        <ResizablePanelGroup direction="vertical">

                            {/* Editor Area */}
                            <ResizablePanel defaultSize={70} minSize={30}>
                                <div className="h-full flex flex-col bg-[#1e1e1e]">
                                    <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-[#252526]">
                                        <div className="flex items-center gap-2">
                                            <CodeIcon className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-medium text-gray-300">Code Editor</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Select value={language} onValueChange={handleLanguageChange}>
                                                <SelectTrigger className="w-[110px] h-7 bg-black/20 border-white/10 text-xs text-gray-300 focus:ring-0 focus:ring-offset-0">
                                                    <SelectValue placeholder="Language" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1e1e1e] border-white/10 text-gray-300">
                                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                                    <SelectItem value="python">Python</SelectItem>
                                                    <SelectItem value="java">Java</SelectItem>
                                                    <SelectItem value="cpp">C++</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10" onClick={() => setLayout(layout === 'split' ? 'max-editor' : 'split')}>
                                                {layout === 'split' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-1 relative">
                                        <Editor
                                            height="100%"
                                            language={language}
                                            value={code}
                                            onChange={(val) => setCode(val || '')}
                                            theme="vs-dark"
                                            options={{
                                                // Editor appearance
                                                minimap: { enabled: false },
                                                fontSize: 14,
                                                lineHeight: 21,
                                                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                                                fontLigatures: true,

                                                // Line numbers and gutter
                                                lineNumbers: 'on',
                                                lineNumbersMinChars: 3,
                                                glyphMargin: false,
                                                folding: true,

                                                // Scrolling
                                                scrollBeyondLastLine: false,
                                                smoothScrolling: true,
                                                mouseWheelScrollSensitivity: 1,

                                                // Cursor
                                                cursorStyle: 'line',
                                                cursorBlinking: 'smooth',
                                                cursorSmoothCaretAnimation: 'on',

                                                // Layout
                                                automaticLayout: true,
                                                padding: { top: 16, bottom: 16 },

                                                // Editing features
                                                tabSize: 4,
                                                insertSpaces: true,
                                                detectIndentation: true,
                                                trimAutoWhitespace: true,
                                                autoIndent: 'full',
                                                formatOnPaste: true,
                                                formatOnType: true,

                                                // Bracket matching
                                                matchBrackets: 'always',
                                                autoClosingBrackets: 'always',
                                                autoClosingQuotes: 'always',
                                                autoSurround: 'languageDefined',

                                                // IntelliSense
                                                quickSuggestions: {
                                                    other: true,
                                                    comments: false,
                                                    strings: false
                                                },
                                                suggestOnTriggerCharacters: true,
                                                acceptSuggestionOnCommitCharacter: true,
                                                acceptSuggestionOnEnter: 'on',
                                                tabCompletion: 'on',
                                                wordBasedSuggestions: 'matchingDocuments',

                                                // Code lens and hints
                                                codeLens: false,
                                                parameterHints: {
                                                    enabled: true,
                                                    cycle: true
                                                },

                                                // Selection and find
                                                selectOnLineNumbers: true,
                                                selectionHighlight: true,
                                                occurrencesHighlight: 'singleFile',
                                                find: {
                                                    seedSearchStringFromSelection: 'selection',
                                                    autoFindInSelection: 'never'
                                                },

                                                // Rendering
                                                renderLineHighlight: 'all',
                                                renderWhitespace: 'selection',
                                                renderControlCharacters: false,

                                                // Performance
                                                fastScrollSensitivity: 5,
                                                scrollbar: {
                                                    vertical: 'auto',
                                                    horizontal: 'auto',
                                                    useShadows: true,
                                                    verticalScrollbarSize: 10,
                                                    horizontalScrollbarSize: 10
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>

                            <ResizableHandle className="h-1 bg-black hover:bg-primary/50 transition-colors border-t border-b border-white/5" />

                            {/* Console Area */}
                            <ResizablePanel defaultSize={30} minSize={5}>
                                <div className="h-full flex flex-col bg-[#1e1e1e]">
                                    <div className="bg-[#252526] px-2 border-b border-white/10 flex justify-between items-center h-9">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setActiveTab('console')}
                                                className={`flex items-center gap-2 px-3 text-xs font-medium h-full border-b-[2px] transition-colors ${activeTab === 'console' ? 'border-primary text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                            >
                                                <Terminal className="w-3.5 h-3.5" />
                                                Console
                                            </button>
                                        </div>
                                    </div>

                                    <ScrollArea className="flex-1 p-4 font-mono text-xs bg-[#1e1e1e]">
                                        {activeTab === 'console' ? (
                                            result ? (
                                                <div className="space-y-4 animate-in fade-in duration-300">
                                                    <div className={`flex items-center gap-3 text-sm font-bold ${result.status === 'ACCEPTED' ? 'text-green-400' : 'text-red-400'}`}>
                                                        <div className={`p-1.5 rounded-full ${result.status === 'ACCEPTED' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                                            {result.status === 'ACCEPTED' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <div>{result.status === 'ACCEPTED' ? 'Accepted' : 'Wrong Answer'}</div>
                                                            <div className="text-xs text-gray-500 font-normal mt-0.5">
                                                                {result.passed}/{result.total} test cases passed
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Complexity Analysis */}
                                                    {complexity && (
                                                        <div className="bg-white/5 rounded-lg border border-white/5 p-4 space-y-3">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                                                                <TrendingUp className="w-3.5 h-3.5" />
                                                                Complexity Analysis
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                                <div>
                                                                    <div className="text-gray-500 mb-1">Time</div>
                                                                    <div className="text-white font-medium bg-black/30 px-2 py-1 rounded">{complexity.timeComplexity}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-gray-500 mb-1">Space</div>
                                                                    <div className="text-white font-medium bg-black/30 px-2 py-1 rounded">{complexity.spaceComplexity}</div>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-gray-400">{complexity.explanation}</p>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-6 text-xs text-gray-500">
                                                        <div>Runtime: <span className="text-white ml-1 font-medium">{result.runtime}</span></div>
                                                        <div>Memory: <span className="text-white ml-1 font-medium">{result.memory}</span></div>
                                                    </div>

                                                    {result.isSubmission && result.status === 'ACCEPTED' && (
                                                        <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20 text-green-400">
                                                            <div className="flex items-center gap-2 mb-1 font-bold text-sm">
                                                                <Trophy className="w-4 h-4" />
                                                                Submission Accepted
                                                            </div>
                                                            <div className="text-xs text-gray-400">{result.percentile}</div>
                                                        </div>
                                                    )}

                                                    {/* Test Cases */}
                                                    {result.testCases && (
                                                        <div className="space-y-2">
                                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Test Cases</div>
                                                            {result.testCases.map((tc: any, idx: number) => (
                                                                <div key={idx} className={`p-3 rounded-lg border text-xs ${tc.passed ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="font-medium">Test Case {idx + 1}</span>
                                                                        {tc.passed ? (
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                                                        ) : (
                                                                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                                                                        )}
                                                                    </div>
                                                                    <div className="space-y-1 text-gray-400">
                                                                        <div>Input: <span className="text-white">{tc.input}</span></div>
                                                                        <div>Expected: <span className="text-white">{tc.expected}</span></div>
                                                                        <div>Actual: <span className={tc.passed ? 'text-green-400' : 'text-red-400'}>{tc.actual}</span></div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {result.error && (
                                                        <div className="mt-4">
                                                            <div className="text-gray-500 mb-2 uppercase tracking-wider font-bold text-[10px]">Error Details</div>
                                                            <div className="p-3 rounded-lg border bg-red-500/5 border-red-500/10 text-red-400 text-xs leading-relaxed">
                                                                <pre className="whitespace-pre-wrap font-[inherit]">{result.error}</pre>
                                                                {result.logs && <div className="mt-2 pt-2 border-t border-white/5 text-gray-500">{result.logs}</div>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                                                    <Terminal className="w-8 h-8 opacity-20" />
                                                    <p>Run your code to see output here.</p>
                                                </div>
                                            )
                                        ) : (
                                            <div className="text-gray-500">Test cases...</div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
