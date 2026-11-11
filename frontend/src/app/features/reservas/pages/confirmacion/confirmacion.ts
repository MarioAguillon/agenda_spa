import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { SALON, whatsappUrl } from '../../../../core/constants/salon';
import { fechaLarga, hora12, duracionTexto, sumarMinutos } from '../../../../core/utils/formato';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.css'
})
export class ConfirmacionComponent implements OnInit {
  private route = inject(ActivatedRoute);

  readonly salon = SALON;
  codigo = '';
  servicios: string[] = [];
  fecha = '';
  hora = '';
  duracion = 0;
  nombre = '';
  valida = false;

  ngOnInit(): void {
    const p = this.route.snapshot.queryParamMap;
    const id = p.get('id') ?? '';
    this.codigo = id ? id.slice(0, 8).toUpperCase() : '';
    this.servicios = (p.get('servicios') ?? '').split(' · ').filter(Boolean);
    this.fecha = /^\d{4}-\d{2}-\d{2}$/.test(p.get('fecha') ?? '') ? p.get('fecha')! : '';
    this.hora = /^\d{2}:\d{2}$/.test(p.get('hora') ?? '') ? p.get('hora')! : '';
    this.duracion = Math.max(0, Math.min(600, Number(p.get('duracion')) || 0));
    this.nombre = (p.get('nombre') ?? '').slice(0, 40);
    this.valida = !!(this.fecha && this.hora);
  }

  get fechaTexto(): string { return this.fecha ? fechaLarga(this.fecha) : ''; }
  get horaTexto(): string { return this.hora ? hora12(this.hora) : ''; }
  get horaFinTexto(): string { return this.hora ? hora12(sumarMinutos(this.hora, this.duracion)) : ''; }
  get duracionTexto(): string { return duracionTexto(this.duracion); }

  /** Enlace para añadir la cita a Google Calendar (también lo abre el calendario del celular). */
  get googleCalendarUrl(): string {
    const compacta = (fecha: string, hora: string) => `${fecha.replace(/-/g, '')}T${hora.replace(':', '')}00`;
    const fin = sumarMinutos(this.hora, this.duracion || 60);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Cita en ${SALON.nombre}`,
      dates: `${compacta(this.fecha, this.hora)}/${compacta(this.fecha, fin)}`,
      ctz: SALON.zonaHoraria,
      details: `Servicios: ${this.servicios.join(', ')}${this.codigo ? `\nCódigo: ${this.codigo}` : ''}`,
      location: SALON.direccion
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  get whatsappLink(): string {
    const lineas = [
      `Hola Claudia, soy ${this.nombre || 'una clienta'}.`,
      `Acabo de reservar para el ${this.fechaTexto} a las ${this.horaTexto}.`,
      `Servicios: ${this.servicios.join(', ')}.`,
      this.codigo ? `Código: ${this.codigo}` : ''
    ].filter(Boolean);
    return whatsappUrl(lineas.join('\n'));
  }
}
