export interface Cliente {
  id: string;
  negocioId: string;
  nombre: string;
  telefono: string;
  email?: string;
  notas?: string;
  createdAt?: string;
  updatedAt?: string;
}
