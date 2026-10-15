import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../../../core/models/cliente.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

export interface ClienteApiResponse {
  status: string;
  data: Cliente[];
}

export interface SingleClienteApiResponse {
  status: string;
  data: Cliente;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  constructor(private http: HttpClient) {}

  getClientes(search?: string): Observable<ClienteApiResponse> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<ClienteApiResponse>(API_ENDPOINTS.CLIENTES, { params });
  }

  getClienteById(id: string): Observable<SingleClienteApiResponse> {
    return this.http.get<SingleClienteApiResponse>(`${API_ENDPOINTS.CLIENTES}/${id}`);
  }

  createCliente(cliente: { nombre: string; telefono: string; email?: string; notas?: string }): Observable<SingleClienteApiResponse> {
    return this.http.post<SingleClienteApiResponse>(API_ENDPOINTS.CLIENTES, cliente);
  }
}
