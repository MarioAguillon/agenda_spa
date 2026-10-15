import webpush from 'web-push';
import { prisma } from '../config/database';

// Configurar VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@claudiasantana.com',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export class PushNotificationService {

  /**
   * Guarda la suscripción Push de un dispositivo vinculado a un usuario.
   */
  async guardarSuscripcion(usuarioId: string, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    return prisma.suscripcionPush.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        usuarioId: usuarioId
      },
      create: {
        usuarioId: usuarioId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });
  }

  /**
   * Elimina una suscripción Push (cuando el usuario la revoca).
   */
  async eliminarSuscripcion(endpoint: string) {
    return prisma.suscripcionPush.deleteMany({
      where: { endpoint }
    });
  }

  /**
   * Envía una notificación Push a TODOS los dispositivos suscritos de los administradores.
   */
  async notificarNuevaReserva(datos: {
    clienteNombre: string;
    servicios: string;
    fecha: string;
    hora: string;
  }) {
    const payload = JSON.stringify({
      title: '💅 ¡Nueva Reserva!',
      body: `${datos.clienteNombre} agendó: ${datos.servicios} para el ${datos.fecha} a las ${datos.hora}`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: {
        url: '/dashboard'
      }
    });

    const suscripciones = await prisma.suscripcionPush.findMany();

    const resultados = await Promise.allSettled(
      suscripciones.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            },
            payload
          );
        } catch (error: any) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.suscripcionPush.delete({ where: { id: sub.id } });
            console.log(`[PUSH] Suscripción expirada eliminada: ${sub.id}`);
          } else {
            console.error(`[PUSH] Error enviando a ${sub.endpoint}:`, error.message);
          }
          throw error;
        }
      })
    );

    const exitosas = resultados.filter(r => r.status === 'fulfilled').length;
    const fallidas = resultados.filter(r => r.status === 'rejected').length;
    console.log(`[PUSH] Notificaciones enviadas: ${exitosas} exitosas, ${fallidas} fallidas de ${suscripciones.length} totales`);

    return { exitosas, fallidas, total: suscripciones.length };
  }
}

export const pushNotificationService = new PushNotificationService();
