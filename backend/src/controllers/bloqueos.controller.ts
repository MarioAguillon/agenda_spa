import { Request, Response, NextFunction } from 'express';
import { horariosService } from '../services/horarios.service';

export class BloqueosController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bloqueo = await horariosService.createBloqueo(req.body);
      res.status(201).json({ status: 'success', data: bloqueo });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await horariosService.deleteBloqueo(req.params.id);
      res.status(200).json({ status: 'success', message: 'Bloqueo eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }
}

export const bloqueosController = new BloqueosController();
