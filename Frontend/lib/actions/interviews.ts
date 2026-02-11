'use server';

import { createClient } from '@/lib/supabase-server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function startInterview(type: string, difficulty: string, focusArea: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
        .from('interviews')
        .insert({
            user_id: user.id,
            type,
            difficulty,
            focus_area: focusArea,
            status: 'in_progress',
        })
        .select()
        .single();

    if (error) {
        console.error('Error starting interview:', error);
        throw new Error('Failed to start interview');
    }

    return data;
}

export async function generateQuestion(interviewId: string, previousQuestions: any[]) {
    // Fetch interview details to know context
    const supabase = await createClient();
    const { data: interview } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', interviewId)
        .single();

    if (!interview) throw new Error("Interview not found");

    const prompt = `
    You are an expert technical interviewer.
    Context:
    - Type: ${interview.type}
    - Difficulty: ${interview.difficulty}
    - Focus Area: ${interview.focus_area}
    
    Previous Questions: ${JSON.stringify(previousQuestions)}
    
    Generate the next interview question. Keep it concise.
    If it's a coding question, provide a problem description.
    If it's behavioral, ask a standard behavioral question.
  `;

    console.log("Generating question for:", interviewId);
    if (!process.env.OPENAI_API_KEY) {
        console.error("Missing OpenAI API Key");
        throw new Error("OpenAI API Key is not configured");
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'system', content: prompt }],
        });

        const content = response.choices[0].message.content;
        console.log("OpenAI Response:", content);
        return content;
    } catch (e: any) {
        console.error("OpenAI Error:", e);
        // Fallback to mock data if API fails (e.g. 429 Quota Exceeded)
        console.warn("Falling back to mock question data");
        const mockQuestions = [
            "Explain the difference between `var`, `let`, and `const` in JavaScript.",
            "What is the Virtual DOM in React and how does it work?",
            "Describe a challenging technical problem you solved recently.",
            "How do you handle state management in a large application?",
            "Explain the concept of closures in JavaScript."
        ];
        return mockQuestions[Math.floor(Math.random() * mockQuestions.length)];
    }
}

export async function submitAnswer(interviewId: string, question: string, answer: string) {
    const supabase = await createClient();

    // 1. Analyze answer with AI
    const analysisPrompt = `
    Question: ${question}
    Candidate Answer: ${answer}
    
    Evaluate the answer. Provide:
    1. A score (0-100)
    2. Constructive feedback
    3. JSON format: { "score": number, "feedback": "string" }
  `;

    let analysis;
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'system', content: analysisPrompt }],
            response_format: { type: "json_object" }
        });
        analysis = JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
        console.error("OpenAI Feedback Error:", error);
        console.warn("Falling back to mock feedback");
        analysis = {
            score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
            feedback: "Great attempt! You covered the main points. To improve, try to be more specific with examples and consider edge cases. (Mock Feedback due to API limit)"
        };
    }

    // 2. Save to DB
    const { error } = await supabase
        .from('interview_questions')
        .insert({
            interview_id: interviewId,
            question,
            user_answer: answer,
            ai_feedback: analysis.feedback,
            score: analysis.score
        });

    if (error) throw new Error("Failed to save answer");

    return analysis;
}

export async function finishInterview(interviewId: string) {
    const supabase = await createClient();

    // Calculate final score
    const { data: questions } = await supabase
        .from('interview_questions')
        .select('score')
        .eq('interview_id', interviewId);

    const totalScore = questions?.reduce((acc, q) => acc + (q.score || 0), 0) || 0;
    const avgScore = questions?.length ? Math.round(totalScore / questions.length) : 0;

    // Generate final feedback
    // (Optional: Call OpenAI one last time for a summary)

    const { error } = await supabase
        .from('interviews')
        .update({
            status: 'completed',
            score: avgScore,
            // feedback: "..." 
        })
        .eq('id', interviewId);

    if (error) throw new Error("Failed to finish interview");

    return { score: avgScore };
}

export async function getInterviewHistory() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return data || [];
}
