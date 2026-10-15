import { prisma } from '../config/database';
import { Cliente } from '@prisma/client';

export class ClientesRepository {
  async findByTelefono(negocioId: string, telefono: string): Promise<Cliente | null> {
    return prisma.cliente.findFirst({
      where: { negocioId, telefono }
    });
  }

  async findById(id: string): Promise<Cliente | null> {
    return prisma.cliente.findUnique({
      where: { id },
      include: {
        citas: {
          include: {
            servicios: true
          },
          orderBy: { fecha: 'desc' }
        }
      }
    });
  }

  async findAll(negocioId: string, search?: string): Promise<Cliente[]> {
    return prisma.cliente.findMany({
      where: {
        negocioId,
        ...(search ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { telefono: { contains: search } }
          ]
        } : {})
      },
      orderBy: { nombre: 'asc' }
    });
  }

  async upsertByTelefono(negocioId: string, data: { nombre: string; telefono: string; email?: string }): Promise<Cliente> {
    const existente = await this.findByTelefono(negocioId, data.telefono);
    if (existente) {
      return prisma.cliente.update({
        where: { id: existente.id },
        data: { nombre: data.nombre, email: data.email || existente.email }
      });
    }
    return prisma.cliente.create({
      data: {
        negocioId,
        nombre: data.nombre,
        telefono: data.telefono,
        email: data.email
      }
    });
  }
}

export const clientesRepository = new ClientesRepository();
