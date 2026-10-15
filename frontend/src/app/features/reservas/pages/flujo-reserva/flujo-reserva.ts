import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservasService, DisponibilidadSlot } from '../../services/reservas.service';
import { Servicio } from '../../../../core/models/servicio.model';
import { CalendarioComponent } from './components/calendario/calendario';
import { HorariosSlotsComponent } from './components/horarios/horarios';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { LoadingComponent } from '../../../../shared/components/loading/loading';

export interface ClientePersona {
  nombre: string;
  apellido: string;
  celular: string;
}

@Component({
  selector: 'app-flujo-reserva',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarioComponent,
    HorariosSlotsComponent,
    ButtonComponent,
    LoadingComponent
  ],
  templateUrl: './flujo-reserva.html',
  styleUrl: './flujo-reserva.css'
})
export class FlujoReservaComponent implements OnInit {
  currentStep: number = 1; // 1: Dia, 2: Datos, 3: Servicios, 4: Profesional, 5: Hora

  // Paso 1: Dia
  tipoFechaSeleccionada: 'HOY' | 'MANANA' | 'OTRA' | null = null;
  mostrarCalendario: boolean = false;
  selectedFecha: string = '';
  selectedFechaDisplay: string = '';

  // Paso 2: Datos
  cantidadPersonas: number = 1;
  personaActiva: number = 0;
  personas: ClientePersona[] = [{ nombre: '', apellido: '', celular: '' }];

  // Paso 3: Servicios
  servicios: Servicio[] = [];
  isLoadingServicios: boolean = true;
  selectedServicios: Servicio[] = [];
  serviciosPorCategoria: { [categoria: string]: Servicio[] } = {};
  categoriaActiva: string | null = null;
  categoriasOrdenadas = ['Manicure', 'Pedicure', 'Depilación'];

  // Paso 5: Hora
  selectedHora: string = '';
  slotsDisponibles: DisponibilidadSlot[] = [];
  isLoadingSlots: boolean = false;

  hoyDisponible: boolean = true;
  mananaDisponible: boolean = true;

  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(
    private reservasService: ReservasService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.checkFechasRapidas();
    this.cargarServicios();
  }

  checkFechasRapidas(): void {
    const hoy = new Date();
    if (hoy.getDay() === 0 || hoy.getHours() >= 18) {
      this.hoyDisponible = false;
    }

    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    if (manana.getDay() === 0) {
      this.mananaDisponible = false;
    }
  }

  cargarServicios(): void {
    this.isLoadingServicios = true;
    this.reservasService.getServiciosDisponibles().subscribe({
      next: (res) => {
        this.servicios = res.data;
        this.isLoadingServicios = false;
        this.agruparServicios();
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.isLoadingServicios = false;
      }
    });
  }

  agruparServicios(): void {
    this.serviciosPorCategoria = {};
    for (const s of this.servicios) {
      if (!this.serviciosPorCategoria[s.categoria]) {
        this.serviciosPorCategoria[s.categoria] = [];
      }
      this.serviciosPorCategoria[s.categoria].push(s);
    }
  }

  // -- Paso 1 --
  seleccionarTipoFecha(tipo: 'HOY' | 'MANANA' | 'OTRA'): void {
    this.tipoFechaSeleccionada = tipo;
    this.mostrarCalendario = tipo === 'OTRA';
    if (tipo === 'HOY') {
      const hoy = new Date();
      this.selectedFecha = this.getFormattedDate(hoy);
      this.selectedFechaDisplay = this.getDisplayDate(hoy);
    } else if (tipo === 'MANANA') {
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      this.selectedFecha = this.getFormattedDate(manana);
      this.selectedFechaDisplay = this.getDisplayDate(manana);
    } else {
      this.selectedFecha = '';
      this.selectedFechaDisplay = '';
    }
  }

  onSelectFecha(fecha: string): void {
    this.selectedFecha = fecha;
    const parts = fecha.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    this.selectedFechaDisplay = this.getDisplayDate(d);
  }

  getFormattedDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  getDisplayDate(date: Date): string {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }

  // -- Paso 2: Personas --
  incrementarPersonas(): void {
    if (this.cantidadPersonas < 5) {
      this.cantidadPersonas++;
      this.personas.push({ nombre: '', apellido: '', celular: '' });
    }
  }

  decrementarPersonas(): void {
    if (this.cantidadPersonas > 1) {
      this.cantidadPersonas--;
      this.personas.pop();
      if (this.personaActiva >= this.cantidadPersonas) {
        this.personaActiva = this.cantidadPersonas - 1;
      }
    }
  }

  seleccionarPersona(index: number): void {
    this.personaActiva = index;
  }

  get personaActivaData(): ClientePersona {
    return this.personas[this.personaActiva];
  }

  get datosPersonasCompletos(): boolean {
    return this.personas.every(p => p.nombre.trim() !== '' && p.celular.trim() !== '');
  }

  // -- Paso 3: Servicios --
  toggleCategoria(cat: string): void {
    if (this.categoriaActiva === cat) {
      this.categoriaActiva = null;
    } else {
      this.categoriaActiva = cat;
    }
  }

  toggleServicio(servicio: Servicio): void {
    const index = this.selectedServicios.findIndex(s => s.id === servicio.id);
    if (index > -1) {
      this.selectedServicios.splice(index, 1);
    } else {
      this.selectedServicios.push(servicio);
    }
  }

  isServicioSelected(servicio: Servicio): boolean {
    return this.selectedServicios.some(s => s.id === servicio.id);
  }

  get isServiciosSelected(): boolean {
    return this.selectedServicios.length > 0;
  }


  getIconForCategory(cat: string): string {
    const icons: any = {
      'Manicure': '💅',
      'Pedicure': '🦶',
      'Decoraciones': '✨',
      'Tratamientos': '💆‍♀️',
      'Depilación': '🕯️',
      'Rituales': '🧘‍♀️',
      'Retiros': '🧴'
    };
    return icons[cat] || '💅';
  }

  // -- Navegación Centralizada --
  get canGoNext(): boolean {
    switch (this.currentStep) {
      case 1: return !!this.selectedFecha;
      case 2: return this.datosPersonasCompletos;
      case 3: return this.isServiciosSelected;
      case 4: return true;
      case 5: return !!this.selectedHora;
      default: return false;
    }
  }

  goNext(): void {
    if (!this.canGoNext) return;

    if (this.currentStep === 4) {
      this.cargarDisponibilidad();
      return;
    }
    if (this.currentStep === 5) {
      this.confirmarReserva();
      return;
    }
    this.currentStep++;
  }

  goBack(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // -- Paso 5: Hora --
  cargarDisponibilidad(): void {
    this.isLoadingSlots = true;
    this.currentStep = 5;
    const ids = this.selectedServicios.map(s => s.id);
    this.reservasService.getDisponibilidadHorarios(ids, this.selectedFecha).subscribe({
      next: (res) => {
        this.slotsDisponibles = res.data;
        this.isLoadingSlots = false;
      },
      error: (err) => {
        console.error('Error al cargar horarios:', err);
        this.isLoadingSlots = false;
      }
    });
  }

  onSelectHora(hora: string): void {
    this.selectedHora = hora;
  }

  // -- Confirmar --
  confirmarReserva(): void {
    if (!this.isServiciosSelected || !this.selectedFecha || !this.selectedHora || !this.personas[0].nombre) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.reservasService.crearReservaOnline({
      servicioIds: this.selectedServicios.map(s => s.id),
      fecha: this.selectedFecha,
      horaInicio: this.selectedHora,
      cliente: {
        nombre: this.personas[0].nombre + ' ' + this.personas[0].apellido,
        telefono: this.personas[0].celular,
        email: ''
      }
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;

        // Construir mensaje de WhatsApp
        const telefonoNegocio = '573184642772'; // Número real de Claudia
        
        // Obtener el día de la semana
        const diasJs = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const dateObj = new Date(this.selectedFecha + 'T00:00:00.000Z');
        const nombreDia = !isNaN(dateObj.getTime()) ? diasJs[dateObj.getUTCDay()] : '';

        const nombreCompleto = `${this.personas[0].nombre} ${this.personas[0].apellido}`.trim();
        
        let mensaje = `Hola Claudia, soy ${nombreCompleto}.\nHe reservado una cita para el día ${nombreDia}, fecha ${this.selectedFecha} a las ${this.selectedHora}.\n\nServicios seleccionados:\n`;
        this.selectedServicios.forEach(s => {
          mensaje += `• ${s.categoria} ${s.nombre}\n`;
        });

        const waUrl = `https://wa.me/${telefonoNegocio}?text=${encodeURIComponent(mensaje)}`;

        // Redirigir a WhatsApp
        window.open(waUrl, '_blank');

        // Redirigir a la pantalla de confirmación localmente
        const serviciosText = this.selectedServicios.map(s => s.nombre).join(', ');
        this.router.navigate(['/reservar/confirmacion'], {
          queryParams: {
            citaId: res.data.id,
            servicio: serviciosText,
            fecha: this.selectedFecha,
            hora: this.selectedHora,
            nombre: this.personas[0].nombre
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Error al procesar la reserva. Intenta nuevamente.';
      }
    });
  }
}
