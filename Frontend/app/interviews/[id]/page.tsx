'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { generateQuestion, submitAnswer, finishInterview } from '@/lib/actions/interviews';
import { AudioRecorder } from '@/components/interviews/audio-recorder';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ActiveInterviewPage() {
    const params = useParams();
    const router = useRouter();
    const interviewId = params.id as string;

    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [questionCount, setQuestionCount] = useState(0);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [interviewType, setInterviewType] = useState('technical'); // Default, effectively

    useEffect(() => {
        // confirm this interview exists? Or just start generating.
        // For now, let's just generate the first question
        fetchNextQuestion();
    }, []);

    const fetchNextQuestion = async () => {
        setLoading(true);
        try {
            console.log("Fetching next question for interview:", interviewId);
            // We pass history so the AI knows what not to ask again
            const q = await generateQuestion(interviewId, history);
            console.log("Received question:", q);
            if (!q) {
                console.warn("Received empty question from AI");
                toast.error("AI returned an empty question. Please try again.");
                return;
            }
            setCurrentQuestion(q);
            setQuestionCount(prev => prev + 1);
            setAnswer('');
            setFeedback(null);
        } catch (error: any) {
            console.error("Error fetching question:", error);
            toast.error("Failed to load question: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        setSubmitting(true);
        try {
            const result = await submitAnswer(interviewId, currentQuestion, answer);
            setFeedback(result);
            setHistory(prev => [...prev, { question: currentQuestion, answer }]);
            toast.success("Answer submitted!");
        } catch (error) {
            toast.error("Failed to submit answer");
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext = () => {
        if (questionCount >= 5) {
            finishInterview(interviewId).then(() => {
                router.push('/interviews');
                toast.success("Interview Completed!");
            });
        } else {
            fetchNextQuestion();
        }
    };

    if (!currentQuestion && loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="container mx-auto p-6 h-screen flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Interview Session</h1>
                <Badge variant="outline">Question {questionCount} / 5</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Left: Question & Context */}
                <div className="space-y-6 overflow-y-auto">
                    <Card className="p-6 bg-card/50 border-primary/20">
                        <h2 className="text-lg font-semibold mb-4 text-primary">Current Question</h2>
                        <div className="prose dark:prose-invert max-w-none">
                            {currentQuestion}
                        </div>
                    </Card>

                    {feedback && (
                        <Card className="p-6 bg-green-500/10 border-green-500/20">
                            <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Feedback (Score: {feedback.score})
                            </h3>
                            <p className="text-sm text-foreground/80">{feedback.feedback}</p>
                            <Button onClick={handleNext} className="mt-4 w-full">Next Question</Button>
                        </Card>
                    )}
                </div>

                {/* Right: Answer Area */}
                <div className="flex flex-col space-y-4">
                    <Card className="flex-1 p-0 overflow-hidden border-border/50 flex flex-col">
                        {/* Toggle between Code and Text/Audio based on interview type or preference? 
                   For now, let's assume a text area that can capture speech to text, 
                   or a code editor if it looks like code.
               */}
                        <div className="flex-1 min-h-[300px] relative">
                            <textarea
                                className="w-full h-full bg-background p-4 resize-none focus:outline-none font-mono"
                                placeholder="Type your answer here or use the microphone..."
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                            />
                        </div>

                        <div className="p-4 bg-muted/20 border-t border-border/50 flex items-center justify-between">
                            <AudioRecorder onTranscript={(text) => setAnswer(prev => prev + " " + text)} />

                            <Button onClick={handleSubmit} disabled={submitting || !answer.trim() || !!feedback}>
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                Submit Answer
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
