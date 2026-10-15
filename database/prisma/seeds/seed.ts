import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seeding de Datos Base para Claudia Santana Nails...');

  // 1. Limpiar datos existentes en desarrollo (orden inverso a FKs)
  await prisma.notificacion.deleteMany();
  await prisma.cita.deleteMany();
  await prisma.bloqueoHorario.deleteMany();
  await prisma.horarioNegocio.deleteMany();
  await prisma.servicio.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.negocio.deleteMany();
  await prisma.usuario.deleteMany();

  // 2. Crear Usuario Admin (Claudia)
  const passwordHash = await argon2.hash('ClaudiaNails2026!');
  const adminUser = await prisma.usuario.create({
    data: {
      nombre: 'Claudia Santana',
      email: 'claudia@claudiasantananails.com',
      passwordHash: passwordHash,
      rol: 'ADMIN',
      activo: true
    }
  });
  console.log('✅ Usuario Administrador creado:', adminUser.email);

  // 3. Crear Negocio
  const negocio = await prisma.negocio.create({
    data: {
      usuarioId: adminUser.id,
      nombre: 'Claudia Santana Nails',
      descripcion: 'Salón exclusivo de belleza, especialista en Manicure, Pedicure y Diseño de Uñas.',
      telefono: '573184642772',
      direccion: 'Calle Principal #12-34, Bogotá',
      logoUrl: '/assets/images/logo.png',
      imagenPortadaUrl: '/assets/images/local.jpg'
    }
  });
  console.log('✅ Negocio creado:', negocio.nombre);

  // 4. Crear Servicios Iniciales (Manicure 60m, Pedicure 60m, Depilación 30m, Uñas 120m)
  const servicios = [
    { nombre: 'Manicure', descripcion: 'Limpieza, exfoliación y esmaltado semipermanente de uñas de manos.', duracionMinutos: 60 },
    { nombre: 'Pedicure', descripcion: 'Tratamiento completo para pies, cuidado de uñas y exfoliación profunda.', duracionMinutos: 60 },
    { nombre: 'Depilación', descripcion: 'Depilación facial y corporal con cera especial de alta calidad.', duracionMinutos: 30 },
    { nombre: 'Uñas', descripcion: 'Esculpido de uñas acrílicas o en gel con diseño personalizado.', duracionMinutos: 120 }
  ];

  for (const s of servicios) {
    await prisma.servicio.create({
      data: {
        negocioId: negocio.id,
        nombre: s.nombre,
        descripcion: s.descripcion,
        duracionMinutos: s.duracionMinutos,
        activo: true
      }
    });
  }
  console.log(`✅ ${servicios.length} Servicios iniciales creados.`);

  // 5. Horario Laboral Predeterminado (Lunes a Sábado: 09:00 - 18:00)
  const diasSemana = [
    { dia: 1, activo: true, inicio: '09:00', fin: '18:00' }, // Lunes
    { dia: 2, activo: true, inicio: '09:00', fin: '18:00' }, // Martes
    { dia: 3, activo: true, inicio: '09:00', fin: '18:00' }, // Miércoles
    { dia: 4, activo: true, inicio: '09:00', fin: '18:00' }, // Jueves
    { dia: 5, activo: true, inicio: '09:00', fin: '18:00' }, // Viernes
    { dia: 6, activo: true, inicio: '09:00', fin: '18:00' }, // Sábado
    { dia: 0, activo: false, inicio: '09:00', fin: '18:00' } // Domingo
  ];

  for (const h of diasSemana) {
    await prisma.horarioNegocio.create({
      data: {
        negocioId: negocio.id,
        diaSemana: h.dia,
        horaInicio: h.inicio,
        horaFin: h.fin,
        activo: h.activo
      }
    });
  }
  console.log('✅ Horarios semanales del negocio configurados.');

  console.log('🎉 Seeding finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
