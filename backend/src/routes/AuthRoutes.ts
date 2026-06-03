import { Router } from 'express';
import { register, login } from '../controllers/AuthController';

const router: Router = Router();

router.post('/register', register);
router.post('/login', login);

export const AuthRoutes: Router = router;
