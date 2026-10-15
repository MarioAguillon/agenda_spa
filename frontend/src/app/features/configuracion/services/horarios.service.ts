import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HorarioNegocio, BloqueoHorario } from '../../../core/models/horario.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

export interface HorariosApiResponse {
  status: string;
  data: HorarioNegocio[];
}

export interface BloqueoApiResponse {
  status: string;
  data: BloqueoHorario;
}

@Injectable({
  providedIn: 'root'
})
export class HorariosService {
  constructor(private http: HttpClient) {}

  getHorarios(): Observable<HorariosApiResponse> {
    return this.http.get<HorariosApiResponse>(API_ENDPOINTS.HORARIOS);
  }

  updateHorarios(horarios: HorarioNegocio[]): Observable<HorariosApiResponse> {
    return this.http.put<HorariosApiResponse>(API_ENDPOINTS.HORARIOS, { horarios });
  }

  createBloqueo(bloqueo: { fecha: string; horaInicio: string; horaFin: string; motivo?: string }): Observable<BloqueoApiResponse> {
    return this.http.post<BloqueoApiResponse>(API_ENDPOINTS.BLOQUEOS, bloqueo);
  }

  deleteBloqueo(id: string): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(`${API_ENDPOINTS.BLOQUEOS}/${id}`);
  }
}
