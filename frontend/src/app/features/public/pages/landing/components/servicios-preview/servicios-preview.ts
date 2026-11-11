import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServiciosService } from '../../../../../servicios/services/servicios.service';
import { Servicio } from '../../../../../../core/models/servicio.model';
import { IconComponent } from '../../../../../../shared/components/icon/icon';
import { duracionTexto } from '../../../../../../core/utils/formato';

interface CategoriaServicio {
  nombre: string;
  imagen: string;
  icono: string;
  servicios: Servicio[];
}

const IMAGENES: Record<string, string> = {
  Manicure: '/images/cat-manicure.jpg',
  Pedicure: '/images/cat-pedicure.jpg',
  'Depilación': '/images/cat-depilacion.jpg'
};
const ICONOS: Record<string, string> = { Manicure: 'sparkles', Pedicure: 'footprints', 'Depilación': 'leaf' };
const ORDEN = ['Manicure', 'Pedicure', 'Depilación'];

@Component({
  selector: 'app-servicios-preview',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './servicios-preview.html',
  styleUrl: './servicios-preview.css'
})
export class ServiciosPreviewComponent implements OnInit {
  private serviciosService = inject(ServiciosService);

  categorias: CategoriaServicio[] = [];
  cargando = true;
  duracionTexto = duracionTexto;

  ngOnInit(): void {
    this.serviciosService.getPublicServicios().subscribe({
      next: (res) => {
        const porCategoria = new Map<string, Servicio[]>();
        for (const s of res.data) {
          const cat = s.categoria || 'Otros';
          porCategoria.set(cat, [...(porCategoria.get(cat) ?? []), s]);
        }
        const nombres = [...porCategoria.keys()].sort((a, b) => {
          const ia = ORDEN.indexOf(a), ib = ORDEN.indexOf(b);
          return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
        });
        this.categorias = nombres.map(nombre => ({
          nombre,
          imagen: IMAGENES[nombre] ?? '/images/gallery-1.jpg',
          icono: ICONOS[nombre] ?? 'flower',
          servicios: porCategoria.get(nombre)!
        }));
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }
}
