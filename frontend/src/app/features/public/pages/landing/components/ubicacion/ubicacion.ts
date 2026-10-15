import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ubicacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ubicacion.html',
  styleUrl: './ubicacion.css'
})
export class UbicacionComponent {
  openGoogleMaps(): void {
    window.open('https://www.google.com/maps/search/Calle+21+%232-16+Mosquera+Cundinamarca', '_blank');
  }

  openWhatsApp(): void {
    window.open('https://wa.me/573184642772', '_blank');
  }
}
