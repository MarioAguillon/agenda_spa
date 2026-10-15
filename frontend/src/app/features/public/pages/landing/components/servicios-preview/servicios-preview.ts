import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ServiciosService } from '../../../../../servicios/services/servicios.service';
import { Servicio } from '../../../../../../core/models/servicio.model';

interface CategoriaServicio {
  nombre: string;
  imagen: string;
  emoji: string;
  servicios: Servicio[];
  isOpen: boolean;
}

@Component({
  selector: 'app-servicios-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servicios-preview.html',
  styleUrl: './servicios-preview.css'
})
export class ServiciosPreviewComponent implements OnInit {
  categorias: CategoriaServicio[] = [];

  constructor(
    private serviciosService: ServiciosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.serviciosService.getPublicServicios().subscribe({
      next: (res: any) => {
        const servicios = res.data as Servicio[];
        this.categorias = [
          {
            nombre: 'Manicure',
            imagen: '/images/cat-manicure.jpg',
            emoji: '💅',
            servicios: servicios.filter(s => s.nombre.toLowerCase().includes('manicure')),
            isOpen: false
          },
          {
            nombre: 'Pedicure',
            imagen: '/images/cat-pedicure.jpg',
            emoji: '🦶',
            servicios: servicios.filter(s => s.nombre.toLowerCase().includes('pedicure')),
            isOpen: false
          },
          {
            nombre: 'Depilación',
            imagen: '/images/cat-depilacion.jpg',
            emoji: '✨',
            servicios: servicios.filter(s => s.nombre.toLowerCase().includes('depilación') || s.nombre.toLowerCase().includes('depilacion')),
            isOpen: false
          }
        ];
      },
      error: (err: any) => console.error('Error al cargar servicios:', err)
    });
  }

  toggleCategoria(cat: CategoriaServicio): void {
    cat.isOpen = !cat.isOpen;
  }

  agendarServicio(servicio: Servicio): void {
    this.router.navigate(['/reservar'], { queryParams: { servicioId: servicio.id } });
  }

  getSubName(servicio: Servicio, categoriaNombre: string): string {
    return servicio.nombre.replace(categoriaNombre, '').trim();
  }
}
