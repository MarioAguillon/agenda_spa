import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiciosService } from '../../services/servicios.service';
import { Servicio } from '../../../../core/models/servicio.model';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { LoadingComponent } from '../../../../shared/components/loading/loading';
import { IconComponent } from '../../../../shared/components/icon/icon';

@Component({
  selector: 'app-lista-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, LoadingComponent, IconComponent],
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
  categoria: string = 'Manicure';
  duracionMinutos: number = 60;
  isSaving: boolean = false;

  constructor(private serviciosService: ServiciosService) {}

  /** Categorías existentes, para sugerirlas al crear o editar un servicio. */
  get categoriasExistentes(): string[] {
    const base = ['Manicure', 'Pedicure', 'Depilación'];
    return [...new Set([...base, ...this.servicios.map(s => s.categoria).filter(Boolean)])];
  }

  get serviciosAgrupados(): { categoria: string; servicios: Servicio[] }[] {
    return this.categoriasExistentes
      .map(categoria => ({ categoria, servicios: this.servicios.filter(s => (s.categoria || 'Otros') === categoria) }))
      .concat([{ categoria: 'Otros', servicios: this.servicios.filter(s => !s.categoria || s.categoria === 'Otros') }])
      .filter((g, i, arr) => g.servicios.length && arr.findIndex(x => x.categoria === g.categoria) === i);
  }

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
    this.categoria = 'Manicure';
    this.duracionMinutos = 60;
    this.showModal = true;
  }

  openEditModal(servicio: Servicio): void {
    this.editingServicioId = servicio.id;
    this.nombre = servicio.nombre;
    this.descripcion = servicio.descripcion || '';
    this.categoria = servicio.categoria || 'Otros';
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
    if (!this.nombre || !this.duracionMinutos || !this.categoria.trim()) return;

    this.isSaving = true;

    if (this.editingServicioId) {
      this.serviciosService.updateServicio(this.editingServicioId, {
        nombre: this.nombre,
        descripcion: this.descripcion,
        categoria: this.categoria.trim(),
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
        categoria: this.categoria.trim(),
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
