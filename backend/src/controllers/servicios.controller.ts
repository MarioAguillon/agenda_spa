import { Request, Response, NextFunction } from 'express';
import { serviciosService } from '../services/servicios.service';

export class ServiciosController {
  async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const servicios = await serviciosService.getActiveServices();
      res.status(200).json({ status: 'success', data: servicios });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const servicios = await serviciosService.getAllServices();
      res.status(200).json({ status: 'success', data: servicios });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const servicio = await serviciosService.createService(req.body);
      res.status(201).json({ status: 'success', data: servicio });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const servicio = await serviciosService.updateService(req.params.id, req.body);
      res.status(200).json({ status: 'success', data: servicio });
    } catch (error) {
      next(error);
    }
  }
}

export const serviciosController = new ServiciosController();
