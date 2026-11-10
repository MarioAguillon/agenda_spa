/**
 * Pruebas de auditoría (nov-2026).
 * Cada test describe el comportamiento CORRECTO esperado.
 * Los que fallan hoy evidencian un defecto real del backend.
 * La base de datos se simula con mocks (no requiere PostgreSQL).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import http from 'http';
import jwt from 'jsonwebtoken';

const NEGOCIO = { id: 'neg-1' };
const SERV = { id: '11111111-1111-4111-8111-111111111111', nombre: 'Manicure', activo: true, duracionMinutos: 60 };

const tx = {
  cita: { findMany: vi.fn(), create: vi.fn() },
  bloqueoHorario: { findMany: vi.fn() },
  cliente: { findFirst: vi.fn(), create: vi.fn() },
  notificacion: { create: vi.fn() }
};

vi.mock('../../src/config/database', () => ({
  prisma: {
    $transaction: vi.fn(async (fn: any) => fn(tx)),
    suscripcionPush: { upsert: vi.fn(), findMany: vi.fn(async () => []) },
    cita: { findMany: vi.fn(async () => []) }
  }
}));
vi.mock('../../src/repositories/negocios.repository', () => ({
  negociosRepository: { getFirstNegocio: vi.fn(async () => NEGOCIO) }
}));
vi.mock('../../src/repositories/servicios.repository', () => ({
  serviciosRepository: { findByIds: vi.fn(async () => [SERV]) }
}));
vi.mock('../../src/repositories/horarios.repository', () => ({
  // Salón: lunes-sábado 09:00-18:00, domingo cerrado
  horariosRepository: {
    findByDia: vi.fn(async (_n: string, dia: number) =>
      dia === 0 ? { activo: false, horaInicio: '09:00', horaFin: '18:00' } : { activo: true, horaInicio: '09:00', horaFin: '18:00' })
  }
}));
vi.mock('../../src/repositories/citas.repository', () => ({
  citasRepository: {
    findByFecha: vi.fn(async () => []),
    create: vi.fn(async (d: any) => ({ id: 'cita-x', ...d })),
    updateEstado: vi.fn(async () => {
      const e: any = new Error('An operation failed because it depends on one or more records that were required but not found.');
      e.code = 'P2025';
      throw e;
    }),
    findRangoFechas: vi.fn(async () => [])
  }
}));
vi.mock('../../src/repositories/usuarios.repository', () => ({
  usuariosRepository: { findByEmail: vi.fn(async () => null), findById: vi.fn(async () => null) }
}));
vi.mock('../../src/repositories/bloqueos.repository', () => ({
  bloqueosRepository: { findByFecha: vi.fn(async () => []) }
}));
vi.mock('../../src/services/push-notification.service', () => ({
  pushNotificationService: { notificarNuevaReserva: vi.fn(async () => ({})), guardarSuscripcion: vi.fn(async () => ({})) }
}));

import { citasService } from '../../src/services/citas.service';
import { motorDisponibilidadService } from '../../src/services/motor-disponibilidad.service';
import { createApp } from '../../src/app';
import { ENV } from '../../src/config/env';

// Fechas relativas a "hoy" en Bogotá para que las pruebas no caduquen
const HOY = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
const sumar = (f: string, d: number) => { const x = new Date(f + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(0, 10); };
const proximo = (diaSemana: number) => { for (let i = 1; i <= 7; i++) { const f = sumar(HOY, i); if (new Date(f + 'T00:00:00Z').getUTCDay() === diaSemana) return f; } return ''; };
const DOMINGO = proximo(0);
const MARTES = proximo(2);

const reservaBase = {
  servicioIds: [SERV.id],
  cliente: { nombre: 'Ana Pérez', telefono: '3001234567', email: '' },
};

function request(method: string, path: string, body?: any, token?: string) {
  const app = createApp();
  return new Promise<{ status: number; body: any }>((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = (server.address() as any).port;
      const data = body ? JSON.stringify(body) : undefined;
      const req = http.request({
        host: '127.0.0.1', port, path, method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      }, (res) => {
        let raw = '';
        res.on('data', c => (raw += c));
        res.on('end', () => { server.close(); resolve({ status: res.statusCode!, body: raw ? JSON.parse(raw) : null }); });
      });
      req.on('error', (e) => { server.close(); reject(e); });
      if (data) req.write(data);
      req.end();
    });
  });
}

beforeEach(() => {
  tx.cita.findMany.mockResolvedValue([]);
  tx.bloqueoHorario.findMany.mockResolvedValue([]);
  tx.cliente.findFirst.mockResolvedValue(null);
  tx.cliente.create.mockResolvedValue({ id: 'cli-1', telefono: '3001234567' });
  tx.cita.create.mockImplementation(async ({ data }: any) => ({ id: 'cita-1', ...data }));
  tx.notificacion.create.mockResolvedValue({});
});

describe('Reserva online: reglas de negocio', () => {
  it('[H1] rechaza reservas un DOMINGO (salón cerrado)', async () => {
    await expect(citasService.createCitaOnline({ ...reservaBase, fecha: DOMINGO, horaInicio: '10:00' } as any))
      .rejects.toThrow(/no atiende/);
  });

  it('[H2] rechaza reservas fuera del horario (23:00)', async () => {
    await expect(citasService.createCitaOnline({ ...reservaBase, fecha: MARTES, horaInicio: '23:00' } as any))
      .rejects.toThrow(/horario de atención/);
  });

  it('[H3] rechaza reservas en fechas pasadas', async () => {
    await expect(citasService.createCitaOnline({ ...reservaBase, fecha: '2020-01-06', horaInicio: '10:00' } as any))
      .rejects.toThrow(/pasada/);
  });

  it('[H4] la cita manual del dashboard no puede solaparse con otra cita', async () => {
    tx.cita.findMany.mockResolvedValue([{ horaInicio: '10:00', horaFin: '11:00' }]);
    await expect(citasService.createCitaManual({
      servicioIds: [SERV.id], fecha: MARTES, horaInicio: '10:30', clienteId: '22222222-2222-4222-8222-222222222222'
    } as any)).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('Reserva online: casos válidos y concurrencia', () => {
  it('[OK] acepta una reserva válida dentro del horario', async () => {
    const cita: any = await citasService.createCitaOnline({ ...reservaBase, fecha: MARTES, horaInicio: '10:00' } as any);
    expect(cita.horaFin).toBe('11:00');
    expect(cita.origen).toBe('ONLINE');
  });

  it('[OK] rechaza con 409 si el horario ya está ocupado', async () => {
    tx.cita.findMany.mockResolvedValue([{ horaInicio: '10:30', horaFin: '11:30' }]);
    await expect(citasService.createCitaOnline({ ...reservaBase, fecha: MARTES, horaInicio: '10:00' } as any))
      .rejects.toMatchObject({ statusCode: 409 });
  });

  it('[OK] usa transacción SERIALIZABLE y reintenta ante conflicto de concurrencia (P2034)', async () => {
    const { prisma } = await import('../../src/config/database');
    const trans = prisma.$transaction as any;
    trans.mockClear();
    const conflicto: any = new Error('write conflict'); conflicto.code = 'P2034';
    trans.mockRejectedValueOnce(conflicto);
    await citasService.createCitaOnline({ ...reservaBase, fecha: MARTES, horaInicio: '10:00' } as any);
    expect(trans).toHaveBeenCalledTimes(2);
    expect(trans.mock.calls[0][1]).toMatchObject({ isolationLevel: 'Serializable' });
  });

  it('[OK] rechaza una cita que terminaría después de la medianoche', async () => {
    await expect(citasService.createCitaManual({
      servicioIds: [SERV.id], fecha: MARTES, horaInicio: '23:30', clienteId: '22222222-2222-4222-8222-222222222222'
    } as any)).rejects.toThrow(/medianoche/);
  });
});

describe('Motor de disponibilidad', () => {
  it('[H5] no ofrece horarios que ya pasaron cuando la fecha es HOY', async () => {
    const hoyBogota = HOY;
    const ahora = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    const slots = await motorDisponibilidadService.calcularDisponibilidad([SERV.id], hoyBogota);
    const pasados = slots.filter(s => s.horaInicio < ahora);
    expect(pasados).toEqual([]);
  });
});

describe('API / seguridad', () => {
  const token = jwt.sign({ id: 'u1', email: 'a@a.com', rol: 'ADMIN' }, ENV.JWT_SECRET);

  it('[OK] normaliza el teléfono "+57 300 123 4567" a "3001234567"', async () => {
    tx.cliente.findFirst.mockClear();
    const r = await request('POST', '/api/citas', {
      ...reservaBase, fecha: MARTES, horaInicio: '15:00',
      cliente: { nombre: 'Ana', telefono: '+57 300 123 4567' }
    });
    expect(r.status).toBe(201);
    expect(tx.cliente.findFirst.mock.calls[0][0].where.telefono).toBe('3001234567');
  });

  it('[OK] fecha inexistente (31 de febrero) es rechazada', async () => {
    const r = await request('POST', '/api/citas', { ...reservaBase, fecha: '2027-02-31', horaInicio: '10:00' });
    expect(r.status).toBe(400);
  });

  it('[H6] POST /api/push/subscribe con token válido no debe dar 500', async () => {
    const r = await request('POST', '/api/push/subscribe',
      { subscription: { endpoint: 'https://push.example/x', keys: { p256dh: 'a', auth: 'b' } } }, token);
    expect(r.status).toBe(201);
  });

  it('[H7] cambiar estado de una cita inexistente responde 404 (no 500 con mensaje interno de Prisma)', async () => {
    const r = await request('PUT', '/api/citas/33333333-3333-4333-8333-333333333333/estado', { estado: 'CANCELADA' }, token);
    expect(r.status).toBe(404);
  });

  it('[H8] GET /api/citas sin fechas responde 400 (validación)', async () => {
    const r = await request('GET', '/api/citas', undefined, token);
    expect(r.status).toBe(400);
  });

  it('[H9] el JWT_SECRET no debe tener un valor por defecto embebido en el código', () => {
    expect(ENV.JWT_SECRET).not.toBe('dev_secret_key_claudia_santana_nails');
  });

  it('[H10] nombre de clienta con 10.000 caracteres es rechazado (límite de longitud)', async () => {
    const r = await request('POST', '/api/citas', {
      ...reservaBase, fecha: MARTES, horaInicio: '10:00',
      cliente: { nombre: 'A'.repeat(10000), telefono: '3001234567' }
    });
    expect(r.status).toBe(400);
  });

  it('[H11] teléfono basura ("abcdefgh") es rechazado', async () => {
    const r = await request('POST', '/api/citas', {
      ...reservaBase, fecha: MARTES, horaInicio: '10:00',
      cliente: { nombre: 'Ana', telefono: 'abcdefgh' }
    });
    expect(r.status).toBe(400);
  });

  it('[H12] el login tiene un limitador estricto contra fuerza bruta (<= 10 intentos)', async () => {
    let bloqueado = false;
    for (let i = 0; i < 12 && !bloqueado; i++) {
      const r = await request('POST', '/api/auth/login', { email: 'x@x.com', password: 'zzzzzzz' });
      if (r.status === 429) bloqueado = true;
    }
    expect(bloqueado).toBe(true);
  }, 30000);
});
