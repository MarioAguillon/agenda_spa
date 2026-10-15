import { prisma } from '../config/database';
import { negociosRepository } from '../repositories/negocios.repository';
import { serviciosRepository } from '../repositories/servicios.repository';
import { clientesRepository } from '../repositories/clientes.repository';
import { citasRepository } from '../repositories/citas.repository';
import { AppError } from '../middlewares/error.middleware';
import { timeToMinutes, minutesToTime, isOverlapping } from '../utils/date-helpers';
import { CreateCitaOnlineInput, CreateCitaManualInput } from '../schemas/cita.schema';
import { EstadoCita, OrigenCita } from '@prisma/client';
import { pushNotificationService } from './push-notification.service';

export class CitasService {
  async createCitaOnline(input: CreateCitaOnlineInput) {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) throw new AppError('Negocio no encontrado', 404);

    const servicios = await serviciosRepository.findByIds(input.servicioIds);
    if (!servicios || servicios.length === 0 || servicios.some(s => !s.activo)) {
      throw new AppError('Uno o más servicios seleccionados no están disponibles', 404);
    }

    const duracionMin = servicios.reduce((sum, s) => sum + s.duracionMinutos, 0);
    const inicioMin = timeToMinutes(input.horaInicio);
    const finMin = inicioMin + duracionMin;
    const horaFinStr = minutesToTime(finMin);
    const fechaObj = new Date(input.fecha + 'T00:00:00.000Z');

    // Transacción atómica para evitar Double-Booking
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verificar solapamiento con citas existentes
      const citasExistentes = await tx.cita.findMany({
        where: {
          negocioId: negocio.id,
          fecha: fechaObj,
          estado: { not: EstadoCita.CANCELADA }
        }
      });

      const solapadoCita = citasExistentes.some(c => {
        const cInicio = timeToMinutes(c.horaInicio);
        const cFin = timeToMinutes(c.horaFin);
        return isOverlapping(inicioMin, finMin, cInicio, cFin);
      });

      if (solapadoCita) {
        throw new AppError('El horario seleccionado acaba de ser reservado por otro cliente. Por favor elige otro horario.', 409);
      }

      // 2. Verificar solapamiento con bloqueos
      const bloqueosExistentes = await tx.bloqueoHorario.findMany({
        where: {
          negocioId: negocio.id,
          fecha: fechaObj
        }
      });

      const solapadoBloqueo = bloqueosExistentes.some(b => {
        const bInicio = timeToMinutes(b.horaInicio);
        const bFin = timeToMinutes(b.horaFin);
        return isOverlapping(inicioMin, finMin, bInicio, bFin);
      });

      if (solapadoBloqueo) {
        throw new AppError('El horario seleccionado está bloqueado por el salón.', 409);
      }

      // 3. Obtener o crear Cliente por teléfono
      let cliente = await tx.cliente.findFirst({
        where: { negocioId: negocio.id, telefono: input.cliente.telefono }
      });

      if (!cliente) {
        cliente = await tx.cliente.create({
          data: {
            negocioId: negocio.id,
            nombre: input.cliente.nombre,
            telefono: input.cliente.telefono,
            email: input.cliente.email || null
          }
        });
      }

      // 4. Crear la Cita (origen: ONLINE)
      const cita = await tx.cita.create({
        data: {
          negocioId: negocio.id,
          clienteId: cliente.id,
          servicios: { connect: servicios.map(s => ({ id: s.id })) },
          fecha: fechaObj,
          horaInicio: input.horaInicio,
          horaFin: horaFinStr,
          estado: EstadoCita.CONFIRMADA,
          origen: OrigenCita.ONLINE,
          notas: input.notas
        },
        include: {
          cliente: true,
          servicios: true
        }
      });

      // 5. Registrar notificación pendiente
      await tx.notificacion.create({
        data: {
          citaId: cita.id,
          tipo: 'WHATSAPP_CONFIRMACION',
          destinatario: cliente.telefono,
          estado: 'PENDIENTE'
        }
      });

      return cita;
    });

    // Fuera de la transacción: enviar notificación Push a Claudia (no bloqueante)
    const serviciosText = servicios.map(s => s.nombre).join(', ');
    pushNotificationService.notificarNuevaReserva({
      clienteNombre: input.cliente.nombre,
      servicios: serviciosText,
      fecha: input.fecha,
      hora: input.horaInicio
    }).catch(err => console.error('[PUSH] Error al notificar:', err.message));

    return result;
  }

  async createCitaManual(input: CreateCitaManualInput) {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) throw new AppError('Negocio no encontrado', 404);

    const servicios = await serviciosRepository.findByIds(input.servicioIds);
    if (!servicios || servicios.length === 0) throw new AppError('Servicios no encontrados', 404);

    const duracionMin = servicios.reduce((sum, s) => sum + s.duracionMinutos, 0);
    const inicioMin = timeToMinutes(input.horaInicio);
    const finMin = inicioMin + duracionMin;
    const horaFinStr = minutesToTime(finMin);
    const fechaObj = new Date(input.fecha + 'T00:00:00.000Z');

    let clienteId = input.clienteId;

    if (!clienteId && input.clienteNuevo) {
      const cliente = await clientesRepository.upsertByTelefono(negocio.id, input.clienteNuevo);
      clienteId = cliente.id;
    }

    if (!clienteId) {
      throw new AppError('Debe proporcionar una clienta existente o registrar una nueva', 400);
    }

    return citasRepository.create({
      negocioId: negocio.id,
      clienteId: clienteId,
      servicioIds: input.servicioIds,
      fecha: fechaObj,
      horaInicio: input.horaInicio,
      horaFin: horaFinStr,
      origen: OrigenCita.DASHBOARD,
      notas: input.notas
    });
  }

  async getCitasByRange(fechaInicioStr: string, fechaFinStr: string) {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) throw new AppError('Negocio no encontrado', 404);

    const inicioObj = new Date(fechaInicioStr + 'T00:00:00.000Z');
    const finObj = new Date(fechaFinStr + 'T23:59:59.999Z');

    return citasRepository.findRangoFechas(negocio.id, inicioObj, finObj);
  }

  async updateEstado(id: string, estado: EstadoCita) {
    return citasRepository.updateEstado(id, estado);
  }
}

export const citasService = new CitasService();
