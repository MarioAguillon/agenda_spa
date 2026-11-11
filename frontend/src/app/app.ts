import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InstalarAppService } from './core/services/instalar-app.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'Claudia Santana Nails';

  // Se crea al inicio para capturar a tiempo el evento de instalación de la PWA
  constructor(_instalar: InstalarAppService) {}
}
