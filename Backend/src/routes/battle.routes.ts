import { Router } from 'express';
import { BattleController } from '../controllers/battle.controller';
import { validateRequest } from '../middleware/validation';
import { teacherOnly } from '../middleware/auth';
import {
    createBattleSchema,
    joinBattleSchema,
    updateBattleSchema
} from '../validators/battle.validator';

const router = Router();
const battleController = new BattleController();

// Get all battles (with filters)
router.get('/', battleController.getBattles);

// Get single battle
router.get('/:id', battleController.getBattle);

// Create battle
router.post(
    '/',
    validateRequest(createBattleSchema),
    battleController.createBattle
);

// Update battle (creator or teacher only)
router.put(
    '/:id',
    validateRequest(updateBattleSchema),
    battleController.updateBattle
);

// Delete battle (creator or teacher only)
router.delete('/:id', battleController.deleteBattle);

// Join battle
router.post(
    '/:id/join',
    validateRequest(joinBattleSchema),
    battleController.joinBattle
);

// Leave battle
router.post('/:id/leave', battleController.leaveBattle);

// Start battle (creator only)
router.post('/:id/start', battleController.startBattle);

// End battle (creator only)
router.post('/:id/end', battleController.endBattle);

// Get battle leaderboard
router.get('/:id/leaderboard', battleController.getLeaderboard);

// Get battle participants
router.get('/:id/participants', battleController.getParticipants);

// Get battle chat messages
router.get('/:id/chat', battleController.getChatMessages);

// Join battle by room code
router.post('/join-by-code', battleController.joinByRoomCode);

export default router;
