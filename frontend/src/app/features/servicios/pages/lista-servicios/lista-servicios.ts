import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiciosService } from '../../services/servicios.service';
import { Servicio } from '../../../../core/models/servicio.model';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { LoadingComponent } from '../../../../shared/components/loading/loading';

@Component({
  selector: 'app-lista-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, LoadingComponent],
  templateUrl: './lista-servicios.html',
  styleUrl: './lista-servicios.css'
})
export class ListaServiciosComponent implements OnInit {
  servicios: Servicio[] = [];
  isLoading: boolean = true;
  showModal: boolean = false;
  editingServicioId: string | null = null;

  // Form Model
  nombre: string = '';
  descripcion: string = '';
  duracionMinutos: number = 60;
  isSaving: boolean = false;

  constructor(private serviciosService: ServiciosService) {}

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.isLoading = true;
    this.serviciosService.getAllServicios().subscribe({
      next: (res) => {
        this.servicios = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.isLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.editingServicioId = null;
    this.nombre = '';
    this.descripcion = '';
    this.duracionMinutos = 60;
    this.showModal = true;
  }

  openEditModal(servicio: Servicio): void {
    this.editingServicioId = servicio.id;
    this.nombre = servicio.nombre;
    this.descripcion = servicio.descripcion || '';
    this.duracionMinutos = servicio.duracionMinutos;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  toggleActivo(servicio: Servicio): void {
    this.serviciosService.updateServicio(servicio.id, { activo: !servicio.activo }).subscribe({
      next: (res) => {
        servicio.activo = res.data.activo;
      },
      error: (err) => console.error('Error al cambiar estado:', err)
    });
  }

  guardarServicio(): void {
    if (!this.nombre || !this.duracionMinutos) return;

    this.isSaving = true;

    if (this.editingServicioId) {
      this.serviciosService.updateServicio(this.editingServicioId, {
        nombre: this.nombre,
        descripcion: this.descripcion,
        duracionMinutos: this.duracionMinutos
      }).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.cargarServicios();
        },
        error: () => { this.isSaving = false; }
      });
    } else {
      this.serviciosService.createServicio({
        nombre: this.nombre,
        descripcion: this.descripcion,
        duracionMinutos: this.duracionMinutos
      }).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.cargarServicios();
        },
        error: () => { this.isSaving = false; }
      });
    }
  }
}
