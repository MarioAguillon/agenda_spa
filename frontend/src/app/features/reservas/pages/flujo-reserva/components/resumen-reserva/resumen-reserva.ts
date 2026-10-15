import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Servicio } from '../../../../../../core/models/servicio.model';
import { ClienteFormData } from '../formulario-cliente/formulario-cliente';
import { ButtonComponent } from '../../../../../../shared/components/button/button';

@Component({
  selector: 'app-resumen-reserva',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './resumen-reserva.html',
  styleUrl: './resumen-reserva.css'
})
export class ResumenReservaComponent {
  @Input() servicios: Servicio[] = [];
  @Input() fecha: string = '';
  @Input() hora: string = '';
  @Input() cliente!: ClienteFormData;
  @Input() isSubmitting: boolean = false;

  @Output() confirmReserva = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmReserva.emit();
  }
}
