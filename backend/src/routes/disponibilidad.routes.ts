import { Router } from 'express';
import { disponibilidadController } from '../controllers/disponibilidad.controller';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { getDisponibilidadSchema } from '../schemas/disponibilidad.schema';

const router = Router();

// Endpoint público para consulta de disponibilidad en el wizard de cliente
router.get('/', validateMiddleware(getDisponibilidadSchema), (req, res, next) =>
  disponibilidadController.getDisponibilidad(req, res, next)
);

export default router;
