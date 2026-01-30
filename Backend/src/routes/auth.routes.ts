import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation';
import { authRateLimiter } from '../config/rateLimit';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema
} from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

// Register
router.post(
    '/register',
    authRateLimiter,
    validateRequest(registerSchema),
    authController.register
);

// Login
router.post(
    '/login',
    authRateLimiter,
    validateRequest(loginSchema),
    authController.login
);

// Logout
router.post('/logout', authController.logout);

// Refresh token
router.post(
    '/refresh',
    validateRequest(refreshTokenSchema),
    authController.refreshToken
);

// Get current session
router.get('/session', authController.getSession);

// OAuth callback (Google, GitHub, etc.)
router.get('/callback/:provider', authController.oauthCallback);

export default router;
