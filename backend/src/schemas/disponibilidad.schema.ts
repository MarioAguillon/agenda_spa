import { z } from 'zod';

export const getDisponibilidadSchema = z.object({
  query: z.object({
    servicioIds: z.string().min(1, 'Debe proveer al menos un servicioId'),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha debe ser YYYY-MM-DD')
  })
});

export type GetDisponibilidadQuery = z.infer<typeof getDisponibilidadSchema>['query'];
