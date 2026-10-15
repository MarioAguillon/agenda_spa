import { z } from 'zod';

export const createServicioSchema = z.object({
  body: z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    descripcion: z.string().optional(),
    duracionMinutos: z.number().int().min(10, 'La duración mínima es de 10 minutos')
  })
});

export const updateServicioSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de servicio no válido')
  }),
  body: z.object({
    nombre: z.string().min(2).optional(),
    descripcion: z.string().optional(),
    duracionMinutos: z.number().int().min(10).optional(),
    activo: z.boolean().optional()
  })
});

export type CreateServicioInput = z.infer<typeof createServicioSchema>['body'];
export type UpdateServicioInput = z.infer<typeof updateServicioSchema>['body'];
