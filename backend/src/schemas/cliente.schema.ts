import { z } from 'zod';
import { nombreSchema, telefonoSchema, emailOpcionalSchema, notasSchema, uuidSchema } from './common.schema';

export const createClienteSchema = z.object({
  body: z.object({
    nombre: nombreSchema,
    telefono: telefonoSchema,
    email: emailOpcionalSchema,
    notas: notasSchema
  })
});

export const searchClienteSchema = z.object({
  query: z.object({
    search: z.string().trim().max(80).optional()
  })
});

export const clienteIdSchema = z.object({
  params: z.object({ id: uuidSchema })
});

export type CreateClienteInput = z.infer<typeof createClienteSchema>['body'];
