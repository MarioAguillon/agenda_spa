import { z } from 'zod';
import { fechaSchema } from './common.schema';

export const getDisponibilidadSchema = z.object({
  query: z.object({
    servicioIds: z
      .string()
      .min(1, 'Debe proveer al menos un servicioId')
      .max(400)
      .refine(
        v => {
          const ids = v.split(',');
          return ids.length <= 10 && ids.every(id => z.string().uuid().safeParse(id).success);
        },
        'servicioIds debe ser una lista de hasta 10 IDs válidos separados por coma'
      ),
    fecha: fechaSchema
  })
});

export type GetDisponibilidadQuery = z.infer<typeof getDisponibilidadSchema>['query'];
