import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.css'
})
export class CalendarioComponent {
  selectedFecha: string = '';
  minFecha: string = new Date().toISOString().split('T')[0];

  @Output() selectFecha = new EventEmitter<string>();

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      // Validar si es domingo (0 = domingo en getDay())
      const selected = new Date(input.value + 'T12:00:00'); // Evitar problemas de zona horaria
      if (selected.getDay() === 0) {
        alert('Lo sentimos, no abrimos los domingos. Por favor selecciona otro día.');
        input.value = '';
        this.selectedFecha = '';
        this.selectFecha.emit('');
        return;
      }
      this.selectedFecha = input.value;
      this.selectFecha.emit(this.selectedFecha);
    }
  }
}
