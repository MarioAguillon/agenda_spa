import { z } from 'zod';
import { fechaSchema, horaSchema, uuidSchema } from './common.schema';

const rangoValido = (r: { horaInicio: string; horaFin: string }) => r.horaFin > r.horaInicio;

export const updateHorariosSchema = z.object({
  body: z.object({
    horarios: z.array(
      z.object({
        diaSemana: z.number().int().min(0).max(6),
        horaInicio: horaSchema,
        horaFin: horaSchema,
        activo: z.boolean()
      }).refine(rangoValido, 'La hora de cierre debe ser posterior a la de apertura')
    ).max(7)
  })
});

export const createBloqueoSchema = z.object({
  body: z.object({
    fecha: fechaSchema,
    horaInicio: horaSchema,
    horaFin: horaSchema,
    motivo: z.string().trim().max(120).optional()
  }).refine(rangoValido, 'La hora final del bloqueo debe ser posterior a la inicial')
});

export const bloqueoIdSchema = z.object({
  params: z.object({ id: uuidSchema })
});

export type UpdateHorariosInput = z.infer<typeof updateHorariosSchema>['body'];
export type CreateBloqueoInput = z.infer<typeof createBloqueoSchema>['body'];
