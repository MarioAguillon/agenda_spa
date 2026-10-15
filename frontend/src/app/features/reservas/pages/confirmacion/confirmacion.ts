import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.css'
})
export class ConfirmacionComponent implements OnInit {
  citaId: string = '';
  servicio: string = '';
  fecha: string = '';
  hora: string = '';
  nombre: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.citaId = params['citaId'] || '';
      this.servicio = params['servicio'] || 'Servicio de Belleza';
      this.fecha = params['fecha'] || '';
      this.hora = params['hora'] || '';
      this.nombre = params['nombre'] || 'Estimada clienta';
    });
  }

  getWhatsAppLink(): string {
    const salonPhone = '573184642772';
    const message = `Claudia Santana Nails 👋\n\nHola, he reservado mi cita:\n💅 Servicio: ${this.servicio}\n📅 Fecha: ${this.fecha}\n🕐 Hora: ${this.hora}\n👤 Nombre: ${this.nombre}\n\n¡Muchas gracias! 💜`;
    return `https://wa.me/${salonPhone}?text=${encodeURIComponent(message)}`;
  }
}
