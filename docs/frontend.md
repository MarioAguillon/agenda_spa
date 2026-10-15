# Documentación del Frontend (Angular 18)

## Estructura Modular y Nomenclatura

El frontend está construido con componentes Standalone de Angular, divididos en:

* **`core/`**: Guards, Interceptors, Servicios globales (`api.service.ts`, `auth.service.ts`), modelos de datos.
* **`shared/`**: Componentes visuales reutilizables (`button`, `modal`, `loading`, `confirmation-dialog`, `empty-state`).
* **`features/`**: Módulos funcionales de la aplicación:
  * `public/`: Landing page del salón y presentación visual.
  * `reservas/`: Wizard paso a paso para selección de servicio, fecha, hora y datos de la clienta.
  * `dashboard/`: Panel privado para Claudia con agenda del día, semana y mes.
  * `clientes/`: Módulo de gestión y directorio de clientas.
  * `servicios/`: Administración de catálogo de servicios y duraciones.
  * `configuracion/`: Configuración de horarios laborales y bloqueos de tiempo.

## Regla Estricta de Componentes
Cada componente debe mantener sus archivos separados:
* `componente.ts`
* `componente.html`
* `componente.css`

No se utiliza inline HTML ni CSS extenso en el código TypeScript.
