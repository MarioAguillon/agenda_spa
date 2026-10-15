import { horariosRepository } from '../repositories/horarios.repository';
import { bloqueosRepository } from '../repositories/bloqueos.repository';
import { negociosRepository } from '../repositories/negocios.repository';
import { AppError } from '../middlewares/error.middleware';
import { UpdateHorariosInput, CreateBloqueoInput } from '../schemas/horario.schema';

export class HorariosService {
  async getHorarios() {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) throw new AppError('Negocio no encontrado', 404);
    return horariosRepository.findByNegocio(negocio.id);
  }

  async updateHorarios(input: UpdateHorariosInput) {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) throw new AppError('Negocio no encontrado', 404);

    const resultados = [];
    for (const item of input.horarios) {
      const res = await horariosRepository.upsert(
        negocio.id,
        item.diaSemana,
        item.horaInicio,
        item.horaFin,
        item.activo
      );
      resultados.push(res);
    }
    return resultados;
  }

  async createBloqueo(input: CreateBloqueoInput) {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) throw new AppError('Negocio no encontrado', 404);

    const fecha = new Date(input.fecha + 'T00:00:00.000Z');
    return bloqueosRepository.create({
      negocioId: negocio.id,
      fecha,
      horaInicio: input.horaInicio,
      horaFin: input.horaFin,
      motivo: input.motivo
    });
  }

  async deleteBloqueo(id: string) {
    return bloqueosRepository.delete(id);
  }
}

export const horariosService = new HorariosService();
