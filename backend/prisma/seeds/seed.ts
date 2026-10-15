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
  const adminUser = await prisma.usuario.create({
    data: {
      nombre: 'Claudia Santana',
      email: 'claudiasantana9715@gmail.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$lqJilHjd3+6OpBPayfko+w$TPR+S/OCzrsG/w3PKkS9hE973pqu2QBsnovC7iwHadQ',
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
      descripcion: 'Salón exclusivo de belleza en Mosquera Cundinamarca, especialista en Manicure, Pedicure y Diseño de Uñas.',
      telefono: '573184642772',
      direccion: 'Calle 21 # 2 - 16, Mosquera, Cundinamarca',
      logoUrl: '/assets/images/logo.png',
      imagenPortadaUrl: '/assets/images/local.jpg'
    }
  });
  console.log('✅ Negocio creado:', negocio.nombre);

  // 4. Crear Servicios Iniciales Desglosados (Manicure/Pedicure Tradicional, Semipermanente, Softgel, Dipping + Depilación en Cera)
  const servicios = [
    { categoria: 'Manicure', nombre: 'Tradicional', descripcion: 'Limpieza profunda de uñas, corte y perfilado de cutículas, limado profesional y esmaltado clásico con acabado brillante.', duracionMinutos: 75, precio: 30000 },
    { categoria: 'Manicure', nombre: 'Semipermanente', descripcion: 'Preparación completa de la uña, aplicación de base coat, color semipermanente y top coat con curado en lámpara LED UV. Duración hasta 3 semanas.', duracionMinutos: 120, precio: 50000 },
    { categoria: 'Manicure', nombre: 'Softgel', descripcion: 'Extensión y esculpido con técnica Softgel de última generación. Resultado natural, flexible y resistente con acabado cristalino.', duracionMinutos: 180, precio: 80000 },
    { categoria: 'Manicure', nombre: 'Dipping', descripcion: 'Técnica de inmersión en polvo acrílico de alta resistencia. Secado rápido sin necesidad de lámpara, acabado uniforme y duradero.', duracionMinutos: 120, precio: 70000 },
    { categoria: 'Pedicure', nombre: 'Tradicional', descripcion: 'Baño relajante, exfoliación profunda, eliminación de callosidades, hidratación intensiva con cremas especializadas y esmaltado clásico.', duracionMinutos: 75, precio: 40000 },
    { categoria: 'Pedicure', nombre: 'Semipermanente', descripcion: 'Tratamiento completo de pies con exfoliación, hidratación premium, masaje relajante y esmaltado semipermanente de larga duración.', duracionMinutos: 75, precio: 60000 },
    { categoria: 'Depilación', nombre: 'Cejas y Bigote', descripcion: 'Diseño y perfilado profesional de cejas adaptado a tu rostro. Depilación facial con cera premium hipoalergénica.', duracionMinutos: 30, precio: 20000 },
    { categoria: 'Depilación', nombre: 'Axilas', descripcion: 'Depilación con cera tibia de alta adherencia para una remoción suave y completa. Piel sedosa al instante.', duracionMinutos: 15, precio: 15000 },
    { categoria: 'Depilación', nombre: 'Bikini', descripcion: 'Depilación profesional de zona bikini con cera premium. Técnica cuidadosa para máximo confort y resultados impecables.', duracionMinutos: 60, precio: 45000 },
    { categoria: 'Depilación', nombre: 'Pierna Completa', descripcion: 'Depilación integral de piernas con cera tibia profesional. Incluye desde el tobillo hasta el muslo para una piel completamente suave.', duracionMinutos: 60, precio: 60000 },
    { categoria: 'Depilación', nombre: 'Completa', descripcion: 'Sesión integral de depilación que incluye piernas, axilas, bikini, brazos y zona facial. El tratamiento más completo para tu comodidad.', duracionMinutos: 120, precio: 100000 }
  ];

  for (const s of servicios) {
    await prisma.servicio.create({
      data: {
        negocioId: negocio.id,
        nombre: s.nombre,
        descripcion: s.descripcion,
        categoria: s.categoria,
        precio: s.precio,
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
