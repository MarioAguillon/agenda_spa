import { Router } from 'express';
import { clientesController } from '../controllers/clientes.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { createClienteSchema } from '../schemas/cliente.schema';

const router = Router();

// Todas las rutas de clientes requieren autenticación JWT de Claudia
router.use(authMiddleware);

router.get('/', (req, res, next) => clientesController.getAll(req, res, next));
router.get('/:id', (req, res, next) => clientesController.getById(req, res, next));
router.post('/', validateMiddleware(createClienteSchema), (req, res, next) => clientesController.create(req, res, next));

export default router;
