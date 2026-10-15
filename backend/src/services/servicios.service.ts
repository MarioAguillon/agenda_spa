import { serviciosRepository } from '../repositories/servicios.repository';
import { negociosRepository } from '../repositories/negocios.repository';
import { AppError } from '../middlewares/error.middleware';
import { CreateServicioInput, UpdateServicioInput } from '../schemas/servicio.schema';

export class ServiciosService {
  async getActiveServices() {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) {
      throw new AppError('Negocio no encontrado', 404);
    }
    return serviciosRepository.findAllActivos(negocio.id);
  }

  async getAllServices() {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) {
      throw new AppError('Negocio no encontrado', 404);
    }
    return serviciosRepository.findAll(negocio.id);
  }

  async createService(input: CreateServicioInput) {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) {
      throw new AppError('Negocio no encontrado', 404);
    }
    return serviciosRepository.create({
      negocioId: negocio.id,
      nombre: input.nombre,
      descripcion: input.descripcion,
      duracionMinutos: input.duracionMinutos
    });
  }

  async updateService(id: string, input: UpdateServicioInput) {
    const servicio = await serviciosRepository.findById(id);
    if (!servicio) {
      throw new AppError('Servicio no encontrado', 404);
    }
    return serviciosRepository.update(id, input);
  }
}

export const serviciosService = new ServiciosService();
