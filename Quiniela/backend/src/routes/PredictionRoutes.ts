import { Router } from 'express';
import {
  listUserPredictions,
  upsertPrediction
} from '../controllers/PredictionController';
import { requireAuth } from '../middlewares/AuthMiddleware';

const router: Router = Router();

router.get('/me', requireAuth, listUserPredictions);
router.post('/', requireAuth, upsertPrediction);
router.put('/', requireAuth, upsertPrediction);

export const PredictionRoutes: Router = router;
