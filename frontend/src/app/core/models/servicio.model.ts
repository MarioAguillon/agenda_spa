export interface Servicio {
  id: string;
  negocioId: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  /** Solo visible en el panel; la API pública no lo envía. */
  precio?: number;
  duracionMinutos: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}
