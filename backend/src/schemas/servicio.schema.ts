import { z } from 'zod';
import { uuidSchema } from './common.schema';

const nombre = z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(80);
const descripcion = z.string().trim().max(500).optional();
const duracion = z.number().int().min(10, 'La duración mínima es de 10 minutos').max(480, 'La duración máxima es de 8 horas');

export const createServicioSchema = z.object({
  body: z.object({
    nombre,
    descripcion,
    duracionMinutos: duracion
  })
});

export const updateServicioSchema = z.object({
  params: z.object({
    id: uuidSchema
  }),
  body: z.object({
    nombre: nombre.optional(),
    descripcion,
    duracionMinutos: duracion.optional(),
    activo: z.boolean().optional()
  })
});

export type CreateServicioInput = z.infer<typeof createServicioSchema>['body'];
export type UpdateServicioInput = z.infer<typeof updateServicioSchema>['body'];
