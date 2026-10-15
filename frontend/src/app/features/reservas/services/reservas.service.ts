import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita, CrearCitaRequest } from '../../../core/models/cita.model';
import { Servicio } from '../../../core/models/servicio.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

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

  getDisponibilidadHorarios(servicioIds: string[], fecha: string): Observable<{ status: string; data: DisponibilidadSlot[] }> {
    const ids = servicioIds.join(',');
    return this.http.get<{ status: string; data: DisponibilidadSlot[] }>(
      `${API_ENDPOINTS.DISPONIBILIDAD}?servicioIds=${ids}&fecha=${fecha}`
    );
  }

  crearReservaOnline(request: CrearCitaRequest): Observable<SingleCitaResponse> {
    return this.http.post<SingleCitaResponse>(API_ENDPOINTS.CITAS.BASE, request);
  }
}
