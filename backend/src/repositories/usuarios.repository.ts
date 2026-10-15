import { prisma } from '../config/database';
import { Usuario } from '@prisma/client';

export class UsuariosRepository {
  async findByEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { email }
    });
  }

  async findById(id: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { id }
    });
  }
}

export const usuariosRepository = new UsuariosRepository();
