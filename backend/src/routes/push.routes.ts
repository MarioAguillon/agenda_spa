import { Router, Request, Response, NextFunction } from 'express';
import { pushNotificationService } from '../services/push-notification.service';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/push/subscribe - Guardar suscripción Push (requiere autenticación)
router.post('/subscribe', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuarioId = (req as any).usuario.id;
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      res.status(400).json({ status: 'error', message: 'Suscripción inválida' });
      return;
    }

    await pushNotificationService.guardarSuscripcion(usuarioId, subscription);

    res.status(201).json({
      status: 'success',
      message: 'Suscripción Push guardada correctamente'
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/push/unsubscribe - Eliminar suscripción Push
router.post('/unsubscribe', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      res.status(400).json({ status: 'error', message: 'Endpoint requerido' });
      return;
    }

    await pushNotificationService.eliminarSuscripcion(endpoint);

    res.status(200).json({
      status: 'success',
      message: 'Suscripción eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/push/vapid-key - Obtener la llave pública VAPID (no requiere autenticación)
router.get('/vapid-key', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      publicKey: process.env.VAPID_PUBLIC_KEY
    }
  });
});

export default router;
