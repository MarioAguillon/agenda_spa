import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Servicio } from '../../../../../../core/models/servicio.model';

@Component({
  selector: 'app-servicio-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servicio-card.html',
  styleUrl: './servicio-card.css'
})
export class ServicioCardComponent {
  @Input() servicio!: Servicio;
  @Input() isSelected: boolean = false;
  @Output() selectServicio = new EventEmitter<Servicio>();

  onClick(): void {
    this.selectServicio.emit(this.servicio);
  }
}
