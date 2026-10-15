import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisponibilidadSlot } from '../../../../services/reservas.service';

@Component({
  selector: 'app-horarios-slots',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horarios.html',
  styleUrl: './horarios.css'
})
export class HorariosSlotsComponent {
  @Input() slots: DisponibilidadSlot[] = [];
  @Input() selectedHora: string = '';
  @Output() selectHora = new EventEmitter<string>();

  onSelect(hora: string): void {
    this.selectHora.emit(hora);
  }
}
