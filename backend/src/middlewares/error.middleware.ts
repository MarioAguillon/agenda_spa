import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Traduce errores conocidos (Prisma, body-parser) a respuestas seguras para el cliente. */
function normalizarError(err: any): { statusCode: number; message: string } {
  if (err instanceof AppError) {
    return { statusCode: err.statusCode, message: err.message };
  }
  switch (err?.code) {
    case 'P2025': return { statusCode: 404, message: 'Recurso no encontrado' };
    case 'P2002': return { statusCode: 409, message: 'El registro ya existe' };
    case 'P2003': return { statusCode: 409, message: 'El registro está relacionado con otros datos' };
    case 'P2034': return { statusCode: 409, message: 'El horario acaba de ser tomado. Por favor elige otro.' };
  }
  if (err?.type === 'entity.parse.failed') return { statusCode: 400, message: 'JSON inválido' };
  if (err?.type === 'entity.too.large') return { statusCode: 413, message: 'La solicitud es demasiado grande' };
  // Nunca exponer mensajes internos (SQL, Prisma, rutas de archivos) al cliente
  return { statusCode: 500, message: 'Error interno del servidor' };
}

export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const { statusCode, message } = normalizarError(err);

  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.path} - ${statusCode}:`, err);
  } else {
    console.warn(`[WARN] ${req.method} ${req.path} - ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack })
  });
};
