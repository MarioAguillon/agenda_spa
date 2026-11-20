import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../../../../shared/components/icon/icon';

/**
 * Sección "Conoce a Claudia": video de bienvenida con sonido.
 * No se reproduce solo: Claudia habla, así que se inicia con el botón (con sonido).
 */
@Component({
  selector: 'app-conoce-claudia',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './conoce-claudia.html',
  styleUrl: './conoce-claudia.css'
})
export class ConoceClaudiaComponent {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

  readonly videoUrl = '/videos/conoce-a-claudia.mp4';
  readonly portadaUrl = '/images/conoce-a-claudia-portada.jpg';

  /** true cuando la persona ya le dio play (se muestran los controles del video) */
  iniciado = false;

  reproducir(): void {
    const v = this.video.nativeElement;
    this.iniciado = true;
    v.muted = false;
    v.controls = true;
    v.play().catch(() => { /* si el navegador lo bloquea, quedan los controles visibles */ });
  }

  /** Al terminar vuelve a la portada con el botón dorado */
  alTerminar(): void {
    const v = this.video.nativeElement;
    v.controls = false;
    v.load();
    this.iniciado = false;
  }
}
