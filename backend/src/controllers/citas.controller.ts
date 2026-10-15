import { Request, Response, NextFunction } from 'express';
import { citasService } from '../services/citas.service';

export class CitasController {
  async createOnline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cita = await citasService.createCitaOnline(req.body);
      res.status(201).json({ status: 'success', data: cita });
    } catch (error) {
      next(error);
    }
  }

  async createManual(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cita = await citasService.createCitaManual(req.body);
      res.status(201).json({ status: 'success', data: cita });
    } catch (error) {
      next(error);
    }
  }

  async getRango(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fechaInicio = req.query.fechaInicio as string;
      const fechaFin = req.query.fechaFin as string;

      const citas = await citasService.getCitasByRange(fechaInicio, fechaFin);
      res.status(200).json({ status: 'success', data: citas });
    } catch (error) {
      next(error);
    }
  }

  async updateEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cita = await citasService.updateEstado(req.params.id, req.body.estado);
      res.status(200).json({ status: 'success', data: cita });
    } catch (error) {
      next(error);
    }
  }
}

export const citasController = new CitasController();
