import { Request, Response, NextFunction } from 'express';
import { horariosService } from '../services/horarios.service';

export class HorariosController {
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const horarios = await horariosService.getHorarios();
      res.status(200).json({ status: 'success', data: horarios });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const horarios = await horariosService.updateHorarios(req.body);
      res.status(200).json({ status: 'success', data: horarios });
    } catch (error) {
      next(error);
    }
  }
}

export const horariosController = new HorariosController();
