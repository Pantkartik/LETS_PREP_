import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '../middleware/validation';
import { updateProfileSchema } from '../validators/user.validator';

const router = Router();
const userController = new UserController();

// Get current user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put(
    '/profile',
    validateRequest(updateProfileSchema),
    userController.updateProfile
);

// Get user statistics
router.get('/stats', userController.getUserStats);

// Get user battle history
router.get('/battles', userController.getBattleHistory);

// Get user submissions
router.get('/submissions', userController.getSubmissions);

// Get user achievements
router.get('/achievements', userController.getAchievements);

// Get user activity (for heatmap)
router.get('/activity', userController.getActivity);

// Get global leaderboard
router.get('/leaderboard/global', userController.getGlobalLeaderboard);

// Get user by ID
router.get('/:id', userController.getUserById);

// Get user's public profile
router.get('/:id/public', userController.getPublicProfile);

export default router;
