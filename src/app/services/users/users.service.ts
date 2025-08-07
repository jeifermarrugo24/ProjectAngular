import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment }  from '../../../environments/environment';

import {
  GuardarUserResponse,
  SimpleSuccessResponse,
  ErrorResponse,
  User,
  ConsultarUserResponse
} from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  saveUser(user: User): Observable<GuardarUserResponse | ErrorResponse> {
    return this.http.post<GuardarUserResponse | ErrorResponse>(
      `${this.apiUrl}/users/save`,
      user,
      { headers: this.getHeaders() }
    );
  }

  getUsers(filtros: Partial<User> = {}): Observable<ConsultarUserResponse | ErrorResponse> {
    return this.http.post<ConsultarUserResponse | ErrorResponse>(
      `${this.apiUrl}/users/get`,
      filtros,
      { headers: this.getHeaders() }
    );
  }

  deleteUser(id: number): Observable<SimpleSuccessResponse | ErrorResponse> {
    return this.http.post<SimpleSuccessResponse | ErrorResponse>(
      `${this.apiUrl}/users/delete`,
      { usuario_id: id },
      { headers: this.getHeaders() }
    );
  }

  updateUser(user: User): Observable<SimpleSuccessResponse | ErrorResponse> {
    return this.http.post<SimpleSuccessResponse | ErrorResponse>(
      `${this.apiUrl}/users/edit`,
      user,
      { headers: this.getHeaders() }
    );
  }
}
