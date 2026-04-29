import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1';

export interface Question {
    _id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    sample_input: string;
    sample_output: string;
}

export interface JudgeResult {
    submission_id?: string;
    verdict: string;
    execution_time: number;
    memory_usage: number;
    status: {
        id: number;
        description: string;
    };
    stdout?: string;
    stderr?: string;
    compile_output?: string;
}

export class JudgeService {
    static async getQuestions(): Promise<Question[]> {
        const response = await axios.get(`${API_BASE_URL}/judge/questions`);
        return response.data;
    }

    static async getQuestionById(id: string): Promise<Question> {
        const response = await axios.get(`${API_BASE_URL}/judge/questions/${id}`);
        return response.data;
    }

    static async runCode(source_code: string, language_id: number, stdin: string): Promise<JudgeResult> {
        const response = await axios.post(`${API_BASE_URL}/judge/run`, {
            source_code,
            language_id,
            stdin
        });
        return response.data;
    }

    static async submitCode(question_id: string, source_code: string, language_id: number, user_id?: string): Promise<JudgeResult> {
        const response = await axios.post(`${API_BASE_URL}/judge/submit`, {
            question_id,
            source_code,
            language_id,
            user_id
        });
        return response.data;
    }

    static async getResult(token: string): Promise<JudgeResult> {
        const response = await axios.get(`${API_BASE_URL}/judge/result/${token}`);
        return response.data;
    }
}
