import { Router } from 'express';
import { register, login, changePassword } from '../controllers/AuthController';
import { requireAuth } from '../middlewares/AuthMiddleware';

const router: Router = Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/password', requireAuth, changePassword);

export const AuthRoutes: Router = router;
