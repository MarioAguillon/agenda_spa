# Guía de despliegue (paso a paso)

Arquitectura en producción:

| Pieza | Dónde | Costo |
| --- | --- | --- |
| Base de datos PostgreSQL (citas, clientas, servicios) | **Neon** | Gratis, no vence |
| Backend / API (Node + Express) | **Render** | Gratis |
| Frontend / PWA (Angular) | **Vercel** | Gratis |

> Orden recomendado: **1. Base de datos → 2. Backend → 3. Frontend → 4. Conectar todo → 5. Instalar en el celular.**

---

## 1. Base de datos en Neon

1. Entra a <https://neon.tech> y crea una cuenta (puedes usar tu cuenta de GitHub).
2. **Create project**:
   - Nombre: `claudia-santana-nails`
   - Región: **AWS US East 2 (Ohio)** (la misma región del backend en Render).
3. En el panel del proyecto toca **Connect**.
   - Desactiva **Connection pooling** (las migraciones necesitan la conexión directa).
   - Copia la cadena que empieza por `postgresql://...` y termina en `?sslmode=require`.
4. Guárdala: es tu `DATABASE_URL`. **No la compartas ni la subas a GitHub.**

Las tablas se crean solas la primera vez que arranca el backend (`prisma migrate deploy`).

---

## 2. Backend en Render

1. Entra a <https://render.com> y crea una cuenta con GitHub.
2. **New + → Blueprint** y elige el repositorio `agenda_spa`.
   Render lee el archivo `render.yaml` y propone el servicio `claudia-santana-api`.
3. Te pedirá completar estas variables:

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | La cadena de Neon del paso 1 |
| `CLIENT_URL` | Por ahora `https://claudia-santana-nails.vercel.app` (la ajustas en el paso 4) |
| `ADMIN_EMAIL` | El correo con el que Claudia entrará al panel |
| `ADMIN_PASSWORD` | Su contraseña (mínimo 8 caracteres; elige una segura) |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Opcionales (notificaciones, ver sección 6). Puedes dejarlas vacías |

   `JWT_SECRET` lo genera Render automáticamente.
4. **Apply**. El primer despliegue tarda 3–5 minutos.
5. Cuando termine, abre `https://<tu-servicio>.onrender.com/health`. Debe responder `"status":"ok"`.
6. Revisa la dirección que te asignó Render. Si **no** es exactamente
   `https://claudia-santana-api.onrender.com`, edita
   `frontend/src/environments/environment.prod.ts` con la dirección real y sube el cambio.

En el primer arranque se crean automáticamente: la cuenta de Claudia, el negocio, los 11 servicios iniciales
y el horario lunes a sábado de 9:00 a 18:00. Los reinicios posteriores **no borran nada**.

> **Plan gratis de Render:** el servidor "se duerme" tras 15 minutos sin visitas. La primera reserva
> después de eso puede tardar unos 50 segundos en responder. Para evitarlo, el plan Starter cuesta
> unos 7 USD/mes, o puedes usar un monitor gratuito (por ejemplo UptimeRobot) que visite
> `/health` cada 10 minutos.

---

## 3. Frontend en Vercel

1. Entra a <https://vercel.com> y crea una cuenta con GitHub.
2. **Add New → Project** e importa `agenda_spa`.
3. En **Root Directory** elige `frontend`. Vercel leerá `frontend/vercel.json` (no cambies nada más).
4. Nombre del proyecto: `claudia-santana-nails` → **Deploy**.
5. Al terminar tendrás una dirección como `https://claudia-santana-nails.vercel.app`.

---

## 4. Conectar frontend y backend

1. En Render → `claudia-santana-api` → **Environment**, pon en `CLIENT_URL` la dirección exacta de Vercel
   (sin `/` al final). Si luego compras un dominio propio, agrégalo separado por coma:
   `https://claudia-santana-nails.vercel.app,https://www.claudiasantananails.com`
2. Guarda: Render se redepliega solo.
3. Prueba: abre la página de Vercel, haz una reserva de prueba y revisa que aparezca en el panel
   (`/login` → correo y contraseña del paso 2).

---

## 5. Instalar la agenda en el celular de Claudia

**Android (Chrome):**
1. Abre `https://<tu-página>.vercel.app/login` e inicia sesión.
2. Aparece el aviso **"Instala tu agenda en el celular" → Instalar**.
   (Si no aparece: menú ⋮ de Chrome → **Instalar app** / **Agregar a pantalla principal**.)

**iPhone (Safari):**
1. Abre la misma dirección **en Safari** e inicia sesión.
2. Toca **Compartir** (cuadro con flecha) → **Agregar a inicio** → **Agregar**.

El icono "Agenda Claudia" abre directamente la agenda del día, a pantalla completa.

---

## 6. Notificaciones de nuevas reservas (opcional)

Para que a Claudia le llegue un aviso al celular cuando una clienta reserve:

1. En tu computador, dentro de `backend/`:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Copia la **Public Key** y la **Private Key** en Render (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`) y en
   `VAPID_SUBJECT` pon `mailto:` seguido de un correo de contacto.
3. Claudia abre la agenda instalada y acepta el permiso de notificaciones.

> En iPhone las notificaciones web solo funcionan con la app **instalada** (paso 5) y con iOS 16.4 o superior.

---

## Actualizaciones futuras

Cada vez que se suben cambios a la rama `main` en GitHub, Vercel y Render se actualizan solos.

## Desarrollo local

```bash
cd backend && cp .env.example .env   # completar DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD
npm install && npx prisma migrate deploy && npm run seed && npm run dev
```

```bash
cd frontend && npm install && npm start
```
