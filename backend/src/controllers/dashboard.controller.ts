import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async getResumen(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resumen = await dashboardService.getResumen();
      res.status(200).json({ status: 'success', data: resumen });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
