import { Router } from 'express';
import { ProblemController } from '../controllers/problem.controller';
import { validateRequest } from '../middleware/validation';
import { teacherOnly } from '../middleware/auth';
import {
    createProblemSchema,
    updateProblemSchema
} from '../validators/problem.validator';

const router = Router();
const problemController = new ProblemController();

// Get all problems (with filters)
router.get('/', problemController.getProblems);

// Get single problem
router.get('/:id', problemController.getProblem);

// Get problem by slug
router.get('/slug/:slug', problemController.getProblemBySlug);

// Create problem (teacher only)
router.post(
    '/',
    teacherOnly,
    validateRequest(createProblemSchema),
    problemController.createProblem
);

// Update problem (teacher only)
router.put(
    '/:id',
    teacherOnly,
    validateRequest(updateProblemSchema),
    problemController.updateProblem
);

// Delete problem (teacher only)
router.delete('/:id', teacherOnly, problemController.deleteProblem);

// Get problem statistics
router.get('/:id/stats', problemController.getProblemStats);

// Get random problem
router.get('/random/get', problemController.getRandomProblem);

export default router;
