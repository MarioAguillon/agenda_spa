import { negociosRepository } from '../repositories/negocios.repository';
import { serviciosRepository } from '../repositories/servicios.repository';
import { horariosRepository } from '../repositories/horarios.repository';
import { citasRepository } from '../repositories/citas.repository';
import { bloqueosRepository } from '../repositories/bloqueos.repository';
import { AppError } from '../middlewares/error.middleware';
import { timeToMinutes, minutesToTime, isOverlapping } from '../utils/date-helpers';

export interface SlotDisponible {
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
}

export class MotorDisponibilidadService {
  async calcularDisponibilidad(servicioIds: string[], fechaStr: string): Promise<SlotDisponible[]> {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) throw new AppError('Negocio no encontrado', 404);

    const servicios = await serviciosRepository.findByIds(servicioIds);
    if (!servicios || servicios.length === 0 || servicios.some(s => !s.activo)) {
      throw new AppError('Servicios no encontrados o inactivos', 404);
    }

    // Convertir string YYYY-MM-DD a objeto Date (UTC medianoche)
    const fechaObj = new Date(fechaStr + 'T00:00:00.000Z');
    const diaSemana = fechaObj.getUTCDay(); // 0 = Domingo, 1 = Lunes, etc.

    // 1. Obtener horario laboral del salón para ese día
    const horarioNegocio = await horariosRepository.findByDia(negocio.id, diaSemana);
    if (!horarioNegocio || !horarioNegocio.activo) {
      return []; // Salón cerrado ese día
    }

    const salonInicioMin = timeToMinutes(horarioNegocio.horaInicio);
    const salonFinMin = timeToMinutes(horarioNegocio.horaFin);
    const duracionServicioMin = servicios.reduce((sum, s) => sum + s.duracionMinutos, 0);

    // 2. Obtener ocupaciones del día (Citas activas y Bloqueos de horario)
    const citasExistentes = await citasRepository.findByFecha(negocio.id, fechaObj);
    const bloqueosExistentes = await bloqueosRepository.findByFecha(negocio.id, fechaObj);

    // Convertir ocupaciones a rangos en minutos
    const ocupacionesMin = [
      ...citasExistentes.map(c => ({
        inicio: timeToMinutes(c.horaInicio),
        fin: timeToMinutes(c.horaFin)
      })),
      ...bloqueosExistentes.map(b => ({
        inicio: timeToMinutes(b.horaInicio),
        fin: timeToMinutes(b.horaFin)
      }))
    ];

    // 3. Generar slots candidatos cada 30 minutos
    const slots: SlotDisponible[] = [];
    const STEP_MINUTES = 30;

    for (let currentMin = salonInicioMin; currentMin + duracionServicioMin <= salonFinMin; currentMin += STEP_MINUTES) {
      const slotFinMin = currentMin + duracionServicioMin;

      // Evaluar si el slot candidato choca con alguna ocupación
      const solapado = ocupacionesMin.some(ocupacion =>
        isOverlapping(currentMin, slotFinMin, ocupacion.inicio, ocupacion.fin)
      );

      if (!solapado) {
        slots.push({
          horaInicio: minutesToTime(currentMin),
          horaFin: minutesToTime(slotFinMin),
          disponible: true
        });
      }
    }

    return slots;
  }
}

export const motorDisponibilidadService = new MotorDisponibilidadService();
