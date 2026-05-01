import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authLimiter } from '../config/rateLimit';

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);

export default router;
