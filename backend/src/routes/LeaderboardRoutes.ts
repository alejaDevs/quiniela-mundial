import { Router } from 'express';
import { getLeaderboard } from '../controllers/LeaderboardController';

const router: Router = Router();

router.get('/', getLeaderboard);

export const LeaderboardRoutes: Router = router;
