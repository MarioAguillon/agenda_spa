import { Injectable, NgZone, signal } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const CLAVE_OCULTO = 'csn_instalar_oculto';

/**
 * Permite instalar la app (PWA) en el celular de Claudia.
 * - Android/Chrome: guarda el evento "beforeinstallprompt" y muestra el diálogo nativo al tocar "Instalar".
 * - iPhone/Safari: no existe ese evento, así que se muestran instrucciones (Compartir → Agregar a inicio).
 */
@Injectable({ providedIn: 'root' })
export class InstalarAppService {
  private evento: BeforeInstallPromptEvent | null = null;

  /** Android: hay diálogo nativo disponible */
  readonly puedeInstalar = signal(false);
  /** Ya está abierta como app instalada */
  readonly instalada = signal(false);
  /** Claudia cerró el aviso */
  readonly oculto = signal(false);

  readonly esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  constructor(zone: NgZone) {
    this.instalada.set(
      window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true
    );
    try { this.oculto.set(localStorage.getItem(CLAVE_OCULTO) === '1'); } catch { /* sin almacenamiento */ }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      zone.run(() => {
        this.evento = e as BeforeInstallPromptEvent;
        this.puedeInstalar.set(true);
      });
    });

    window.addEventListener('appinstalled', () => {
      zone.run(() => {
        this.instalada.set(true);
        this.puedeInstalar.set(false);
        this.evento = null;
      });
    });
  }

  /** Debe mostrarse el aviso de instalación */
  get mostrarAviso(): boolean {
    return !this.instalada() && !this.oculto() && (this.puedeInstalar() || this.esIOS);
  }

  async instalar(): Promise<void> {
    if (!this.evento) return;
    await this.evento.prompt();
    const { outcome } = await this.evento.userChoice;
    if (outcome === 'accepted') this.instalada.set(true);
    this.evento = null;
    this.puedeInstalar.set(false);
  }

  ocultar(): void {
    this.oculto.set(true);
    try { localStorage.setItem(CLAVE_OCULTO, '1'); } catch { /* sin almacenamiento */ }
  }
}
