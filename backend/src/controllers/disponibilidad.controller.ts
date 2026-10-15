import { Request, Response, NextFunction } from 'express';
import { motorDisponibilidadService } from '../services/motor-disponibilidad.service';

export class DisponibilidadController {
  async getDisponibilidad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let servicioIds = req.query.servicioIds;
      if (typeof servicioIds === 'string') {
        servicioIds = servicioIds.split(',');
      }
      const fecha = req.query.fecha as string;

      const slots = await motorDisponibilidadService.calcularDisponibilidad(servicioIds as string[], fecha);
      res.status(200).json({
        status: 'success',
        data: slots
      });
    } catch (error) {
      next(error);
    }
  }
}

export const disponibilidadController = new DisponibilidadController();
