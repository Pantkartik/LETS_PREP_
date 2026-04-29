import { Router } from 'express';
import { runCode, submitCode, getResult, createQuestion, getQuestions, getQuestionById, getUserSubmissions, getUserStats, getDetailedAnalytics, getRandomQuestions } from '../controllers/judge.controller';
import rateLimit from 'express-rate-limit';

const router = Router();

const judgeLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many requests from this IP, please try again after a minute'
});

router.post('/run', judgeLimiter, runCode);
router.post('/submit', judgeLimiter, submitCode);
router.get('/result/:token', getResult);

// Question management
router.post('/questions', createQuestion);
router.get('/questions', getQuestions);
router.get('/questions/:id', getQuestionById);
router.get('/submissions/:userId', getUserSubmissions);
router.get('/stats/:userId', getUserStats);
router.get('/performance/:userId', getDetailedAnalytics);
router.get('/random', getRandomQuestions);

export default router;
