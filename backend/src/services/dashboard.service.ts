import { negociosRepository } from '../repositories/negocios.repository';
import { citasRepository } from '../repositories/citas.repository';
import { prisma } from '../config/database';
import { ENV } from '../config/env';
import { AppError } from '../middlewares/error.middleware';
import { fechaHoyEnZona, sumarDias, fechaADate } from '../utils/date-helpers';

export class DashboardService {
  async getResumen() {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) throw new AppError('Negocio no encontrado', 404);

    // "Hoy" según la hora de Colombia, no la del servidor (UTC)
    const hoy = fechaHoyEnZona(ENV.TIMEZONE);
    const todayObj = fechaADate(hoy);
    const finSemanaObj = fechaADate(sumarDias(hoy, 7));

    const [citasHoy, proximasCitas, totalClientes, totalServicios] = await Promise.all([
      citasRepository.findRangoFechas(negocio.id, todayObj, todayObj),
      citasRepository.findRangoFechas(negocio.id, todayObj, finSemanaObj),
      prisma.cliente.count({ where: { negocioId: negocio.id } }),
      prisma.servicio.count({ where: { negocioId: negocio.id, activo: true } })
    ]);

    return {
      citasHoyCount: citasHoy.filter(c => c.estado !== 'CANCELADA').length,
      citasHoy,
      proximasCitas,
      totalClientes,
      totalServicios
    };
  }
}

export const dashboardService = new DashboardService();
