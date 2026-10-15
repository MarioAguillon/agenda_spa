import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/public/layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/pages/landing/landing').then(m => m.LandingComponent)
      },
      {
        path: 'reservar',
        loadComponent: () => import('./features/reservas/pages/flujo-reserva/flujo-reserva').then(m => m.FlujoReservaComponent)
      },
      {
        path: 'reservar/confirmacion',
        loadComponent: () => import('./features/reservas/pages/confirmacion/confirmacion').then(m => m.ConfirmacionComponent)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/layout/dashboard-layout').then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/pages/inicio/inicio').then(m => m.InicioComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/pages/lista-clientes/lista-clientes').then(m => m.ListaClientesComponent)
      },
      {
        path: 'servicios',
        loadComponent: () => import('./features/servicios/pages/lista-servicios/lista-servicios').then(m => m.ListaServiciosComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/configuracion/pages/horarios/horarios').then(m => m.HorariosComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
