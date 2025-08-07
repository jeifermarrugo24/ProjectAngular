import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

import {
  GuardarMenuResponse,
  SimpleSuccessResponse,
  ErrorResponse,
  Menu,
  ConsultarMenuResponse,
} from "../../models/menu.model";
import { ApiResponseModel } from "app/models/response-api.model";

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
      menu_estado: estado,
    } as Menu);
  }

  /**
   * Obtener menú por ID
   */
  getMenuById(id: number): Observable<ApiResponseModel<Menu[]>> {
    return this.getMenus({ menu_id: id });
  }
}
