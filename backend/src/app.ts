import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import { apiLimiter } from './middlewares/rate-limit.middleware';
import authRoutes from './routes/auth.routes';
import serviciosRoutes from './routes/servicios.routes';
import clientesRoutes from './routes/clientes.routes';
import horariosRoutes from './routes/horarios.routes';
import bloqueosRoutes from './routes/bloqueos.routes';
import disponibilidadRoutes from './routes/disponibilidad.routes';
import citasRoutes from './routes/citas.routes';
import dashboardRoutes from './routes/dashboard.routes';
import pushRoutes from './routes/push.routes';

export const createApp = (): Express => {
  const app: Express = express();

  // Middlewares de Seguridad
  app.use(helmet());
  app.use(cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:4200'],
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate Limiting
  app.use('/api', apiLimiter);

  // Register API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/servicios', serviciosRoutes);
  app.use('/api/clientes', clientesRoutes);
  app.use('/api/horarios', horariosRoutes);
  app.use('/api/bloqueos', bloqueosRoutes);
  app.use('/api/disponibilidad', disponibilidadRoutes);
  app.use('/api/citas', citasRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/push', pushRoutes);

  // Healthcheck Route
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'Claudia Santana Nails API',
      timestamp: new Date().toISOString(),
      timezone: ENV.TIMEZONE
    });
  });

  // Placeholder para futuras rutas de API
  app.get('/api', (req: Request, res: Response) => {
    res.json({ message: 'API Claudia Santana Nails v1.0 activa' });
  });

  // Global Error Handler Middleware
  app.use(errorMiddleware);

  return app;
};
