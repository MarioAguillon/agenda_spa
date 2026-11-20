import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Trabajo {
  titulo: string;
  tag: string;
  /** Foto (se usa si no hay video) */
  imagen?: string;
  /** Video corto en public/videos: se reproduce en silencio y en bucle al verse en pantalla */
  video?: string;
  /** Qué parte de la foto o del video se ve cuando se recorta (CSS object-position) */
  posicion?: string;
}

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './galeria.html',
  styleUrl: './galeria.css'
})
export class GaleriaComponent implements AfterViewInit, OnDestroy {
  // Para cambiar fotos: poner los archivos en public/images y actualizar esta lista
  trabajos: Trabajo[] = [
    { imagen: '/images/gallery-1.jpg', titulo: 'Nude con lámina dorada', tag: 'Manicure' },
    { imagen: '/images/galeria-softgel.jpg', titulo: 'Francés con detalles dorados', tag: 'Softgel', posicion: '50% 62%' },
    { imagen: '/images/galeria-semipermanente.jpg', titulo: 'Semipermanente clásico', tag: 'Manicure', posicion: '50% 68%' },
    { imagen: '/images/galeria-manicure-tradicional.jpg', titulo: 'Manicure tradicional', tag: 'Manicure', posicion: '50% 55%' },
    { video: '/videos/el-salon.mp4', titulo: 'Tu momento de calma', tag: 'El salón' }
  ];

  @ViewChildren('clip') clips!: QueryList<ElementRef<HTMLVideoElement>>;

  private observador?: IntersectionObserver;
  private readonly menosMovimiento =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  ngAfterViewInit(): void {
    const videos = this.clips.map(c => c.nativeElement);
    // Los navegadores solo permiten reproducción automática si el video está silenciado
    videos.forEach(v => { v.muted = true; });

    if (this.menosMovimiento || typeof IntersectionObserver === 'undefined') return;

    // Reproduce cuando al menos la mitad del video está en pantalla; pausa al salir (ahorra batería y datos)
    this.observador = new IntersectionObserver(entradas => {
      for (const e of entradas) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) this.reproducir(v);
        else v.pause();
      }
    }, { threshold: 0.5 });
    videos.forEach(v => this.observador!.observe(v));
  }

  /** En computador también arranca al pasar el cursor (útil si la persona prefiere menos movimiento) */
  alEntrar(v: HTMLVideoElement): void {
    this.reproducir(v);
  }

  alSalir(v: HTMLVideoElement): void {
    if (this.menosMovimiento) v.pause();
  }

  private reproducir(v: HTMLVideoElement): void {
    v.muted = true;
    v.play().catch(() => { /* el navegador lo bloqueó: se queda la primera imagen */ });
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
  }
}
