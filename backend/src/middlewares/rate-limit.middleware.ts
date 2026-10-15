import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // límite de 200 peticiones por IP
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 reservas por hora por IP
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Ha excedido el límite de reservas permitidas por hora.'
  }
});
