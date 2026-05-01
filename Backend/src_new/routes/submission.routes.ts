import { Router } from 'express';
import submissionController from '../controllers/submission.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.post('/', submissionController.submit);
router.get('/', submissionController.getUserSubmissions);
router.get('/:id', submissionController.getOne);

export default router;
