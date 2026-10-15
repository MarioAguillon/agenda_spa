# Documentación de la Base de Datos

## 1. ORM y Motor
* **Motor**: PostgreSQL (v14+)
* **ORM**: Prisma ORM (`@prisma/client`)
* **Ubicación de Esquema**: `database/prisma/schema.prisma`

## 2. Entidades Principales
* **`usuarios`**: Administradores y staff (Claudia). Almacena hash de contraseña en Argon2id.
* **`negocios`**: Información del salón (Claudia Santana Nails).
* **`servicios`**: Lista de servicios ofrecidos (Manicure, Pedicure, Uñas, etc.) con su duración en minutos.
* **`clientes`**: Directorio de clientes asociados al salón (Nombre, WhatsApp, Email opcional, Notas).
* **`horarios_negocio`**: Configuración semanal de atención por día (0 = Domingo, 1 = Lunes, etc.).
* **`bloqueos_horario`**: Bloqueos puntuales por almuerzo, vacaciones o eventos.
* **`citas`**: Registro principal de reservas con su estado (`CONFIRMADA`, `CANCELADA`, `COMPLETADA`, `NO_ASISTIO`) y origen (`ONLINE`, `DASHBOARD`).
* **`notificaciones`**: Registro de envíos de WhatsApp y Web Push con estado de entrega.
