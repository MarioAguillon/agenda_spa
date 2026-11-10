import { negociosRepository } from '../repositories/negocios.repository';
import { serviciosRepository } from '../repositories/servicios.repository';
import { citasRepository } from '../repositories/citas.repository';
import { AppError } from '../middlewares/error.middleware';
import { timeToMinutes, minutesToTime, fechaADate } from '../utils/date-helpers';
import { CreateCitaOnlineInput, CreateCitaManualInput } from '../schemas/cita.schema';
import { EstadoCita, OrigenCita } from '@prisma/client';
import { pushNotificationService } from './push-notification.service';
import {
  validarReglasReservaOnline,
  validarRangoDelDia,
  verificarSinCruces,
  enTransaccionSerializable
} from './reglas-agenda.service';

const citaInclude = { cliente: true, servicios: true } as const;

export class CitasService {
  private async obtenerNegocio() {
    const negocio = await negociosRepository.getFirstNegocio();
    if (!negocio) throw new AppError('Negocio no encontrado', 404);
    return negocio;
  }

  private async obtenerServicios(ids: string[], soloActivos: boolean) {
    const unicos = [...new Set(ids)];
    const servicios = await serviciosRepository.findByIds(unicos);
    if (servicios.length !== unicos.length || (soloActivos && servicios.some(s => !s.activo))) {
      throw new AppError('Uno o más servicios seleccionados no están disponibles', 404);
    }
    return servicios;
  }

  async createCitaOnline(input: CreateCitaOnlineInput) {
    const negocio = await this.obtenerNegocio();
    const servicios = await this.obtenerServicios(input.servicioIds, true);

    const duracionMin = servicios.reduce((sum, s) => sum + s.duracionMinutos, 0);
    const inicioMin = timeToMinutes(input.horaInicio);
    const finMin = inicioMin + duracionMin;
    validarRangoDelDia(finMin);
    await validarReglasReservaOnline(negocio.id, input.fecha, inicioMin, finMin);

    const fechaObj = fechaADate(input.fecha);

    const result = await enTransaccionSerializable(async (tx) => {
      await verificarSinCruces(tx, negocio.id, fechaObj, inicioMin, finMin);

      // Obtener o crear Cliente por teléfono (ya normalizado por el schema)
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

      const cita = await tx.cita.create({
        data: {
          negocioId: negocio.id,
          clienteId: cliente.id,
          servicios: { connect: servicios.map(s => ({ id: s.id })) },
          fecha: fechaObj,
          horaInicio: input.horaInicio,
          horaFin: minutesToTime(finMin),
          estado: EstadoCita.CONFIRMADA,
          origen: OrigenCita.ONLINE,
          notas: input.notas
        },
        include: citaInclude
      });

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
    pushNotificationService.notificarNuevaReserva({
      clienteNombre: input.cliente.nombre,
      servicios: servicios.map(s => s.nombre).join(', '),
      fecha: input.fecha,
      hora: input.horaInicio
    }).catch(err => console.error('[PUSH] Error al notificar:', err.message));

    return result;
  }

  async createCitaManual(input: CreateCitaManualInput) {
    const negocio = await this.obtenerNegocio();
    // Desde el panel se permite agendar servicios inactivos (p. ej. promociones retiradas)
    const servicios = await this.obtenerServicios(input.servicioIds, false);

    const duracionMin = servicios.reduce((sum, s) => sum + s.duracionMinutos, 0);
    const inicioMin = timeToMinutes(input.horaInicio);
    const finMin = inicioMin + duracionMin;
    validarRangoDelDia(finMin);

    if (!input.clienteId && !input.clienteNuevo) {
      throw new AppError('Debe proporcionar una clienta existente o registrar una nueva', 400);
    }

    const fechaObj = fechaADate(input.fecha);

    return enTransaccionSerializable(async (tx) => {
      // Las citas manuales tampoco pueden cruzarse con otras citas o bloqueos
      await verificarSinCruces(tx, negocio.id, fechaObj, inicioMin, finMin);

      let clienteId = input.clienteId;
      if (clienteId) {
        const existe = await tx.cliente.findFirst({ where: { id: clienteId, negocioId: negocio.id } });
        if (!existe) throw new AppError('Clienta no encontrada', 404);
      } else if (input.clienteNuevo) {
        const datos = input.clienteNuevo;
        const existente = await tx.cliente.findFirst({ where: { negocioId: negocio.id, telefono: datos.telefono } });
        const cliente = existente
          ? await tx.cliente.update({
              where: { id: existente.id },
              data: { nombre: datos.nombre, email: datos.email || existente.email }
            })
          : await tx.cliente.create({
              data: { negocioId: negocio.id, nombre: datos.nombre, telefono: datos.telefono, email: datos.email || null }
            });
        clienteId = cliente.id;
      }

      return tx.cita.create({
        data: {
          negocioId: negocio.id,
          clienteId: clienteId!,
          servicios: { connect: servicios.map(s => ({ id: s.id })) },
          fecha: fechaObj,
          horaInicio: input.horaInicio,
          horaFin: minutesToTime(finMin),
          estado: EstadoCita.CONFIRMADA,
          origen: OrigenCita.DASHBOARD,
          notas: input.notas
        },
        include: citaInclude
      });
    });
  }

  async getCitasByRange(fechaInicioStr: string, fechaFinStr: string) {
    const negocio = await this.obtenerNegocio();
    return citasRepository.findRangoFechas(negocio.id, fechaADate(fechaInicioStr), fechaADate(fechaFinStr));
  }

  async updateEstado(id: string, estado: EstadoCita) {
    return citasRepository.updateEstado(id, estado);
  }
}

export const citasService = new CitasService();
