# Claudia Santana Nails – Sistema de Reservas Online & PWA

Sistema profesional de reservas online y PWA de administración para el salón de belleza **Claudia Santana Nails**.

## 📌 Arquitectura

* **Frontend**: Angular 18+ (Standalone Components, TypeScript, CSS modular).
* **Backend**: Node.js + Express + TypeScript (Arquitectura por capas: Routes, Controllers, Services, Repositories).
* **Base de Datos**: PostgreSQL + Prisma ORM.
* **Hosting**: Vercel (Frontend), Render (Backend), TDB Cloud (Base de datos PostgreSQL).
* **Notificaciones**: Web Push API (PWA Admin) + Enlace Directo / Cloud API (WhatsApp).

---

## 📁 Estructura del Proyecto

```
Davis Angular/
├── frontend/        # Aplicación Angular (Landing Page + Reservas + Dashboard Admin)
├── backend/         # API REST Node.js + Express + TypeScript
├── database/        # Esquema Prisma y migraciones de PostgreSQL
└── docs/            # Documentación técnica de arquitectura y despliegue
```

---

## 🛠️ Requisitos e Instalación

### Requisitos Previos
* Node.js v18+ 
* npm v10+
* PostgreSQL v14+ (o URL de base de datos en la nube)

### Variables de Entorno
Copiar `.env.example` a `.env` en el backend y configurar las credenciales:
```bash
cp backend/.env.example backend/.env
```

---

## 🚀 Ejecución en Desarrollo

### Backend
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### Frontend
```bash
cd frontend
npm install
ng serve
```

---

## 📄 Documentación Técnica
Consulta la carpeta [`docs/`](docs/) para ver detalles sobre:
* [`architecture.md`](docs/architecture.md): Visión general de la arquitectura.
* [`database.md`](docs/database.md): Modelo entidad-relación y Prisma.
* [`api.md`](docs/api.md): Especificación de endpoints REST.
* [`security.md`](docs/security.md): Políticas de seguridad y hashing (Argon2id).
* [`frontend.md`](docs/frontend.md): Guía de componentes Standalone y estilos.
* [`backend.md`](docs/backend.md): Estructura en capas del backend.
* [`whatsapp.md`](docs/whatsapp.md): Flujo de notificaciones por WhatsApp.
* [`deployment.md`](docs/deployment.md): Guía de despliegue en Vercel y Render.
