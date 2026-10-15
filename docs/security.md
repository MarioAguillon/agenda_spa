# Documentación de Seguridad

## 1. Contraseñas y Autenticación
* **Hashing**: Se utiliza el algoritmo **Argon2id** (`argon2`) para la encriptación de contraseñas. Nunca se almacenan contraseñas en texto plano.
* **Tokens**: JWT (JSON Web Tokens) firmados con secreto seguro configurado únicamente en el backend (`JWT_SECRET`).

## 2. Protección de la API
* **Helmet**: Cabeceras de seguridad HTTP activadas.
* **CORS**: Restringido al dominio del frontend en producción.
* **Rate Limiting**: Limitador de solicitudes activado en endpoints sensibles (`/api/auth/login`, `/api/citas`).
* **Validación de Entradas**: Validación estricta con **Zod** en todos los payloads entrantes. Sanitización implícita.

## 3. Secretos y Variables de Entorno
* Ningún token (JWT, VAPID, credenciales DB) se expone al cliente frontend en Angular.
* Todas las variables sensibles permanecen en el archivo `.env` del servidor en Render.
