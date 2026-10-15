# Guía de Despliegue

## 1. Base de Datos (PostgreSQL en TDB Cloud / Supabase / Neon)
1. Crear la base de datos PostgreSQL en la nube.
2. Obtener la cadena `DATABASE_URL`.
3. Ejecutar las migraciones de Prisma desde el proyecto local o en CI/CD:
   ```bash
   npx prisma migrate deploy
   ```

## 2. Backend (Render)
1. Crear un Web Service en Render conectado al repositorio de GitHub.
2. Configurar Build Command: `cd backend && npm install && npm run build`
3. Configurar Start Command: `cd backend && npm run start`
4. Agregar las variables de entorno (`DATABASE_URL`, `JWT_SECRET`, `TIMEZONE=America/Bogota`, etc.).

## 3. Frontend (Vercel)
1. Importar el proyecto en Vercel.
2. Seleccionar la subcarpeta `frontend/`.
3. Framework Preset: **Angular**.
4. Configurar Variable de Entorno `ENVIRONMENT_API_URL` apuntando a Render.
