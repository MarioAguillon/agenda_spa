export interface Servicio {
  id: string;
  negocioId: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio: number;
  duracionMinutos: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}
