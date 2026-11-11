import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservasService, DisponibilidadSlot } from '../../services/reservas.service';
import { Servicio } from '../../../../core/models/servicio.model';
import { HorarioNegocio } from '../../../../core/models/horario.model';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { SALON } from '../../../../core/constants/salon';
import {
  aFechaISO, desdeFechaISO, nombreDiaCorto, nombreMes, fechaLarga, hora12, duracionTexto, sumarMinutos
} from '../../../../core/utils/formato';

interface DiaOpcion {
  iso: string;
  diaCorto: string;
  numero: number;
  mes: string;
  abierto: boolean;
  esHoy: boolean;
}

interface GrupoHorario {
  nombre: string;
  icono: string;
  slots: DisponibilidadSlot[];
}

type Paso = 1 | 2 | 3;

const ORDEN_CATEGORIAS = ['Manicure', 'Pedicure', 'Depilación'];
const ICONO_CATEGORIA: Record<string, string> = {
  Manicure: 'sparkles',
  Pedicure: 'footprints',
  'Depilación': 'leaf'
};
const DIAS_VISIBLES = 21;
const CLAVE_DATOS = 'csn_datos_clienta';

@Component({
  selector: 'app-flujo-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  templateUrl: './flujo-reserva.html',
  styleUrl: './flujo-reserva.css'
})
export class FlujoReservaComponent implements OnInit {
  private reservasService = inject(ReservasService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly salon = SALON;
  readonly pasos = ['Servicios', 'Fecha y hora', 'Tus datos'];
  paso: Paso = 1;

  // Paso 1 — servicios
  servicios: Servicio[] = [];
  categorias: string[] = [];
  categoriaActiva = '';
  seleccionados: Servicio[] = [];
  cargandoServicios = true;
  errorServicios = '';

  // Paso 2 — fecha y hora
  horario: HorarioNegocio[] = [];
  dias: DiaOpcion[] = [];
  fecha = '';
  hora = '';
  grupos: GrupoHorario[] = [];
  cargandoSlots = false;
  errorSlots = '';
  /** Aviso cuando la hora elegida se ocupó mientras la clienta completaba sus datos. */
  avisoSlots = '';

  // Paso 3 — datos
  nombre = '';
  celular = '';
  notas = '';
  recordarDatos = true;
  intentoEnviar = false;

  enviando = false;
  errorEnvio = '';

  ngOnInit(): void {
    this.cargarDatosGuardados();
    this.cargarServicios();
    this.reservasService.getHorarioPublico().subscribe({
      next: (res) => { this.horario = res.data; this.construirDias(); },
      error: () => { this.horario = []; this.construirDias(); }
    });
  }

  // ---------- Paso 1 ----------
  cargarServicios(): void {
    this.cargandoServicios = true;
    this.errorServicios = '';
    this.reservasService.getServiciosDisponibles().subscribe({
      next: (res) => {
        this.servicios = res.data;
        const presentes = [...new Set(this.servicios.map(s => s.categoria || 'Otros'))];
        this.categorias = [
          ...ORDEN_CATEGORIAS.filter(c => presentes.includes(c)),
          ...presentes.filter(c => !ORDEN_CATEGORIAS.includes(c)).sort()
        ];
        this.categoriaActiva = this.categorias[0] ?? '';
        this.preseleccionarDesdeUrl();
        this.cargandoServicios = false;
      },
      error: () => {
        this.cargandoServicios = false;
        this.errorServicios = 'No pudimos cargar los servicios. Revisa tu conexión e intenta de nuevo.';
      }
    });
  }

  private preseleccionarDesdeUrl(): void {
    const id = this.route.snapshot.queryParamMap.get('servicioId');
    const servicio = id ? this.servicios.find(s => s.id === id) : undefined;
    if (servicio) {
      this.seleccionados = [servicio];
      this.categoriaActiva = servicio.categoria || this.categoriaActiva;
    }
  }

  get serviciosDeCategoria(): Servicio[] {
    return this.servicios.filter(s => (s.categoria || 'Otros') === this.categoriaActiva);
  }

  contarEnCategoria(cat: string): number {
    return this.seleccionados.filter(s => (s.categoria || 'Otros') === cat).length;
  }

  iconoCategoria(cat: string): string {
    return ICONO_CATEGORIA[cat] ?? 'flower';
  }

  estaSeleccionado(s: Servicio): boolean {
    return this.seleccionados.some(x => x.id === s.id);
  }

  alternarServicio(s: Servicio): void {
    this.seleccionados = this.estaSeleccionado(s)
      ? this.seleccionados.filter(x => x.id !== s.id)
      : [...this.seleccionados, s];
    // Cambiar servicios cambia la duración: la hora elegida puede dejar de servir
    this.hora = '';
    this.grupos = [];
  }

  get duracionTotal(): number {
    return this.seleccionados.reduce((t, s) => t + s.duracionMinutos, 0);
  }

  // ---------- Paso 2 ----------
  private construirDias(): void {
    const hoy = new Date();
    const ahoraMin = hoy.getHours() * 60 + hoy.getMinutes();
    this.dias = Array.from({ length: DIAS_VISIBLES }, (_, i) => {
      const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
      const h = this.horario.find(x => x.diaSemana === d.getDay());
      let abierto = this.horario.length === 0 ? d.getDay() !== 0 : !!h?.activo;
      if (abierto && i === 0 && h) {
        const [hh, mm] = h.horaFin.split(':').map(Number);
        abierto = ahoraMin < hh * 60 + mm - 30;
      }
      return {
        iso: aFechaISO(d),
        diaCorto: i === 0 ? 'hoy' : nombreDiaCorto(d),
        numero: d.getDate(),
        mes: nombreMes(d),
        abierto,
        esHoy: i === 0
      };
    });
  }

  get mesVisible(): string {
    const iso = this.fecha || this.dias[0]?.iso;
    if (!iso) return '';
    const d = desdeFechaISO(iso);
    return `${nombreMes(d)} ${d.getFullYear()}`;
  }

  elegirDia(dia: DiaOpcion): void {
    if (!dia.abierto) return;
    this.avisoSlots = '';
    this.fecha = dia.iso;
    this.hora = '';
    this.cargarSlots();
  }

  cargarSlots(): void {
    if (!this.fecha || !this.seleccionados.length) return;
    this.cargandoSlots = true;
    this.errorSlots = '';
    this.grupos = [];
    this.reservasService.getDisponibilidadHorarios(this.seleccionados.map(s => s.id), this.fecha).subscribe({
      next: (res) => {
        const slots = res.data;
        this.grupos = [
          { nombre: 'Mañana', icono: 'sun', slots: slots.filter(s => s.horaInicio < '12:00') },
          { nombre: 'Tarde', icono: 'sunset', slots: slots.filter(s => s.horaInicio >= '12:00' && s.horaInicio < '17:00') },
          { nombre: 'Noche', icono: 'moon', slots: slots.filter(s => s.horaInicio >= '17:00') }
        ].filter(g => g.slots.length);
        this.cargandoSlots = false;
      },
      error: () => {
        this.cargandoSlots = false;
        this.errorSlots = 'No pudimos consultar los horarios. Intenta de nuevo.';
      }
    });
  }

  elegirHora(slot: DisponibilidadSlot): void {
    this.hora = slot.horaInicio;
    this.avisoSlots = '';
  }

  siguienteDiaAbierto(): void {
    const idx = this.dias.findIndex(d => d.iso === this.fecha);
    const sig = this.dias.slice(idx + 1).find(d => d.abierto);
    if (sig) this.elegirDia(sig);
  }

  // ---------- Paso 3 ----------
  get nombreValido(): boolean {
    const n = this.nombre.trim();
    return n.length >= 2 && n.length <= 80;
  }

  get celularValido(): boolean {
    const c = this.celular.trim();
    if (!/^\+?[\d\s().-]+$/.test(c)) return false;
    const digitos = c.replace(/\D/g, '');
    return digitos.length >= 7 && digitos.length <= 12;
  }

  private cargarDatosGuardados(): void {
    try {
      const raw = localStorage.getItem(CLAVE_DATOS);
      if (raw) {
        const datos = JSON.parse(raw);
        this.nombre = typeof datos.nombre === 'string' ? datos.nombre : '';
        this.celular = typeof datos.celular === 'string' ? datos.celular : '';
      }
    } catch { /* almacenamiento no disponible: se ignora */ }
  }

  private guardarDatos(): void {
    try {
      if (this.recordarDatos) {
        localStorage.setItem(CLAVE_DATOS, JSON.stringify({ nombre: this.nombre.trim(), celular: this.celular.trim() }));
      } else {
        localStorage.removeItem(CLAVE_DATOS);
      }
    } catch { /* se ignora */ }
  }

  // ---------- Navegación ----------
  get puedeContinuar(): boolean {
    switch (this.paso) {
      case 1: return this.seleccionados.length > 0;
      case 2: return !!this.fecha && !!this.hora;
      case 3: return this.nombreValido && this.celularValido;
    }
  }

  get textoBoton(): string {
    if (this.paso === 3) return this.enviando ? 'Reservando…' : 'Confirmar cita';
    return 'Continuar';
  }

  get pistaBoton(): string {
    if (this.paso === 1) return 'Elige al menos un servicio';
    if (this.paso === 2) return this.fecha ? 'Elige una hora' : 'Elige un día';
    return 'Completa tus datos';
  }

  continuar(): void {
    if (this.paso === 3) {
      this.intentoEnviar = true;
      if (this.puedeContinuar) this.confirmar();
      return;
    }
    if (!this.puedeContinuar) return;
    this.paso = (this.paso + 1) as Paso;
    if (this.paso === 2 && !this.fecha) {
      const primero = this.dias.find(d => d.abierto);
      if (primero) this.elegirDia(primero);
    } else if (this.paso === 2 && !this.grupos.length) {
      this.cargarSlots();
    }
    this.subir();
  }

  atras(): void {
    if (this.paso > 1) {
      this.paso = (this.paso - 1) as Paso;
      this.subir();
    } else {
      this.router.navigate(['/']);
    }
  }

  irAPaso(p: Paso): void {
    if (p < this.paso) {
      this.paso = p;
      this.subir();
    }
  }

  private subir(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- Confirmar ----------
  confirmar(): void {
    if (this.enviando) return;
    this.enviando = true;
    this.errorEnvio = '';
    this.guardarDatos();

    this.reservasService.crearReservaOnline({
      servicioIds: this.seleccionados.map(s => s.id),
      fecha: this.fecha,
      horaInicio: this.hora,
      cliente: { nombre: this.nombre.trim(), telefono: this.celular.trim(), email: '' },
      notas: this.notas.trim() || undefined
    }).subscribe({
      next: (res) => {
        this.enviando = false;
        this.router.navigate(['/reservar/confirmacion'], {
          queryParams: {
            id: res.data.id,
            servicios: this.seleccionados.map(s => `${s.categoria} ${s.nombre}`).join(' · '),
            fecha: this.fecha,
            hora: this.hora,
            duracion: this.duracionTotal,
            nombre: this.nombre.trim().split(' ')[0]
          }
        });
      },
      error: (err) => {
        this.enviando = false;
        if (err.status === 409 || (err.status === 400 && /horario|pas/i.test(err.error?.message ?? ''))) {
          // El horario ya no está disponible: volver a elegir hora con la lista actualizada
          this.avisoSlots = err.error?.message || 'Ese horario acaba de ocuparse. Elige otro, por favor.';
          this.hora = '';
          this.paso = 2;
          this.cargarSlots();
          this.subir();
        } else if (err.status === 429) {
          this.errorEnvio = 'Has hecho varios intentos seguidos. Espera un momento o escríbenos por WhatsApp.';
        } else if (err.status === 0) {
          this.errorEnvio = 'Sin conexión. Revisa tu internet e intenta de nuevo.';
        } else {
          this.errorEnvio = err.error?.message || 'No pudimos registrar tu cita. Intenta de nuevo.';
        }
      }
    });
  }


  // ---------- Formato ----------
  hora12 = hora12;
  duracionTexto = duracionTexto;
  fechaLarga = fechaLarga;
  horaFin(): string {
    return this.hora ? sumarMinutos(this.hora, this.duracionTotal) : '';
  }
}
