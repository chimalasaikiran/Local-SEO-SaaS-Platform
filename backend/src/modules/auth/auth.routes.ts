import { Router } from 'express';
import { register, login, logout, getMe } from './auth.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import { requireAuth } from '../../middlewares/auth.middleware';
import { registerSchema, loginSchema } from './auth.schema';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export { router as authRouter };
