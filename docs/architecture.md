# Documentación de Arquitectura

## 1. Visión General del Sistema
El proyecto **Claudia Santana Nails** es un sistema desacoplado compuesto por:
* **Frontend público y PWA privado** en Angular 18+ (Hosted en Vercel).
* **Backend API REST** en Node.js, Express y TypeScript (Hosted en Render).
* **Base de datos relacional** PostgreSQL administrada con Prisma ORM (Hosted en TDB Cloud).

## 2. Diagrama de Arquitectura
```
[ Clienta (Browser Mobile/Desktop) ]
              │
              ▼
    [ Angular 18 Frontend ] ── (Public Booking & Landing Page)
              │
              │ HTTPS REST API
              ▼
  [ Node.js + Express Backend ]
              │
     ┌────────┴────────┐
     ▼                 ▼
[ PostgreSQL DB ]  [ Notification Service ]
 (Prisma ORM)       ├─ Web Push API (Admin PWA)
                    └─ wa.me Direct Link / WhatsApp Cloud API
```

## 3. Principios de Diseño
1. **Desacoplamiento Frontend/Backend**: El frontend no interactúa directamente con la base de datos ni expone credenciales.
2. **Validación en Backend**: Toda entrada recibida por la API se valida con Schemas de Zod independientemente de la validación del frontend.
3. **Cálculo Dinámico de Disponibilidad**: Los horarios no se almacenan como slots fijos en DB; se evalúan en tiempo real según el horario laboral, citas previas y bloqueos.
4. **Resiliencia en Notificaciones**: El almacenamiento de la reserva es primario y la entrega de notificaciones es secundaria y asíncrona.
