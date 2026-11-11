import { Router } from 'express';
import { horariosController } from '../controllers/horarios.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { updateHorariosSchema } from '../schemas/horario.schema';

const router = Router();

// Público: días y horas de atención (sin datos sensibles) para el calendario de reservas
router.get('/publico', (req, res, next) => horariosController.getPublico(req, res, next));

router.use(authMiddleware);

router.get('/', (req, res, next) => horariosController.get(req, res, next));
router.put('/', validateMiddleware(updateHorariosSchema), (req, res, next) => horariosController.update(req, res, next));

export default router;
