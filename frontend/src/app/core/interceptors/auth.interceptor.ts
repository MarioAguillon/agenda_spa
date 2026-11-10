import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../constants/api-endpoints';

const TOKEN_KEY = 'csn_auth_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // El token SOLO viaja a nuestra API, nunca a servicios de terceros
  const esNuestraApi = req.url.startsWith(API_BASE_URL);
  const token = esNuestraApi ? localStorage.getItem(TOKEN_KEY) : null;

  const authReq = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Sesión vencida o inválida: limpiar y volver al login (solo si había sesión)
      if (esNuestraApi && err.status === 401 && token) {
        localStorage.removeItem(TOKEN_KEY);
        router.navigate(['/login'], { queryParams: { expirada: 1 } });
      }
      return throwError(() => err);
    })
  );
};
