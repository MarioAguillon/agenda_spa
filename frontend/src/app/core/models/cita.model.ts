import { Servicio } from './servicio.model';
import { Cliente } from './cliente.model';

export type EstadoCita = 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | 'NO_ASISTIO';
export type OrigenCita = 'ONLINE' | 'DASHBOARD';

export interface Cita {
  id: string;
  negocioId: string;
  clienteId: string;
  cliente?: Cliente;
  servicios?: Servicio[];
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoCita;
  origen: OrigenCita;
  notas?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearCitaRequest {
  servicioIds: string[];
  fecha: string;
  horaInicio: string;
  cliente: {
    nombre: string;
    telefono: string;
    email?: string;
  };
  notas?: string;
}
