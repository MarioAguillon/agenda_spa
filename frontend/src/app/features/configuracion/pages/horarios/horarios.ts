import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorariosService } from '../../services/horarios.service';
import { HorarioNegocio } from '../../../../core/models/horario.model';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { LoadingComponent } from '../../../../shared/components/loading/loading';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, LoadingComponent],
  templateUrl: './horarios.html',
  styleUrl: './horarios.css'
})
export class HorariosComponent implements OnInit {
  horarios: HorarioNegocio[] = [];
  isLoading: boolean = true;
  isSaving: boolean = false;
  successMessage: string = '';

  // Bloqueos Model
  showBloqueoModal: boolean = false;
  bloqueoFecha: string = '';
  bloqueoHoraInicio: string = '12:00';
  bloqueoHoraFin: string = '13:00';
  bloqueoMotivo: string = 'Almuerzo';
  isSavingBloqueo: boolean = false;

  diasNombre: string[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  constructor(private horariosService: HorariosService) {}

  ngOnInit(): void {
    this.cargarHorarios();
  }

  cargarHorarios(): void {
    this.isLoading = true;
    this.horariosService.getHorarios().subscribe({
      next: (res) => {
        this.horarios = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar horarios:', err);
        this.isLoading = false;
      }
    });
  }

  guardarHorarios(): void {
    this.isSaving = true;
    this.successMessage = '';

    this.horariosService.updateHorarios(this.horarios).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = '✅ Horarios de atención guardados correctamente.';
        setTimeout(() => { this.successMessage = ''; }, 4000);
      },
      error: (err) => {
        console.error('Error al guardar horarios:', err);
        this.isSaving = false;
      }
    });
  }

  openBloqueoModal(): void {
    const today = new Date().toISOString().split('T')[0];
    this.bloqueoFecha = today;
    this.showBloqueoModal = true;
  }

  closeBloqueoModal(): void {
    this.showBloqueoModal = false;
  }

  guardarBloqueo(): void {
    if (!this.bloqueoFecha || !this.bloqueoHoraInicio || !this.bloqueoHoraFin) return;

    this.isSavingBloqueo = true;
    this.horariosService.createBloqueo({
      fecha: this.bloqueoFecha,
      horaInicio: this.bloqueoHoraInicio,
      horaFin: this.bloqueoHoraFin,
      motivo: this.bloqueoMotivo
    }).subscribe({
      next: () => {
        this.isSavingBloqueo = false;
        this.closeBloqueoModal();
        this.successMessage = '✅ Bloqueo registrado en la agenda.';
        setTimeout(() => { this.successMessage = ''; }, 4000);
      },
      error: (err) => {
        console.error('Error al registrar bloqueo:', err);
        this.isSavingBloqueo = false;
      }
    });
  }
}
