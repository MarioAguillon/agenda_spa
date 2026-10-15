import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { API_BASE_URL } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class PushNotificacionService {
  private apiUrl = API_BASE_URL;

  constructor(
    private http: HttpClient,
    private swPush: SwPush
  ) {}

  /**
   * Solicita permisos de notificación al navegador y suscribe al usuario.
   * Debe llamarse desde el Dashboard después del login.
   */
  async solicitarSuscripcion(): Promise<boolean> {
    try {
      // 1. Obtener la llave VAPID pública del backend
      const vapidRes: any = await this.http.get(`${this.apiUrl}/push/vapid-key`).toPromise();
      const vapidPublicKey = vapidRes.data.publicKey;

      if (!vapidPublicKey) {
        console.warn('[PUSH] No se encontró la clave VAPID pública');
        return false;
      }

      // 2. Solicitar la suscripción Push al navegador
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: vapidPublicKey
      });

      // 3. Enviar la suscripción al backend para guardarla
      await this.http.post(`${this.apiUrl}/push/subscribe`, {
        subscription: subscription.toJSON()
      }).toPromise();

      console.log('[PUSH] Suscripción Push guardada exitosamente');
      return true;
    } catch (error) {
      console.error('[PUSH] Error al suscribirse:', error);
      return false;
    }
  }

  /**
   * Verifica si el navegador soporta notificaciones Push.
   */
  get isSupported(): boolean {
    return this.swPush.isEnabled;
  }

  /**
   * Verifica si ya tiene permisos concedidos.
   */
  get isPermissionGranted(): boolean {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  }
}
