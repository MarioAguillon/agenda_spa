import rateLimit from 'express-rate-limit';

const mensaje = (message: string) => ({ status: 'error', statusCode: 429, message });

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  message: mensaje('Demasiadas solicitudes desde esta IP, por favor intente nuevamente en 15 minutos'),
  standardHeaders: true,
  legacyHeaders: false
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 intentos de reserva por hora por IP
  message: mensaje('Ha excedido el límite de reservas permitidas por hora.'),
  standardHeaders: true,
  legacyHeaders: false
});

/** Protección contra fuerza bruta: 5 intentos FALLIDOS cada 15 minutos por IP. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: mensaje('Demasiados intentos de inicio de sesión. Intente nuevamente en 15 minutos.'),
  standardHeaders: true,
  legacyHeaders: false
});
