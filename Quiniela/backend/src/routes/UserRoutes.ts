import { Router } from 'express';
import { listUsers, setUserActive } from '../controllers/UserController';
import { requireAuth, requireAdmin } from '../middlewares/AuthMiddleware';

const router: Router = Router();

router.get('/', requireAuth, requireAdmin, listUsers);
router.patch('/:id/active', requireAuth, requireAdmin, setUserActive);

export const UserRoutes: Router = router;
