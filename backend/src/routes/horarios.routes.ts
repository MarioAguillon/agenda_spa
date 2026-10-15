import { Router } from 'express';
import { horariosController } from '../controllers/horarios.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { updateHorariosSchema } from '../schemas/horario.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => horariosController.get(req, res, next));
router.put('/', validateMiddleware(updateHorariosSchema), (req, res, next) => horariosController.update(req, res, next));

export default router;
