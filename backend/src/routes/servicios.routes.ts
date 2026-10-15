import { Router } from 'express';
import { serviciosController } from '../controllers/servicios.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { createServicioSchema, updateServicioSchema } from '../schemas/servicio.schema';

const router = Router();

// Rutas Públicas (para clientas)
router.get('/', (req, res, next) => serviciosController.getActive(req, res, next));

// Rutas Protegidas (Dashboard Admin)
router.get('/all', authMiddleware, (req, res, next) => serviciosController.getAll(req, res, next));
router.post('/', authMiddleware, validateMiddleware(createServicioSchema), (req, res, next) => serviciosController.create(req, res, next));
router.put('/:id', authMiddleware, validateMiddleware(updateServicioSchema), (req, res, next) => serviciosController.update(req, res, next));

export default router;
