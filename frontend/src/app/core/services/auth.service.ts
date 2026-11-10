import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

export interface AuthResponse {
  status: string;
  data: {
    token: string;
    usuario: UserProfile;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'csn_auth_token';
  
  // Signal para estado reactivo del usuario
  public currentUser = signal<UserProfile | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.checkStoredSession();
  }

  /** Hay sesión si existe un token y no ha expirado (se lee el campo exp del JWT). */
  public isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    if (this.tokenExpirado(token)) {
      localStorage.removeItem(this.TOKEN_KEY);
      return false;
    }
    return true;
  }

  private tokenExpirado(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials).pipe(
      tap((res) => {
        if (res.status === 'success' && res.data.token) {
          localStorage.setItem(this.TOKEN_KEY, res.data.token);
          this.currentUser.set(res.data.usuario);
        }
      }),
      catchError((err) => {
        return throwError(() => new Error(err.error?.message || 'Error al iniciar sesión'));
      })
    );
  }

  public logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private checkStoredSession(): void {
    if (this.isAuthenticated()) {
      this.http.get<{ status: string; data: UserProfile }>(API_ENDPOINTS.AUTH.ME).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.currentUser.set(res.data);
          }
        },
        error: (err) => {
          // Solo cerrar sesión si el servidor rechaza el token; un fallo de red no debe expulsar a la usuaria
          if (err?.status === 401 || err?.status === 404) {
            this.logout();
          }
        }
      });
    }
  }
}
