import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IconComponent } from '../../../../../../shared/components/icon/icon';
import { SALON, whatsappUrl } from '../../../../../../core/constants/salon';
import { ReservasService } from '../../../../../reservas/services/reservas.service';
import { HorarioNegocio } from '../../../../../../core/models/horario.model';
import { hora12 } from '../../../../../../core/utils/formato';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

@Component({
  selector: 'app-ubicacion',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './ubicacion.html',
  styleUrl: './ubicacion.css'
})
export class UbicacionComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private reservas = inject(ReservasService);

  readonly salon = SALON;
  readonly whatsapp = whatsappUrl('Hola Claudia, quisiera información.');
  // URL constante y propia (no viene del usuario), por eso es seguro confiar en ella
  readonly mapa: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(SALON.mapsEmbed);

  horarioTexto: string[] = ['Lunes a sábado: 9:00 a. m. – 6:00 p. m.', 'Domingos y festivos: cerrado'];

  ngOnInit(): void {
    // El horario se lee de la configuración de Claudia: si ella lo cambia, la página se actualiza sola
    this.reservas.getHorarioPublico().subscribe({
      next: (res) => { if (res.data.length) this.horarioTexto = this.agrupar(res.data); },
      error: () => { /* se mantiene el texto por defecto */ }
    });
  }

  private agrupar(horarios: HorarioNegocio[]): string[] {
    const orden = [1, 2, 3, 4, 5, 6, 0];
    const lineas: string[] = [];
    let inicio = -1;
    let clave = '';
    const texto = (h?: HorarioNegocio) => h && h.activo ? `${hora12(h.horaInicio)} – ${hora12(h.horaFin)}` : 'cerrado';

    orden.forEach((dia, i) => {
      const k = texto(horarios.find(h => h.diaSemana === dia));
      if (k !== clave) {
        if (inicio >= 0) lineas.push(this.rango(orden, inicio, i - 1, clave));
        inicio = i;
        clave = k;
      }
    });
    lineas.push(this.rango(orden, inicio, orden.length - 1, clave));
    return lineas;
  }

  private rango(orden: number[], a: number, b: number, valor: string): string {
    const nombre = a === b ? DIAS[orden[a]] : `${DIAS[orden[a]]} a ${DIAS[orden[b]].toLowerCase()}`;
    return `${nombre}: ${valor}`;
  }
}
