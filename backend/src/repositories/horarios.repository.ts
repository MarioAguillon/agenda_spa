import { prisma } from '../config/database';
import { HorarioNegocio } from '@prisma/client';

export class HorariosRepository {
  async findByNegocio(negocioId: string): Promise<HorarioNegocio[]> {
    return prisma.horarioNegocio.findMany({
      where: { negocioId },
      orderBy: { diaSemana: 'asc' }
    });
  }

  async findByDia(negocioId: string, diaSemana: number): Promise<HorarioNegocio | null> {
    return prisma.horarioNegocio.findUnique({
      where: {
        negocioId_diaSemana: { negocioId, diaSemana }
      }
    });
  }

  async upsert(negocioId: string, diaSemana: number, horaInicio: string, horaFin: string, activo: boolean): Promise<HorarioNegocio> {
    return prisma.horarioNegocio.upsert({
      where: {
        negocioId_diaSemana: { negocioId, diaSemana }
      },
      update: { horaInicio, horaFin, activo },
      create: { negocioId, diaSemana, horaInicio, horaFin, activo }
    });
  }
}

export const horariosRepository = new HorariosRepository();
