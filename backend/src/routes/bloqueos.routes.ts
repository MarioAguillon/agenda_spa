import { Router } from 'express';
import { bloqueosController } from '../controllers/bloqueos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { createBloqueoSchema } from '../schemas/horario.schema';

const router = Router();

router.use(authMiddleware);

router.post('/', validateMiddleware(createBloqueoSchema), (req, res, next) => bloqueosController.create(req, res, next));
router.delete('/:id', (req, res, next) => bloqueosController.delete(req, res, next));

export default router;
