import { prisma } from '../config/database';
import { Cita, EstadoCita, OrigenCita } from '@prisma/client';

export class CitasRepository {
  async findByFecha(negocioId: string, fecha: Date): Promise<Cita[]> {
    return prisma.cita.findMany({
      where: {
        negocioId,
        fecha,
        estado: { not: EstadoCita.CANCELADA }
      },
      include: {
        cliente: true,
        servicios: true
      },
      orderBy: { horaInicio: 'asc' }
    });
  }

  async findRangoFechas(negocioId: string, fechaInicio: Date, fechaFin: Date): Promise<Cita[]> {
    return prisma.cita.findMany({
      where: {
        negocioId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        }
      },
      include: {
        cliente: true,
        servicios: true
      },
      orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }]
    });
  }

  async create(data: {
    negocioId: string;
    clienteId: string;
    servicioIds: string[];
    fecha: Date;
    horaInicio: string;
    horaFin: string;
    origen: OrigenCita;
    notas?: string;
  }): Promise<Cita> {
    const { servicioIds, ...citaData } = data;
    return prisma.cita.create({
      data: {
        ...citaData,
        estado: EstadoCita.CONFIRMADA,
        servicios: {
          connect: servicioIds.map(id => ({ id }))
        }
      },
      include: {
        cliente: true,
        servicios: true
      }
    });
  }

  async updateEstado(id: string, estado: EstadoCita): Promise<Cita> {
    return prisma.cita.update({
      where: { id },
      data: { estado },
      include: { cliente: true, servicios: true }
    });
  }
}

export const citasRepository = new CitasRepository();
