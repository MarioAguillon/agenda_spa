import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button';
import { PushNotificacionService } from '../../../core/services/push-notificacion.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonComponent],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayoutComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private pushService: PushNotificacionService
  ) {}

  ngOnInit(): void {
    this.activarNotificaciones();
  }

  async activarNotificaciones(): Promise<void> {
    if (this.pushService.isSupported && !this.pushService.isPermissionGranted) {
      const resultado = await this.pushService.solicitarSuscripcion();
      if (resultado) {
        console.log('[DASHBOARD] Notificaciones Push activadas');
      }
    } else if (this.pushService.isSupported && this.pushService.isPermissionGranted) {
      // Ya tiene permisos, re-suscribir por si acaso (idempotente)
      await this.pushService.solicitarSuscripcion();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
