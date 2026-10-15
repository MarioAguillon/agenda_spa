import { prisma } from '../config/database';
import { Servicio } from '@prisma/client';

export class ServiciosRepository {
  async findAllActivos(negocioId: string): Promise<Servicio[]> {
    return prisma.servicio.findMany({
      where: { negocioId, activo: true },
      orderBy: { nombre: 'asc' }
    });
  }

  async findAll(negocioId: string): Promise<Servicio[]> {
    return prisma.servicio.findMany({
      where: { negocioId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string): Promise<Servicio | null> {
    return prisma.servicio.findUnique({
      where: { id }
    });
  }

  async findByIds(ids: string[]): Promise<Servicio[]> {
    return prisma.servicio.findMany({
      where: { id: { in: ids } }
    });
  }

  async create(data: { negocioId: string; nombre: string; descripcion?: string; duracionMinutos: number }): Promise<Servicio> {
    return prisma.servicio.create({ data });
  }

  async update(id: string, data: Partial<{ nombre: string; descripcion: string; duracionMinutos: number; activo: boolean }>): Promise<Servicio> {
    return prisma.servicio.update({
      where: { id },
      data
    });
  }
}

export const serviciosRepository = new ServiciosRepository();
