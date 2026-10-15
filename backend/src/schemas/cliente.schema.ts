import { z } from 'zod';

export const createClienteSchema = z.object({
  body: z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    telefono: z.string().min(7, 'El número de teléfono debe ser válido'),
    email: z.string().email('Email no válido').optional().or(z.literal('')),
    notas: z.string().optional()
  })
});

export const searchClienteSchema = z.object({
  query: z.object({
    search: z.string().optional()
  })
});

export type CreateClienteInput = z.infer<typeof createClienteSchema>['body'];
