import { Router } from 'express';
import { SubmissionController } from '../controllers/submission.controller';
import { validateRequest } from '../middleware/validation';
import { submissionRateLimiter } from '../config/rateLimit';
import { submitCodeSchema, runCodeSchema } from '../validators/submission.validator';

const router = Router();
const submissionController = new SubmissionController();

// Submit code for evaluation
router.post(
    '/submit',
    submissionRateLimiter,
    validateRequest(submitCodeSchema),
    submissionController.submitCode
);

// Run code with custom input (no evaluation)
router.post(
    '/run',
    submissionRateLimiter,
    validateRequest(runCodeSchema),
    submissionController.runCode
);

// Get submission by ID
router.get('/:id', submissionController.getSubmission);

// Get user submissions
router.get('/user/:userId', submissionController.getUserSubmissions);

// Get problem submissions
router.get('/problem/:problemId', submissionController.getProblemSubmissions);

// Get battle submissions
router.get('/battle/:battleId', submissionController.getBattleSubmissions);

export default router;
