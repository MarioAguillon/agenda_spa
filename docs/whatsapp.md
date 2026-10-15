# Estrategia de Confirmación por WhatsApp

## Visión General
El envío de notificaciones por WhatsApp se maneja mediante dos aproximaciones complementarias:

### 1. Enlace Directo (`wa.me`) - Estrategia Principal V1
Al finalizar la reserva, la clienta observa la confirmación en la interfaz de usuario con un botón:
**"📲 Abrir confirmación en WhatsApp"**

El botón genera un enlace `wa.me` formateado como:
`https://wa.me/573184642772?text=Hola%20Claudia%20%F0%9F%91%8B%2C%20he%20reservado%20una%20cita%20para%20...`

**Ventajas**:
* Gratuito, instantáneo e ininterrumpido.
* No requiere aprobación de plantillas en Meta Business Manager.

### 2. WhatsApp Cloud API (Modularidad Futura)
El backend cuenta con la estructura en `services/notification/providers/whatsapp.provider.ts` lista para interactuar con la API oficial de WhatsApp Cloud cuando se configuren las credenciales en `.env`.
