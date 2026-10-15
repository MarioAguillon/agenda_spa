import { z } from 'zod';
import { EstadoCita } from '@prisma/client';

export const createCitaOnlineSchema = z.object({
  body: z.object({
    servicioIds: z.array(z.string().uuid('ID de servicio no válido')).min(1, 'Debe seleccionar al menos un servicio'),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha debe ser YYYY-MM-DD'),
    horaInicio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato de hora inicio debe ser HH:mm'),
    cliente: z.object({
      nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
      telefono: z.string().min(7, 'El teléfono debe tener al menos 7 dígitos'),
      email: z.string().email('Email no válido').optional().or(z.literal(''))
    }),
    notas: z.string().optional()
  })
});

export const createCitaManualSchema = z.object({
  body: z.object({
    servicioIds: z.array(z.string().uuid('ID de servicio no válido')).min(1, 'Debe seleccionar al menos un servicio'),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha debe ser YYYY-MM-DD'),
    horaInicio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato de hora inicio debe ser HH:mm'),
    clienteId: z.string().uuid().optional(),
    clienteNuevo: z.object({
      nombre: z.string().min(2),
      telefono: z.string().min(7),
      email: z.string().email().optional().or(z.literal(''))
    }).optional(),
    notas: z.string().optional()
  })
});

export const updateEstadoCitaSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de cita no válido')
  }),
  body: z.object({
    estado: z.nativeEnum(EstadoCita)
  })
});

export type CreateCitaOnlineInput = z.infer<typeof createCitaOnlineSchema>['body'];
export type CreateCitaManualInput = z.infer<typeof createCitaManualSchema>['body'];
export type UpdateEstadoCitaInput = z.infer<typeof updateEstadoCitaSchema>['body'];
