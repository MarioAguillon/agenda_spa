export interface HorarioNegocio {
  id?: string;
  negocioId?: string;
  diaSemana: number; // 0=Domingo, 1=Lunes, ...
  horaInicio: string; // "09:00"
  horaFin: string; // "18:00"
  activo: boolean;
}

export interface BloqueoHorario {
  id?: string;
  negocioId?: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
}
