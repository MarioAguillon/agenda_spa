import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../services/clientes.service';
import { Cliente } from '../../../../core/models/cliente.model';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { LoadingComponent } from '../../../../shared/components/loading/loading';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, LoadingComponent],
  templateUrl: './lista-clientes.html',
  styleUrl: './lista-clientes.css'
})
export class ListaClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  isLoading: boolean = true;
  searchTerm: string = '';
  showCreateModal: boolean = false;

  // Form Model
  nombre: string = '';
  telefono: string = '';
  email: string = '';
  notas: string = '';
  isSaving: boolean = false;

  constructor(private clientesService: ClientesService) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.isLoading = true;
    this.clientesService.getClientes(this.searchTerm).subscribe({
      next: (res) => {
        this.clientes = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.cargarClientes();
  }

  openCreateModal(): void {
    this.nombre = '';
    this.telefono = '';
    this.email = '';
    this.notas = '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  guardarCliente(): void {
    if (!this.nombre || !this.telefono) return;

    this.isSaving = true;
    this.clientesService.createCliente({
      nombre: this.nombre,
      telefono: this.telefono,
      email: this.email,
      notas: this.notas
    }).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeCreateModal();
        this.cargarClientes();
      },
      error: (err) => {
        console.error('Error al guardar cliente:', err);
        this.isSaving = false;
      }
    });
  }
}
