import { Prisma, EstadoCita } from '@prisma/client';
import { prisma } from '../config/database';
import { ENV } from '../config/env';
import { AppError } from '../middlewares/error.middleware';
import { horariosRepository } from '../repositories/horarios.repository';
import {
  timeToMinutes, isOverlapping, fechaHoyEnZona, minutosAhoraEnZona, sumarDias
} from '../utils/date-helpers';

const MINUTOS_EN_DIA = 24 * 60;

/**
 * Reglas para reservas ONLINE (clientas):
 * - no fechas pasadas ni más allá de MAX_DIAS_ANTICIPACION
 * - si es hoy, la hora no puede haber pasado
 * - el salón debe atender ese día y la cita debe caber completa en el horario
 */
export async function validarReglasReservaOnline(
  negocioId: string,
  fecha: string,
  inicioMin: number,
  finMin: number
): Promise<void> {
  const hoy = fechaHoyEnZona(ENV.TIMEZONE);

  if (fecha < hoy) {
    throw new AppError('No es posible reservar en una fecha pasada.', 400);
  }
  if (fecha > sumarDias(hoy, ENV.MAX_DIAS_ANTICIPACION)) {
    throw new AppError(`Solo se puede reservar con máximo ${ENV.MAX_DIAS_ANTICIPACION} días de anticipación.`, 400);
  }
  if (fecha === hoy && inicioMin <= minutosAhoraEnZona(ENV.TIMEZONE)) {
    throw new AppError('Ese horario ya pasó. Por favor elige una hora posterior.', 400);
  }

  const diaSemana = new Date(fecha + 'T00:00:00.000Z').getUTCDay();
  const horario = await horariosRepository.findByDia(negocioId, diaSemana);
  if (!horario || !horario.activo) {
    throw new AppError('El salón no atiende ese día. Por favor elige otra fecha.', 400);
  }

  const apertura = timeToMinutes(horario.horaInicio);
  const cierre = timeToMinutes(horario.horaFin);
  if (inicioMin < apertura || finMin > cierre) {
    throw new AppError(
      `La cita debe quedar dentro del horario de atención (${horario.horaInicio} - ${horario.horaFin}).`,
      400
    );
  }
}

/** Regla mínima para citas creadas desde el panel: deben terminar el mismo día. */
export function validarRangoDelDia(finMin: number): void {
  if (finMin > MINUTOS_EN_DIA) {
    throw new AppError('La cita no puede terminar después de la medianoche.', 400);
  }
}

/**
 * Verifica, DENTRO de la transacción, que el rango no choque con citas activas ni bloqueos.
 */
export async function verificarSinCruces(
  tx: Prisma.TransactionClient,
  negocioId: string,
  fechaObj: Date,
  inicioMin: number,
  finMin: number
): Promise<void> {
  const citas = await tx.cita.findMany({
    where: { negocioId, fecha: fechaObj, estado: { notIn: [EstadoCita.CANCELADA] } },
    select: { horaInicio: true, horaFin: true }
  });
  if (citas.some(c => isOverlapping(inicioMin, finMin, timeToMinutes(c.horaInicio), timeToMinutes(c.horaFin)))) {
    throw new AppError('El horario seleccionado acaba de ser reservado. Por favor elige otro horario.', 409);
  }

  const bloqueos = await tx.bloqueoHorario.findMany({
    where: { negocioId, fecha: fechaObj },
    select: { horaInicio: true, horaFin: true }
  });
  if (bloqueos.some(b => isOverlapping(inicioMin, finMin, timeToMinutes(b.horaInicio), timeToMinutes(b.horaFin)))) {
    throw new AppError('El horario seleccionado está bloqueado por el salón.', 409);
  }
}

/**
 * Ejecuta la función en una transacción SERIALIZABLE. Si dos reservas compiten por
 * el mismo horario, PostgreSQL aborta una (P2034); se reintenta y, al releer,
 * la verificación de cruces la rechaza con 409. Así se evita el doble agendamiento.
 */
export async function enTransaccionSerializable<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  intentos = 3
): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await prisma.$transaction(fn, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10_000
      });
    } catch (error: any) {
      if (error?.code === 'P2034' && i < intentos) continue;
      throw error;
    }
  }
}
