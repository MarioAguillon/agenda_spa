import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Servicio } from '../../../core/models/servicio.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

export interface ServicioApiResponse {
  status: string;
  data: Servicio[];
}

export interface SingleServicioApiResponse {
  status: string;
  data: Servicio;
}

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  constructor(private http: HttpClient) {}

  // Para clientas (Solo servicios activos)
  getPublicServicios(): Observable<ServicioApiResponse> {
    return this.http.get<ServicioApiResponse>(API_ENDPOINTS.SERVICIOS);
  }

  // Para Dashboard Admin (Todos los servicios)
  getAllServicios(): Observable<ServicioApiResponse> {
    return this.http.get<ServicioApiResponse>(`${API_ENDPOINTS.SERVICIOS}/all`);
  }

  createServicio(servicio: { nombre: string; descripcion?: string; duracionMinutos: number }): Observable<SingleServicioApiResponse> {
    return this.http.post<SingleServicioApiResponse>(API_ENDPOINTS.SERVICIOS, servicio);
  }

  updateServicio(id: string, servicio: Partial<Servicio>): Observable<SingleServicioApiResponse> {
    return this.http.put<SingleServicioApiResponse>(`${API_ENDPOINTS.SERVICIOS}/${id}`, servicio);
  }
}
