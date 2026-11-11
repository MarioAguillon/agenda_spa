import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './galeria.html',
  styleUrl: './galeria.css'
})
export class GaleriaComponent {
  // Para cambiar fotos: reemplazar los archivos en public/images (formato vertical u horizontal sirve)
  trabajos = [
    { imagen: '/images/gallery-1.jpg', titulo: 'Nude con lámina dorada', tag: 'Manicure' },
    { imagen: '/images/gallery-2.jpg', titulo: 'Arte floral', tag: 'Softgel' },
    { imagen: '/images/cat-manicure.jpg', titulo: 'Semipermanente clásico', tag: 'Manicure' },
    { imagen: '/images/cat-pedicure.jpg', titulo: 'Pedicure spa', tag: 'Pedicure' },
    { imagen: '/images/hero-bg.jpg', titulo: 'Tu momento de calma', tag: 'El salón' }
  ];
}
