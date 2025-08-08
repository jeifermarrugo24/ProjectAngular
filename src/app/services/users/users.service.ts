import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

import {
  GuardarUserResponse,
  SimpleSuccessResponse,
  ErrorResponse,
  User,
  ConsultarUserResponse,
} from "../../models/user.model";
import { ApiResponseModel } from "app/models/response-api.model";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    // Obtener el token del localStorage si existe
    const userData = localStorage.getItem("userData");
    let token = environment.token || "";

    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.token) {
          token = user.token;
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });
  }

  getCurrentUserProfile(): Observable<ApiResponseModel<User>> {
    return this.http.post<ApiResponseModel<User>>(
      `${this.apiUrl}/services_user.php?accion=consultarPerfil`,
      {}, // El backend extraerá el usuario_id del token
      { headers: this.getHeaders() }
    );
  }

  saveUser(user: User): Observable<ApiResponseModel<any>> {
    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/guardarDatosUsuario`,
      user,
      { headers: this.getHeaders() }
    );
  }

  getUsers(filtros: Partial<User> = {}): Observable<ApiResponseModel<User[]>> {
    return this.http.post<ApiResponseModel<User[]>>(
      `${this.apiUrl}/consultarDatosUsuario`,
      filtros,
      { headers: this.getHeaders() }
    );
  }

  deleteUser(id: number): Observable<ApiResponseModel<any>> {
    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/eliminarDatosUsuario`,
      { usuario_id: id },
      { headers: this.getHeaders() }
    );
  }

  updateUser(user: User): Observable<ApiResponseModel<any>> {
    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/editarDatosUsuario`,
      user,
      { headers: this.getHeaders() }
    );
  }
}
