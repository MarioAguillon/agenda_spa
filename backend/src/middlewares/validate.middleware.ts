import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodEffects, ZodError } from 'zod';
import { AppError } from './error.middleware';

type Esquema = AnyZodObject | ZodEffects<AnyZodObject>;

/**
 * Valida body/query/params con Zod y REEMPLAZA los valores de la request
 * por los ya parseados: así se aplican trim/normalizaciones y se descartan
 * campos no declarados (evita asignación masiva de propiedades).
 */
export const validateMiddleware = (schema: Esquema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors
          .map(e => {
            const campo = e.path.filter(p => !['body', 'query', 'params'].includes(String(p))).join('.');
            return campo ? `${campo}: ${e.message}` : e.message;
          })
          .join(', ');
        next(new AppError(`Error de validación: ${issues}`, 400));
      } else {
        next(error);
      }
    }
  };
};
