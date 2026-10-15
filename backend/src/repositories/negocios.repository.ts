import { prisma } from '../config/database';
import { Negocio } from '@prisma/client';

export class NegociosRepository {
  async getFirstNegocio(): Promise<Negocio | null> {
    return prisma.negocio.findFirst();
  }

  async findById(id: string): Promise<Negocio | null> {
    return prisma.negocio.findUnique({
      where: { id }
    });
  }
}

export const negociosRepository = new NegociosRepository();
