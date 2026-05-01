import { Router } from 'express';
import problemController from '../controllers/problem.controller';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Public / Protected routes
router.get('/', protect, problemController.getAll);
router.get('/:id', protect, problemController.getOne);
router.get('/slug/:slug', protect, problemController.getBySlug);

// Restricted routes (Teacher/Admin only)
router.use(protect, restrictTo('TEACHER', 'ADMIN'));

router.post('/', problemController.create);
router.patch('/:id', problemController.update);
router.delete('/:id', problemController.delete);

export default router;
