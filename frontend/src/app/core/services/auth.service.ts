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

  public isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
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
    const token = this.getToken();
    if (token) {
      this.http.get<{ status: string; data: UserProfile }>(API_ENDPOINTS.AUTH.ME).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.currentUser.set(res.data);
          }
        },
        error: () => {
          this.logout();
        }
      });
    }
  }
}
