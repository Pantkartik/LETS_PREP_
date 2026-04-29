'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { JudgeService, Question, JudgeResult } from '@/lib/judge-service';
import Editor from "@monaco-editor/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Play, Send, Terminal, Clock, Database, ChevronLeft, 
    CheckCircle2, XCircle, AlertCircle, Loader2, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const LANGUAGES = [
    { id: 71, name: 'Python', monaco: 'python', starter: 'import sys\n\ndef solution():\n    # Read from stdin\n    # input_data = sys.stdin.read().split()\n    # Write your code here\n    # print("Your Output")\n    pass\n\nif __name__ == "__main__":\n    solution()' },
    { id: 93, name: 'JavaScript', monaco: 'javascript', starter: 'const fs = require(\'fs\');\n\nfunction solution() {\n    const input = fs.readFileSync(0, \'utf8\');\n    // Write your code here\n    // console.log("Your Output");\n}\n\nsolution();' },
    { id: 62, name: 'Java', monaco: 'java', starter: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n    }\n}' },
    { id: 54, name: 'C++', monaco: 'cpp', starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}' }
];

export default function JudgeWorkspace() {
    const params = useParams();
    const id = params?.id as string;
    
    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [language, setLanguage] = useState(LANGUAGES[1]); // Default JS
    const [code, setCode] = useState(LANGUAGES[1].starter);
    const [activeTab, setActiveTab] = useState('description');
    const [consoleTab, setConsoleTab] = useState('output');
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<JudgeResult | null>(null);
    const [customStdin, setCustomStdin] = useState('');

    useEffect(() => {
        if (id) fetchQuestion();
    }, [id]);

    const fetchQuestion = async () => {
        try {
            const data = await JudgeService.getQuestionById(id);
            setQuestion(data);
            setCustomStdin(data.sample_input);
        } catch (error) {
            toast.error("Failed to load question");
        } finally {
            setLoading(false);
        }
    };

    const handleRun = async () => {
        setIsRunning(true);
        setConsoleTab('output');
        try {
            const res = await JudgeService.runCode(code, language.id, customStdin);
            setResult(res);
            if (res.status.id === 3) toast.success("Code executed successfully!");
            else toast.error(`Execution failed: ${res.status.description}`);
        } catch (error) {
            toast.error("Execution failed");
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setConsoleTab('output');
        try {
            const res = await JudgeService.submitCode(id, code, language.id);
            setResult(res);
            if (res.verdict === 'Accepted') {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                toast.success("Accepted! Great job!");
            } else {
                toast.error(`Verdict: ${res.verdict}`);
            }
        } catch (error) {
            toast.error("Submission failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
    );

    if (!question) return <div>Question not found</div>;

    return (
        <div className="h-screen flex flex-col bg-[#0a0a0a] text-white overflow-hidden">
            {/* Navbar */}
            <header className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-black/40 backdrop-blur-md z-20">
                <div className="flex items-center gap-4">
                    <Link href="/judge">
                        <Button variant="ghost" size="icon" className="hover:bg-white/10">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-white/10" />
                    <h1 className="font-medium">{question.title}</h1>
                    <Badge variant="outline" className="text-xs uppercase tracking-wider bg-white/5 border-white/10 text-gray-400">
                        {question.difficulty}
                    </Badge>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={language.id.toString()} onValueChange={(val) => {
                        const lang = LANGUAGES.find(l => l.id.toString() === val);
                        if (lang) {
                            setLanguage(lang);
                            setCode(lang.starter);
                        }
                    }}>
                        <SelectTrigger className="w-[130px] h-9 bg-white/5 border-white/10 text-sm">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1e1e] border-white/10">
                            {LANGUAGES.map(l => (
                                <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button 
                        onClick={handleRun} 
                        disabled={isRunning || isSubmitting}
                        variant="secondary" 
                        className="h-9 gap-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                    >
                        {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Run
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isRunning || isSubmitting}
                        className="h-9 gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Submit
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    {/* Left: Description */}
                    <ResizablePanel defaultSize={40} minSize={20}>
                        <div className="h-full bg-black/20 flex flex-col">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                <TabsList className="bg-transparent border-b border-white/5 h-10 w-full justify-start px-2 rounded-none">
                                    <TabsTrigger value="description" className="data-[state=active]:bg-white/5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all">Description</TabsTrigger>
                                    <TabsTrigger value="editorial" className="data-[state=active]:bg-white/5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all">Editorial</TabsTrigger>
                                </TabsList>
                                <ScrollArea className="flex-1">
                                    <div className="p-6">
                                        <TabsContent value="description" className="m-0 space-y-6">
                                            <h2 className="text-2xl font-bold">{question.title}</h2>
                                            <div className="prose prose-invert max-w-none text-gray-300">
                                                <p>{question.description}</p>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Sample Input</h3>
                                                <pre className="bg-white/5 p-4 rounded-lg border border-white/5 font-mono text-sm">{question.sample_input}</pre>
                                                
                                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Sample Output</h3>
                                                <pre className="bg-white/5 p-4 rounded-lg border border-white/5 font-mono text-sm">{question.sample_output}</pre>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </ScrollArea>
                            </Tabs>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle className="w-1.5 bg-[#0a0a0a] hover:bg-primary/20 transition-all border-x border-white/5" />

                    {/* Right: Editor & Console */}
                    <ResizablePanel defaultSize={60}>
                        <ResizablePanelGroup direction="vertical">
                            {/* Editor */}
                            <ResizablePanel defaultSize={65}>
                                <div className="h-full bg-[#1e1e1e] flex flex-col">
                                    <div className="h-10 bg-[#252526] border-b border-white/5 flex items-center px-4">
                                        <span className="text-xs text-gray-400 font-mono flex items-center gap-2">
                                            <Terminal className="w-3 h-3" /> main.{language.monaco}
                                        </span>
                                    </div>
                                    <div className="flex-1 pt-4">
                                        <Editor
                                            height="100%"
                                            language={language.monaco}
                                            value={code}
                                            onChange={(val) => setCode(val || '')}
                                            theme="vs-dark"
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 14,
                                                lineNumbers: 'on',
                                                automaticLayout: true,
                                                scrollbar: { vertical: 'hidden' },
                                                padding: { top: 10 }
                                            }}
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>

                            <ResizableHandle className="h-1.5 bg-[#0a0a0a] hover:bg-primary/20 transition-all border-y border-white/5" />

                            {/* Console */}
                            <ResizablePanel defaultSize={35}>
                                <div className="h-full bg-[#0d0d0d] flex flex-col">
                                    <Tabs value={consoleTab} onValueChange={setConsoleTab} className="h-full flex flex-col">
                                        <TabsList className="bg-black/40 border-b border-white/5 h-10 w-full justify-start px-2 rounded-none">
                                            <TabsTrigger value="output" className="data-[state=active]:bg-white/5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Result</TabsTrigger>
                                            <TabsTrigger value="stdin" className="data-[state=active]:bg-white/5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Custom Input</TabsTrigger>
                                        </TabsList>
                                        
                                        <div className="flex-1 overflow-auto">
                                            <TabsContent value="output" className="m-0 h-full">
                                                <div className="p-4 font-mono text-sm">
                                                    {result ? (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`text-lg font-bold flex items-center gap-2 ${
                                                                    (result.verdict === 'Accepted' || result.status?.id === 3) ? 'text-green-500' : 'text-red-500'
                                                                }`}>
                                                                    {(result.verdict === 'Accepted' || result.status?.id === 3) ? <CheckCircle2 /> : <XCircle />}
                                                                    {result.verdict || result.status?.description || "Execution Finished"}
                                                                </div>
                                                                <div className="flex items-center gap-3 text-gray-500 text-xs">
                                                                    <div className="flex items-center gap-1.5"><Clock size={14}/> {result.execution_time || result.time || 0}s</div>
                                                                    <div className="flex items-center gap-1.5"><Database size={14}/> {result.memory_usage || result.memory || 0}KB</div>
                                                                </div>
                                                            </div>
                                                            
                                                            {result.stdout && (
                                                                <div className="space-y-2">
                                                                    <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Standard Output</div>
                                                                    <pre className="bg-white/5 p-3 rounded-lg border border-white/5 text-gray-300">{result.stdout}</pre>
                                                                </div>
                                                            )}
                                                            
                                                            {(result.stderr || result.compile_output) && (
                                                                <div className="space-y-2">
                                                                    <div className="text-xs text-red-500 uppercase tracking-widest font-bold">Error Output</div>
                                                                    <pre className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-red-400 whitespace-pre-wrap">{result.stderr || result.compile_output}</pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex flex-col items-center justify-center text-gray-600 mt-10">
                                                            <Terminal size={48} className="mb-4 opacity-20" />
                                                            <p>Run your code to see results</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </TabsContent>
                                            
                                            <TabsContent value="stdin" className="m-0 h-full p-4">
                                                <textarea
                                                    value={customStdin}
                                                    onChange={(e) => setCustomStdin(e.target.value)}
                                                    className="w-full h-full bg-black border border-white/10 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                                    placeholder="Enter custom input here..."
                                                />
                                            </TabsContent>
                                        </div>
                                    </Tabs>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>

            {/* Celebration overlay */}
            <AnimatePresence>
                {result?.verdict === 'Accepted' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
                    >
                        <div className="p-8 rounded-2xl bg-primary/20 border border-primary/30 backdrop-blur-xl flex flex-col items-center shadow-2xl">
                             <Sparkles className="w-16 h-16 text-primary animate-bounce" />
                             <h2 className="text-4xl font-bold mt-4">Accepted!</h2>
                             <p className="text-gray-400 mt-2">All test cases passed successfully.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
