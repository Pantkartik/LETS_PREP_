import { Router } from 'express';
import userController from '../controllers/user.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);

export default router;
