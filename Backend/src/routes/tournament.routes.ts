import { Router } from 'express';
import { TournamentController } from '../controllers/tournament.controller';
import { validateRequest } from '../middleware/validation';
import { teacherOnly } from '../middleware/auth';
import { createTournamentSchema } from '../validators/tournament.validator';

const router = Router();
const tournamentController = new TournamentController();

// Get all tournaments
router.get('/', tournamentController.getTournaments);

// Get single tournament
router.get('/:id', tournamentController.getTournament);

// Create tournament (teacher only)
router.post(
    '/',
    teacherOnly,
    validateRequest(createTournamentSchema),
    tournamentController.createTournament
);

// Update tournament (teacher only)
router.put('/:id', teacherOnly, tournamentController.updateTournament);

// Delete tournament (teacher only)
router.delete('/:id', teacherOnly, tournamentController.deleteTournament);

// Register for tournament
router.post('/:id/register', tournamentController.registerForTournament);

// Get tournament leaderboard
router.get('/:id/leaderboard', tournamentController.getLeaderboard);

// Get tournament participants
router.get('/:id/participants', tournamentController.getParticipants);

export default router;
