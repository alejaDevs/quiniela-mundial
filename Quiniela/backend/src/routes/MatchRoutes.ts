import { Router } from 'express';
import {
  listMatches,
  createMatch,
  updateMatchResult,
  updateMatchFinalResult,
  listMatchPredictions
} from '../controllers/MatchController';
import { requireAuth, requireAdmin } from '../middlewares/AuthMiddleware';

const router: Router = Router();

router.get('/', listMatches);
router.get('/:id/predictions', requireAuth, listMatchPredictions);
router.post('/', requireAuth, requireAdmin, createMatch);
router.put('/:id/result', requireAuth, requireAdmin, updateMatchResult);
router.put('/:id/final-result', requireAuth, requireAdmin, updateMatchFinalResult);

export const MatchRoutes: Router = router;
