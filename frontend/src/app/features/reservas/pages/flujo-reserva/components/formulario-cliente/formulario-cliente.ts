import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ClienteFormData {
  nombre: string;
  telefono: string;
  email?: string;
}

@Component({
  selector: 'app-formulario-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-cliente.html',
  styleUrl: './formulario-cliente.css'
})
export class FormularioClienteComponent {
  nombre: string = '';
  telefono: string = '';
  email: string = '';

  @Output() formSubmit = new EventEmitter<ClienteFormData>();
  @Output() goBack = new EventEmitter<void>();

  onBack(event: Event): void {
    event.preventDefault();
    this.goBack.emit();
  }

  onSubmit(): void {
    if (this.nombre && this.telefono) {
      this.formSubmit.emit({
        nombre: this.nombre,
        telefono: this.telefono,
        email: this.email
      });
    }
  }
}
