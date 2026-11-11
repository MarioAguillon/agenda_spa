import { Component, HostListener } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { whatsappUrl } from '../../../core/constants/salon';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, NgIf],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css'
})
export class PublicLayoutComponent {
  readonly whatsapp = whatsappUrl('Hola Claudia, quisiera información sobre tus servicios.');
  scrolled = false;

  constructor(private router: Router) {}

  /** En la confirmación ya hay un botón de WhatsApp: se oculta el flotante para no taparlo. */
  get mostrarWhatsApp(): boolean {
    return !this.router.url.startsWith('/reservar');
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 24;
  }
}
