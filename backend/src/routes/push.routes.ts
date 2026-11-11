import { Router, Request, Response, NextFunction } from 'express';
import { pushNotificationService } from '../services/push-notification.service';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/push/subscribe - Guardar suscripción Push (requiere autenticación)
router.post('/subscribe', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const usuarioId = req.user!.id;
    const { subscription } = req.body;

    if (
      !subscription ||
      typeof subscription.endpoint !== 'string' ||
      !subscription.endpoint.startsWith('https://') ||
      subscription.endpoint.length > 1000 ||
      typeof subscription.keys?.p256dh !== 'string' ||
      typeof subscription.keys?.auth !== 'string'
    ) {
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

    if (typeof endpoint !== 'string' || !endpoint) {
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
      publicKey: process.env.VAPID_PUBLIC_KEY || null
    }
  });
});

export default router;
