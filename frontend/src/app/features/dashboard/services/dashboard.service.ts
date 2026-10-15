import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from '../../../core/models/cita.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

export interface DashboardResumen {
  citasHoyCount: number;
  citasHoy: Cita[];
  proximasCitas: Cita[];
  totalClientes: number;
  totalServicios: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getResumen(): Observable<{ status: string; data: DashboardResumen }> {
    return this.http.get<{ status: string; data: DashboardResumen }>(API_ENDPOINTS.DASHBOARD);
  }

  getCitasByRange(fechaInicio: string, fechaFin: string): Observable<{ status: string; data: Cita[] }> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<{ status: string; data: Cita[] }>(API_ENDPOINTS.CITAS.BASE, { params });
  }

  updateEstadoCita(citaId: string, estado: string): Observable<{ status: string; data: Cita }> {
    return this.http.put<{ status: string; data: Cita }>(`${API_ENDPOINTS.CITAS.BASE}/${citaId}/estado`, { estado });
  }

  crearCitaManual(data: {
    servicioIds: string[];
    fecha: string;
    horaInicio: string;
    clienteId?: string;
    clienteNuevo?: { nombre: string; telefono: string; email?: string };
    notas?: string;
  }): Observable<{ status: string; data: Cita }> {
    return this.http.post<{ status: string; data: Cita }>(API_ENDPOINTS.CITAS.MANUAL, data);
  }
}
