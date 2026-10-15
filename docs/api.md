# Documentación de la API REST

## Base URL
* Desarrollo: `http://localhost:3000/api`
* Producción: `https://claudia-santana-nails-api.onrender.com/api`

## Resumen de Endpoints

### Autenticación
* `POST /api/auth/login` - Iniciar sesión de administrador (JWT).
* `GET /api/auth/me` - Obtener datos del usuario autenticado.

### Servicios (Público & Admin)
* `GET /api/servicios` - Obtener lista de servicios activos.
* `POST /api/servicios` - Crear nuevo servicio (Admin).
* `PUT /api/servicios/:id` - Actualizar servicio (Admin).

### Disponibilidad (Público)
* `GET /api/disponibilidad?servicioId=:id&fecha=YYYY-MM-DD` - Retorna los bloques de horarios libres en zona horaria Bogotá.

### Citas
* `POST /api/citas` - Crear reserva pública online (`origen: ONLINE`).
* `POST /api/citas/manual` - Crear cita desde Dashboard (`origen: DASHBOARD`).
* `GET /api/citas?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD` - Listar citas para agenda (Admin).
* `PUT /api/citas/:id/estado` - Cambiar estado de la cita (`CONFIRMADA`, `CANCELADA`, `COMPLETADA`, `NO_ASISTIO`).

### Clientes (Admin)
* `GET /api/clientes` - Listar y buscar clientes por nombre o WhatsApp.
* `POST /api/clientes` - Registrar cliente manualmente.

### Horarios y Bloqueos (Admin)
* `GET /api/horarios` - Ver horario laboral semanal.
* `PUT /api/horarios` - Configurar días y horas de atención.
* `POST /api/bloqueos` - Registrar bloqueos de horario (almuerzo, personal, etc.).
