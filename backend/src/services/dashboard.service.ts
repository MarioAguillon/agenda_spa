import { negociosRepository } from '../repositories/negocios.repository';
import { citasRepository } from '../repositories/citas.repository';
import { clientesRepository } from '../repositories/clientes.repository';
import { serviciosRepository } from '../repositories/servicios.repository';
import { AppError } from '../middlewares/error.middleware';

export class DashboardService {
  async getResumen() {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) throw new AppError('Negocio no encontrado', 404);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayObj = new Date(todayStr + 'T00:00:00.000Z');

    // 1. Citas de hoy
    const citasHoy = await citasRepository.findByFecha(negocio.id, todayObj);

    // 2. Próximas citas (próximos 7 días)
    const finSemanaObj = new Date(todayObj.getTime() + 7 * 24 * 60 * 60 * 1000);
    const proximasCitas = await citasRepository.findRangoFechas(negocio.id, todayObj, finSemanaObj);

    // 3. Totales de clientes y servicios
    const clientes = await clientesRepository.findAll(negocio.id);
    const servicios = await serviciosRepository.findAllActivos(negocio.id);

    return {
      citasHoyCount: citasHoy.length,
      citasHoy,
      proximasCitas,
      totalClientes: clientes.length,
      totalServicios: servicios.length
    };
  }
}

export const dashboardService = new DashboardService();
