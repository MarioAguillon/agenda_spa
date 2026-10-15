import { Router } from 'express';
import { citasController } from '../controllers/citas.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { bookingLimiter } from '../middlewares/rate-limit.middleware';
import { createCitaOnlineSchema, createCitaManualSchema, updateEstadoCitaSchema } from '../schemas/cita.schema';

const router = Router();

// Endpoint público para reservas de clientas (Con Rate Limit de reservas)
router.post(
  '/',
  bookingLimiter,
  validateMiddleware(createCitaOnlineSchema),
  (req, res, next) => citasController.createOnline(req, res, next)
);

// Endpoints protegidos para el Dashboard de Claudia
router.post(
  '/manual',
  authMiddleware,
  validateMiddleware(createCitaManualSchema),
  (req, res, next) => citasController.createManual(req, res, next)
);

router.get(
  '/',
  authMiddleware,
  (req, res, next) => citasController.getRango(req, res, next)
);

router.put(
  '/:id/estado',
  authMiddleware,
  validateMiddleware(updateEstadoCitaSchema),
  (req, res, next) => citasController.updateEstado(req, res, next)
);

export default router;
