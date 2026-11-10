import { z } from 'zod';
import { EstadoCita } from '@prisma/client';
import {
  fechaSchema, horaSchema, uuidSchema, nombreSchema, telefonoSchema,
  emailOpcionalSchema, notasSchema, servicioIdsSchema
} from './common.schema';

export const createCitaOnlineSchema = z.object({
  body: z.object({
    servicioIds: servicioIdsSchema,
    fecha: fechaSchema,
    horaInicio: horaSchema,
    cliente: z.object({
      nombre: nombreSchema,
      telefono: telefonoSchema,
      email: emailOpcionalSchema
    }),
    notas: notasSchema
  })
});

export const createCitaManualSchema = z.object({
  body: z.object({
    servicioIds: servicioIdsSchema,
    fecha: fechaSchema,
    horaInicio: horaSchema,
    clienteId: uuidSchema.optional(),
    clienteNuevo: z.object({
      nombre: nombreSchema,
      telefono: telefonoSchema,
      email: emailOpcionalSchema
    }).optional(),
    notas: notasSchema
  })
});

export const updateEstadoCitaSchema = z.object({
  params: z.object({
    id: uuidSchema
  }),
  body: z.object({
    estado: z.nativeEnum(EstadoCita)
  })
});

export const getCitasRangoSchema = z.object({
  query: z.object({
    fechaInicio: fechaSchema,
    fechaFin: fechaSchema
  }).refine(q => q.fechaFin >= q.fechaInicio, 'fechaFin debe ser igual o posterior a fechaInicio')
    .refine(q => {
      const dias = (Date.parse(q.fechaFin) - Date.parse(q.fechaInicio)) / 86_400_000;
      return dias <= 92;
    }, 'El rango máximo de consulta es de 92 días')
});

export type CreateCitaOnlineInput = z.infer<typeof createCitaOnlineSchema>['body'];
export type CreateCitaManualInput = z.infer<typeof createCitaManualSchema>['body'];
export type UpdateEstadoCitaInput = z.infer<typeof updateEstadoCitaSchema>['body'];
