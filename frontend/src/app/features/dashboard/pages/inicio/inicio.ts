import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, DashboardResumen } from '../../services/dashboard.service';
import { ServiciosService } from '../../../servicios/services/servicios.service';
import { ClientesService } from '../../../clientes/services/clientes.service';
import { Cita, EstadoCita } from '../../../../core/models/cita.model';
import { Servicio } from '../../../../core/models/servicio.model';
import { Cliente } from '../../../../core/models/cliente.model';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { LoadingComponent } from '../../../../shared/components/loading/loading';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, LoadingComponent],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent implements OnInit {
  resumen: DashboardResumen | null = null;
  isLoading: boolean = true;

  // Crear Cita Manual
  showCrearCitaModal: boolean = false;
  servicios: Servicio[] = [];
  clientes: Cliente[] = [];
  manualServicioId: string = '';
  manualFecha: string = '';
  manualHoraInicio: string = '09:00';
  manualClienteId: string = '';
  manualNuevoNombre: string = '';
  manualNuevoTelefono: string = '';
  manualNotas: string = '';
  useNuevoCliente: boolean = true;
  isSaving: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private serviciosService: ServiciosService,
    private clientesService: ClientesService
  ) {}

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.isLoading = true;
    this.dashboardService.getResumen().subscribe({
      next: (res) => {
        this.resumen = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar resumen:', err);
        this.isLoading = false;
      }
    });
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      CONFIRMADA: '✅ Confirmada',
      CANCELADA: '❌ Cancelada',
      COMPLETADA: '🎉 Completada',
      NO_ASISTIO: '⚠️ No Asistió'
    };
    return labels[estado] || estado;
  }

  // Kanban getters para Citas de Hoy
  get citasConfirmadas(): Cita[] {
    return this.resumen?.citasHoy.filter(c => c.estado === 'CONFIRMADA') || [];
  }

  get citasCompletadas(): Cita[] {
    return this.resumen?.citasHoy.filter(c => c.estado === 'COMPLETADA') || [];
  }

  get citasCanceladas(): Cita[] {
    return this.resumen?.citasHoy.filter(c => c.estado === 'CANCELADA' || c.estado === 'NO_ASISTIO') || [];
  }

  cambiarEstado(cita: Cita, nuevoEstado: EstadoCita): void {
    this.dashboardService.updateEstadoCita(cita.id, nuevoEstado).subscribe({
      next: (res) => {
        cita.estado = res.data.estado;
      },
      error: (err) => console.error('Error al cambiar estado:', err)
    });
  }

  openCrearCitaModal(): void {
    const today = new Date().toISOString().split('T')[0];
    this.manualFecha = today;
    this.manualServicioId = '';
    this.manualClienteId = '';
    this.manualNuevoNombre = '';
    this.manualNuevoTelefono = '';
    this.manualNotas = '';
    this.useNuevoCliente = true;
    this.showCrearCitaModal = true;

    this.serviciosService.getAllServicios().subscribe({
      next: (res) => { this.servicios = res.data.filter(s => s.activo); }
    });
    this.clientesService.getClientes().subscribe({
      next: (res) => { this.clientes = res.data; }
    });
  }

  closeCrearCitaModal(): void {
    this.showCrearCitaModal = false;
  }

  guardarCitaManual(): void {
    if (!this.manualServicioId || !this.manualFecha || !this.manualHoraInicio) return;

    this.isSaving = true;
    const payload: any = {
      servicioIds: [this.manualServicioId],
      fecha: this.manualFecha,
      horaInicio: this.manualHoraInicio,
      notas: this.manualNotas
    };

    if (this.useNuevoCliente) {
      payload.clienteNuevo = {
        nombre: this.manualNuevoNombre,
        telefono: this.manualNuevoTelefono
      };
    } else {
      payload.clienteId = this.manualClienteId;
    }

    this.dashboardService.crearCitaManual(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeCrearCitaModal();
        this.cargarResumen();
      },
      error: (err) => {
        console.error('Error al crear cita manual:', err);
        this.isSaving = false;
      }
    });
  }
}
