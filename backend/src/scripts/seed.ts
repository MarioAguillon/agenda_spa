/**
 * Datos iniciales SEGUROS para producción.
 * - Se ejecuta en cada arranque del servidor, pero solo crea lo que falta:
 *   nunca borra citas, clientas ni servicios existentes.
 * - La cuenta de Claudia se crea con ADMIN_EMAIL y ADMIN_PASSWORD (variables de entorno).
 *   Si ADMIN_PASSWORD cambia, la contraseña se actualiza en el siguiente arranque.
 */
import * as argon2 from 'argon2';
import { prisma } from '../config/database';

const SERVICIOS_INICIALES = [
  { categoria: 'Manicure', nombre: 'Manicure tradicional', duracionMinutos: 75, descripcion: 'Limpieza profunda, perfilado de cutículas, limado y esmaltado clásico con acabado brillante.' },
  { categoria: 'Manicure', nombre: 'Manicure semipermanente', duracionMinutos: 120, descripcion: 'Preparación completa, color semipermanente y curado en lámpara LED. Dura hasta 3 semanas.' },
  { categoria: 'Manicure', nombre: 'Uñas en softgel', duracionMinutos: 180, descripcion: 'Extensión con técnica Softgel. Resultado natural, flexible y resistente.' },
  { categoria: 'Manicure', nombre: 'Uñas en dipping', duracionMinutos: 120, descripcion: 'Inmersión en polvo de alta resistencia. Acabado uniforme y duradero.' },
  { categoria: 'Pedicure', nombre: 'Pedicure tradicional', duracionMinutos: 75, descripcion: 'Baño relajante, exfoliación, hidratación y esmaltado clásico.' },
  { categoria: 'Pedicure', nombre: 'Pedicure semipermanente', duracionMinutos: 75, descripcion: 'Exfoliación, hidratación, masaje relajante y esmaltado semipermanente.' },
  { categoria: 'Depilación', nombre: 'Depilación de cejas y bigote', duracionMinutos: 30, descripcion: 'Diseño de cejas y depilación facial con cera hipoalergénica.' },
  { categoria: 'Depilación', nombre: 'Depilación de axilas', duracionMinutos: 15, descripcion: 'Cera tibia de alta adherencia para una piel sedosa.' },
  { categoria: 'Depilación', nombre: 'Depilación de bikini', duracionMinutos: 60, descripcion: 'Depilación de zona bikini con técnica cuidadosa y cera premium.' },
  { categoria: 'Depilación', nombre: 'Depilación de piernas', duracionMinutos: 60, descripcion: 'Desde el tobillo hasta el muslo con cera tibia profesional.' },
  { categoria: 'Depilación', nombre: 'Depilación completa', duracionMinutos: 120, descripcion: 'Piernas, axilas, bikini, brazos y zona facial en una sola sesión.' }
];

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  let admin = await prisma.usuario.findFirst({ where: { rol: 'ADMIN' }, orderBy: { createdAt: 'asc' } });

  if (email && password) {
    if (password.length < 8) throw new Error('ADMIN_PASSWORD debe tener al menos 8 caracteres');
    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (!existente) {
      admin = await prisma.usuario.create({
        data: { nombre: 'Claudia Santana', email, passwordHash: await argon2.hash(password, { type: argon2.argon2id }), rol: 'ADMIN' }
      });
      console.log(`[SEED] Cuenta de administradora creada: ${email}`);
    } else {
      const coincide = await argon2.verify(existente.passwordHash, password).catch(() => false);
      if (!coincide) {
        await prisma.usuario.update({
          where: { id: existente.id },
          data: { passwordHash: await argon2.hash(password, { type: argon2.argon2id }) }
        });
        console.log('[SEED] Contraseña de administradora actualizada desde ADMIN_PASSWORD');
      }
      admin = existente;
    }
  }

  if (!admin) {
    console.warn('[SEED] No hay cuenta de administradora. Define ADMIN_EMAIL y ADMIN_PASSWORD.');
    return;
  }

  let negocio = await prisma.negocio.findFirst();
  if (!negocio) {
    negocio = await prisma.negocio.create({
      data: {
        usuarioId: admin.id,
        nombre: 'Claudia Santana Nails',
        descripcion: 'Spa de uñas en Mosquera, Cundinamarca.',
        telefono: '573184642772',
        direccion: 'Calle 21 # 2-16, Mosquera, Cundinamarca'
      }
    });
    console.log('[SEED] Negocio creado');
  }

  if ((await prisma.servicio.count({ where: { negocioId: negocio.id } })) === 0) {
    await prisma.servicio.createMany({
      data: SERVICIOS_INICIALES.map(s => ({ ...s, negocioId: negocio!.id }))
    });
    console.log(`[SEED] ${SERVICIOS_INICIALES.length} servicios iniciales creados`);
  }

  if ((await prisma.horarioNegocio.count({ where: { negocioId: negocio.id } })) === 0) {
    await prisma.horarioNegocio.createMany({
      data: [0, 1, 2, 3, 4, 5, 6].map(dia => ({
        negocioId: negocio!.id,
        diaSemana: dia,
        horaInicio: '09:00',
        horaFin: '18:00',
        activo: dia !== 0
      }))
    });
    console.log('[SEED] Horario de lunes a sábado 9:00–18:00 creado');
  }
}

main()
  .then(() => console.log('[SEED] Datos iniciales verificados'))
  .catch((e) => {
    console.error('[SEED] Error:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
