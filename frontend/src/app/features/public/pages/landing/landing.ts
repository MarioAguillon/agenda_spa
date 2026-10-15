import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeroComponent } from './components/hero/hero';
import { ServiciosPreviewComponent } from './components/servicios-preview/servicios-preview';
import { GaleriaComponent } from './components/galeria/galeria';
import { UbicacionComponent } from './components/ubicacion/ubicacion';
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeroComponent,
    ServiciosPreviewComponent,
    GaleriaComponent,
    UbicacionComponent,
    FooterComponent
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent {}
