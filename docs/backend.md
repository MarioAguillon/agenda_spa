# Documentación del Backend (Node.js + Express)

## Capas de la Aplicación

El backend sigue una arquitectura por capas desacoplada:

1. **`routes/`**: Definición de endpoints y asociación de middlewares.
2. **`schemas/`**: Schemas de validación Zod para datos de entrada (`req.body`, `req.query`, `req.params`).
3. **`controllers/`**: Manejo de peticiones HTTP (`req`, `res`) y delegación a la capa de servicio.
4. **`services/`**: Lógica de negocio (Motor de disponibilidad, cálculo de intervalos, reglas de negocio).
5. **`repositories/`**: Acceso a datos y consultas utilizando Prisma Client.
6. **`middlewares/`**: Autenticación JWT, manejo centralizado de errores, rate limiting.
7. **`jobs/`**: Tareas asíncronas y proveedores de notificaciones (WebPush, WhatsApp).
