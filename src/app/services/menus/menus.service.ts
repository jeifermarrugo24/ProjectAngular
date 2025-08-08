import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../environments/environment";

import {
  GuardarMenuResponse,
  SimpleSuccessResponse,
  ErrorResponse,
  Menu,
  ConsultarMenuResponse,
} from "../../models/menu.model";
import { ApiResponseModel } from "app/models/response-api.model";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class MenusService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = environment.token || "";
    return new HttpHeaders({
      Authorization: `${token}`,
      "Content-Type": "application/json",
    });
  }

  /**
   * Guardar un nuevo menú
   * Endpoint: POST /guardarDatosMenu
   */
  saveMenu(menu: Menu): Observable<ApiResponseModel<any>> {
    console.log("=== GUARDANDO MENÚ ===");
    console.log("Datos del menú:", menu);
    console.log("URL:", `${this.apiUrl}/guardarDatosMenu`);

    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/guardarDatosMenu`,
      menu,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Consultar menús con filtros opcionales
   * Endpoint: POST /consultarDatosMenu
   */
  getMenus(filtros: Partial<Menu> = {}): Observable<ApiResponseModel<Menu[]>> {
    console.log("=== CONSULTANDO MENÚS ===");
    console.log("Filtros aplicados:", filtros);
    console.log("URL:", `${this.apiUrl}/consultarDatosMenu`);

    return this.http.post<ApiResponseModel<Menu[]>>(
      `${this.apiUrl}/consultarDatosMenu`,
      filtros,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Consultar todos los menús activos
   */
  getActiveMenus(): Observable<ApiResponseModel<Menu[]>> {
    return this.getMenus({ menu_estado: "Activo" });
  }

  /**
   * Consultar menús principales (sin padre)
   */
  getMainMenus(): Observable<ApiResponseModel<Menu[]>> {
    return this.getMenus({ menu_padre_id: null, menu_estado: "Activo" });
  }

  /**
   * Consultar submenús de un menú padre
   */
  getSubMenus(menuPadreId: number): Observable<ApiResponseModel<Menu[]>> {
    return this.getMenus({ menu_padre_id: menuPadreId, menu_estado: "Activo" });
  }

  /**
   * Eliminar un menú por ID
   * Endpoint: POST /eliminarDatosMenu
   */
  deleteMenu(id: number): Observable<ApiResponseModel<any>> {
    console.log("=== ELIMINANDO MENÚ ===");
    console.log("ID del menú:", id);
    console.log("URL:", `${this.apiUrl}/eliminarDatosMenu`);

    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/eliminarDatosMenu`,
      { menu_id: id },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Actualizar un menú existente
   * Endpoint: POST /editarDatosMenu
   */
  updateMenu(menu: Menu): Observable<ApiResponseModel<any>> {
    console.log("=== ACTUALIZANDO MENÚ ===");
    console.log("Datos del menú:", menu);
    console.log("URL:", `${this.apiUrl}/editarDatosMenu`);

    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/editarDatosMenu`,
      menu,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Buscar menús por nombre
   */
  searchMenusByName(nombre: string): Observable<ApiResponseModel<Menu[]>> {
    const filtros = {
      menu_nombre: nombre,
    };
    return this.getMenus(filtros);
  }

  /**
   * Cambiar estado de un menú (Activo/Inactivo)
   */
  changeMenuStatus(
    id: number,
    estado: string
  ): Observable<ApiResponseModel<any>> {
    console.log("=== CAMBIANDO ESTADO DEL MENÚ ===");
    console.log("ID:", id, "Nuevo estado:", estado);

    return this.updateMenu({
      menu_id: id,
      menu_nombre: "", // Campo requerido, se debe obtener del menú actual
      menu_tipo: "", // Campo requerido, se debe obtener del menú actual
      menu_path: "", // Campo requerido, se debe obtener del menú actual
      menu_estado: estado,
    } as Menu);
  }

  /**
   * Obtener menú por ID
   */
  getMenuById(id: number): Observable<ApiResponseModel<Menu[]>> {
    return this.getMenus({ menu_id: id });
  }

  /**
   * Obtener menús permitidos para un perfil específico
   * Utiliza el servicio de permisos para filtrar menús por perfil
   */
  getMenusByProfile(perfilId: number): Observable<ApiResponseModel<Menu[]>> {
    console.log("=== SERVICIO: getMenusByProfile ===");
    console.log("Perfil ID recibido:", perfilId);
    console.log("Tipo de perfil ID:", typeof perfilId);
    console.log("API URL base:", this.apiUrl);

    const fullUrl = `${this.apiUrl}/consultarDatosMenuPorPerfil`;
    console.log("URL completa:", fullUrl);

    const requestBody = { perfil_id: perfilId };
    console.log("Body de la petición:", requestBody);

    const headers = this.getHeaders();
    console.log("Headers:", headers);

    console.log("🚀 Enviando petición HTTP POST...");

    return this.http
      .post<ApiResponseModel<Menu[]>>(fullUrl, requestBody, {
        headers: headers,
      })
      .pipe(
        map((response) => {
          console.log("📦 Respuesta recibida del servidor:");
          console.log("Response completa:", response);
          return response;
        })
      );
  }

  /**
   * Método de prueba para verificar conectividad
   */
  testConnection(): Observable<any> {
    console.log(
      "🧪 Probando conexión con:",
      `${this.apiUrl}/consultarDatosMenu`
    );
    return this.http.post(
      `${this.apiUrl}/consultarDatosMenu`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
