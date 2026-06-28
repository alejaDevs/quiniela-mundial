import { Router } from 'express';
import { getLeaderboard, getLeaderboardByPhase } from '../controllers/LeaderboardController';

const router: Router = Router();

router.get('/', getLeaderboard);
router.get('/phase/:phase', getLeaderboardByPhase);

export const LeaderboardRoutes: Router = router;
