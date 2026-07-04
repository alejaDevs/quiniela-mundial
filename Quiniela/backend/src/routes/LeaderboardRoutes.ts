import { Router } from 'express';
import {
  getLeaderboard,
  getLeaderboardByPhase,
  manualSnapshot,
  getSnapshots,
  getSnapshotByPhase,
} from '../controllers/LeaderboardController';
import { requireAuth, requireAdmin } from '../middlewares/AuthMiddleware';

const router: Router = Router();

router.get('/', getLeaderboard);
router.get('/snapshots', getSnapshots);
router.get('/snapshots/:phase', getSnapshotByPhase);
router.get('/phase/:phase', getLeaderboardByPhase);
router.post('/snapshot/:phase', requireAuth, requireAdmin, manualSnapshot);

export const LeaderboardRoutes: Router = router;
