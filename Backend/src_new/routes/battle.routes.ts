import { Router } from 'express';
import battleController from '../controllers/battle.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', battleController.getAll);
router.post('/', battleController.create);
router.get('/:id', battleController.getOne);
router.post('/:id/join', battleController.join);
router.post('/:id/start', battleController.start);

export default router;
