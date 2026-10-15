import { Request, Response, NextFunction } from 'express';
import { clientesService } from '../services/clientes.service';

export class ClientesController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const clientes = await clientesService.getClientes(search);
      res.status(200).json({ status: 'success', data: clientes });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cliente = await clientesService.getClienteById(req.params.id);
      res.status(200).json({ status: 'success', data: cliente });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cliente = await clientesService.createCliente(req.body);
      res.status(201).json({ status: 'success', data: cliente });
    } catch (error) {
      next(error);
    }
  }
}

export const clientesController = new ClientesController();
