import { z } from 'zod';

export const updateHorariosSchema = z.object({
  body: z.object({
    horarios: z.array(
      z.object({
        diaSemana: z.number().int().min(0).max(6),
        horaInicio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato de hora inicio debe ser HH:mm'),
        horaFin: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato de hora fin debe ser HH:mm'),
        activo: z.boolean()
      })
    )
  })
});

export const createBloqueoSchema = z.object({
  body: z.object({
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha debe ser YYYY-MM-DD'),
    horaInicio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato de hora inicio debe ser HH:mm'),
    horaFin: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato de hora fin debe ser HH:mm'),
    motivo: z.string().optional()
  })
});

export type UpdateHorariosInput = z.infer<typeof updateHorariosSchema>['body'];
export type CreateBloqueoInput = z.infer<typeof createBloqueoSchema>['body'];
