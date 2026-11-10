import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().max(120).email('El correo electrónico no es válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(128)
  })
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
