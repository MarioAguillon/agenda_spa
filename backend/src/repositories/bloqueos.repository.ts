import { prisma } from '../config/database';
import { BloqueoHorario } from '@prisma/client';

export class BloqueosRepository {
  async findByFecha(negocioId: string, fecha: Date): Promise<BloqueoHorario[]> {
    return prisma.bloqueoHorario.findMany({
      where: { negocioId, fecha }
    });
  }

  async create(data: { negocioId: string; fecha: Date; horaInicio: string; horaFin: string; motivo?: string }): Promise<BloqueoHorario> {
    return prisma.bloqueoHorario.create({ data });
  }

  async delete(id: string): Promise<BloqueoHorario> {
    return prisma.bloqueoHorario.delete({ where: { id } });
  }
}

export const bloqueosRepository = new BloqueosRepository();
