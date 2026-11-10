import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';
import { loginSchema } from '../schemas/auth.schema';
import { loginLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();

router.post('/login', loginLimiter, validateMiddleware(loginSchema), (req, res, next) => authController.login(req, res, next));
router.get('/me', authMiddleware, (req, res, next) => authController.me(req, res, next));

export default router;
