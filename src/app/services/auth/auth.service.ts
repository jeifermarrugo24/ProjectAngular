import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment";

export interface LoginRequest {
  usuario_email: string;
  usuario_password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  error?: string;
}

export interface UserData {
  usuario_id: number;
  usuario_nombres: string;
  usuario_apellidos?: string;
  usuario_perfil?: string;
  usuario_estado?: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  private currentUserSubject = new BehaviorSubject<UserData | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Verificar si hay un token guardado al iniciar el servicio
    this.checkStoredToken();
  }

  private getHeaders(): HttpHeaders {
    const token = environment.token || "";
    return new HttpHeaders({
      Authorization: `${token}`,
      "Content-Type": "application/json",
    });
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/loginUser`,
      credentials,
      { headers: this.getHeaders() }
    );
  }

  setAuthData(token: string): void {
    try {
      // Guardar token en localStorage
      localStorage.setItem("authToken", token);

      // Decodificar el token para obtener datos del usuario
      const decodedToken = this.decodeToken(token);
      if (decodedToken) {
        this.currentUserSubject.next(decodedToken);
        localStorage.setItem("userData", JSON.stringify(decodedToken));
      }

      console.log("Token y datos de usuario guardados correctamente");
    } catch (error) {
      console.error("Error al guardar datos de autenticación:", error);
    }
  }

  private decodeToken(token: string): UserData | null {
    try {
      // El token del backend está en base64, lo decodificamos
      const decoded = atob(token);
      const userData = JSON.parse(decoded);
      return userData;
    } catch (error) {
      console.error("Error al decodificar token:", error);
      return null;
    }
  }

  private checkStoredToken(): void {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error("Error al cargar datos de usuario guardados:", error);
        this.logout();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem("authToken");
  }

  getCurrentUser(): UserData | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  logout(): void {
    // Limpiar localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");

    // Limpiar estado actual
    this.currentUserSubject.next(null);

    // Redirigir al login
    this.router.navigate(["/"]);

    console.log("Sesión cerrada correctamente");
  }

  redirectToDashboard(): void {
    this.router.navigate(["/dashboard"]);
  }

  // Método para renovar token si es necesario
  refreshToken(): Observable<LoginResponse> {
    // Implementar si el backend soporta refresh tokens
    throw new Error("Refresh token no implementado");
  }
}
