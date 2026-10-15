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
  trabajos = [
    { imagen: '/images/gallery-1.jpg', titulo: 'Gold Foil & Nude', tag: 'Manicure' },
    { imagen: '/images/gallery-2.jpg', titulo: 'Flower Nail Art', tag: 'Softgel' },
    { imagen: '/images/cat-manicure.jpg', titulo: 'Semipermanente Clásico', tag: 'Manicure' },
    { imagen: '/images/cat-pedicure.jpg', titulo: 'Pedicure Spa Premium', tag: 'Pedicure' }
  ];
}
