import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita, CrearCitaRequest } from '../../../core/models/cita.model';
import { Servicio } from '../../../core/models/servicio.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { HorarioNegocio } from '../../../core/models/horario.model';

export interface DisponibilidadSlot {
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
}

export interface SingleCitaResponse {
  status: string;
  data: Cita;
}

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  constructor(private http: HttpClient) {}

  getServiciosDisponibles(): Observable<{ status: string; data: Servicio[] }> {
    return this.http.get<{ status: string; data: Servicio[] }>(API_ENDPOINTS.SERVICIOS);
  }

  getHorarioPublico(): Observable<{ status: string; data: HorarioNegocio[] }> {
    return this.http.get<{ status: string; data: HorarioNegocio[] }>(`${API_ENDPOINTS.HORARIOS}/publico`);
  }

  getDisponibilidadHorarios(servicioIds: string[], fecha: string): Observable<{ status: string; data: DisponibilidadSlot[] }> {
    const params = new HttpParams().set('servicioIds', servicioIds.join(',')).set('fecha', fecha);
    return this.http.get<{ status: string; data: DisponibilidadSlot[] }>(API_ENDPOINTS.DISPONIBILIDAD, { params });
  }

  crearReservaOnline(request: CrearCitaRequest): Observable<SingleCitaResponse> {
    return this.http.post<SingleCitaResponse>(API_ENDPOINTS.CITAS.BASE, request);
  }
}
