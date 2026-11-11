import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PushNotificacionService } from '../../../core/services/push-notificacion.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayoutComponent implements OnInit {
  readonly menu = [
    { ruta: '/dashboard', texto: 'Agenda', icono: 'calendar', exacto: true },
    { ruta: '/dashboard/clientes', texto: 'Clientas', icono: 'users', exacto: false },
    { ruta: '/dashboard/servicios', texto: 'Servicios', icono: 'sparkles', exacto: false },
    { ruta: '/dashboard/configuracion', texto: 'Horarios', icono: 'clock', exacto: false }
  ];

  constructor(
    public authService: AuthService,
    private pushService: PushNotificacionService
  ) {}

  get primerNombre(): string {
    return (this.authService.currentUser()?.nombre || 'Claudia').split(' ')[0];
  }

  ngOnInit(): void {
    this.activarNotificaciones();
  }

  async activarNotificaciones(): Promise<void> {
    if (this.pushService.isSupported) {
      await this.pushService.solicitarSuscripcion();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
