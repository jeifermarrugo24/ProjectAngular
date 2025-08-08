import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, forkJoin } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { environment } from "../../../environments/environment";

import {
  GuardarPermisoResponse,
  SimpleSuccessResponse,
  ErrorResponse,
  Permiso,
  PermisoConDetalles,
  ConsultarPermisoResponse,
  MenuTreeNode,
  PerfilOption,
  MenuConPermiso,
} from "../../models/permiso.model";
import { Menu } from "../../models/menu.model";
import { ApiResponseModel } from "app/models/response-api.model";

@Injectable({
  providedIn: "root",
})
export class PermisosService {
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
   * Guardar un nuevo permiso
   */
  savePermiso(permiso: Permiso): Observable<ApiResponseModel<any>> {
    console.log("=== GUARDANDO PERMISO ===");
    console.log("Datos del permiso:", permiso);

    // Adaptar formato para el backend
    const requestData = {
      permiso_perfil: permiso.permiso_perfil,
      menus: [permiso.permiso_menu], // El backend espera un array de menus
    };

    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/guardarDatosPermiso`,
      requestData,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Consultar permisos con filtros opcionales
   * Endpoint: POST /consultarDatosPermiso
   */
  getPermisos(
    filtros: Partial<Permiso> = {}
  ): Observable<ApiResponseModel<Permiso[]>> {
    console.log("=== CONSULTANDO PERMISOS ===");
    console.log("Filtros aplicados:", filtros);
    console.log("URL:", `${this.apiUrl}/consultarDatosPermiso`);

    return this.http.post<ApiResponseModel<Permiso[]>>(
      `${this.apiUrl}/consultarDatosPermiso`,
      filtros,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener permisos de un perfil específico
   */
  getPermisosByPerfil(
    perfilId: number
  ): Observable<ApiResponseModel<Permiso[]>> {
    return this.getPermisos({ permiso_perfil: perfilId });
  }

  /**
   * Obtener todos los menús con información de permisos para un perfil específico
   */
  getMenusWithPermissionsByPerfil(
    perfilId: number
  ): Observable<ApiResponseModel<MenuConPermiso[]>> {
    console.log("=== CONSULTANDO MENÚS CON PERMISOS POR PERFIL ===");
    console.log("Perfil ID:", perfilId);
    console.log("URL:", `${this.apiUrl}/consultarMenusConPermisos`);

    return this.http.post<ApiResponseModel<MenuConPermiso[]>>(
      `${this.apiUrl}/consultarMenusConPermisos`,
      { permiso_perfil: perfilId },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Obtener permisos de un menú específico
   */
  getPermisosByMenu(menuId: number): Observable<ApiResponseModel<Permiso[]>> {
    return this.getPermisos({ permiso_menu: menuId });
  }

  /**
   * Eliminar un permiso por ID
   * Endpoint: POST /eliminarDatosPermiso
   */
  deletePermiso(id: number): Observable<ApiResponseModel<any>> {
    console.log("=== ELIMINANDO PERMISO ===");
    console.log("ID del permiso:", id);
    console.log("URL:", `${this.apiUrl}/eliminarDatosPermiso`);

    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/eliminarDatosPermiso`,
      { permiso_id: id },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Eliminar permiso por perfil y menú
   */
  deletePermisoByPerfilMenu(
    perfilId: number,
    menuId: number
  ): Observable<ApiResponseModel<any>> {
    console.log("=== ELIMINANDO PERMISO POR PERFIL Y MENÚ ===");
    console.log("Perfil ID:", perfilId, "Menu ID:", menuId);

    // Primero obtener el permiso para conseguir su ID
    return this.getPermisos({ permiso_perfil: perfilId, permiso_menu: menuId })
      .pipe(
        map((response: ApiResponseModel<Permiso[]>) => {
          if (response.success && response.data && response.data.length > 0) {
            const permiso = response.data[0];
            return this.deletePermiso(permiso.permiso_id!);
          } else {
            throw new Error("Permiso no encontrado");
          }
        })
      )
      .pipe(
        switchMap((deleteObs: Observable<ApiResponseModel<any>>) => deleteObs)
      );
  }

  /**
   * Eliminar todos los permisos de un perfil
   */
  deleteAllPermisosByPerfil(
    perfilId: number
  ): Observable<ApiResponseModel<any>> {
    console.log("=== ELIMINANDO TODOS LOS PERMISOS DEL PERFIL ===");
    console.log("Perfil ID:", perfilId);

    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/editarDatosPermiso`,
      {
        permiso_perfil: perfilId,
        menus: [], // Array vacío para eliminar todos
      },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Guardar múltiples permisos para un perfil
   */
  savePermisosForPerfil(
    perfilId: number,
    menuIds: number[]
  ): Observable<ApiResponseModel<any>> {
    console.log("=== GUARDANDO MÚLTIPLES PERMISOS ===");
    console.log("Perfil ID:", perfilId, "Menu IDs:", menuIds);

    const requestData = {
      permiso_perfil: perfilId,
      menus: menuIds,
    };

    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/guardarDatosPermiso`,
      requestData,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Actualizar un permiso existente
   * Endpoint: POST /editarDatosPermiso
   */
  updatePermiso(permiso: Permiso): Observable<ApiResponseModel<any>> {
    console.log("=== ACTUALIZANDO PERMISO ===");
    console.log("Datos del permiso:", permiso);
    console.log("URL:", `${this.apiUrl}/editarDatosPermiso`);

    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/editarDatosPermiso`,
      permiso,
      { headers: this.getHeaders() }
    );
  }

  /**
   * Verificar si un perfil tiene permiso para un menú específico
   */
  hasPermission(perfilId: number, menuId: number): Observable<boolean> {
    return this.getPermisos({
      permiso_perfil: perfilId,
      permiso_menu: menuId,
    }).pipe(
      map((response: ApiResponseModel<Permiso[]>) => {
        return response.success && response.data && response.data.length > 0;
      })
    );
  }

  /**
   * Obtener árbol de menús con permisos para un perfil
   */
  getMenuTreeWithPermissions(perfilId: number): Observable<MenuTreeNode[]> {
    console.log("=== OBTENIENDO ÁRBOL DE MENÚS CON PERMISOS ===");
    console.log("Perfil ID:", perfilId);

    if (perfilId === 0) {
      // Sin perfil seleccionado, cargar todos los menús sin permisos
      return this.getAllMenusAsTree();
    }

    // Usar el nuevo endpoint que devuelve todos los menús con el campo 'selected'
    return this.getMenusWithPermissionsByPerfil(perfilId).pipe(
      map((response: ApiResponseModel<MenuConPermiso[]>) => {
        const menuData = response.success ? response.data || [] : [];

        console.log("Datos recibidos del backend:", menuData);

        // Convertir los datos a TreeNodes
        const treeNodes: MenuTreeNode[] = menuData.map(
          (item: MenuConPermiso) => ({
            menu_id: item.menu_id || 0,
            menu_nombre: item.menu_nombre || "",
            menu_descripcion: "",
            menu_url: item.menu_path || "",
            menu_icono: "folder",
            menu_padre_id: item.menu_id_padre || null,
            menu_orden: 0,
            children: [],
            hasPermission: Boolean(item.selected), // Usar el campo 'selected' del backend
            isExpanded: false,
          })
        );

        console.log("TreeNodes procesados:", treeNodes);

        // Construir árbol jerárquico
        return this.buildMenuTree(treeNodes);
      })
    );
  }

  /**
   * Obtener todos los menús como árbol sin información de permisos
   */
  private getAllMenusAsTree(): Observable<MenuTreeNode[]> {
    console.log("=== OBTENIENDO TODOS LOS MENÚS SIN PERMISOS ===");

    return this.http
      .post<ApiResponseModel<Menu[]>>(
        `${this.apiUrl}/consultarDatosMenu`,
        {},
        { headers: this.getHeaders() }
      )
      .pipe(
        map((response: ApiResponseModel<Menu[]>) => {
          const menuData = response.success ? response.data || [] : [];

          console.log("Menús obtenidos:", menuData);

          // Convertir los datos a TreeNodes sin permisos
          const treeNodes: MenuTreeNode[] = menuData.map((item: Menu) => ({
            menu_id: item.menu_id || 0,
            menu_nombre: item.menu_nombre || "",
            menu_descripcion: "",
            menu_url: item.menu_path || "",
            menu_icono: "folder",
            menu_padre_id: item.menu_id_padre || null,
            menu_orden: 0,
            children: [],
            hasPermission: false, // Sin permisos por defecto
            isExpanded: false,
          }));

          console.log("TreeNodes procesados sin permisos:", treeNodes);

          // Construir árbol jerárquico
          return this.buildMenuTree(treeNodes);
        })
      );
  }

  /**
   * Construir árbol jerárquico de menús
   */
  private buildMenuTree(nodes: MenuTreeNode[]): MenuTreeNode[] {
    const nodeMap = new Map<number, MenuTreeNode>();
    const rootNodes: MenuTreeNode[] = [];

    // Crear mapa de nodos
    nodes.forEach((node) => {
      nodeMap.set(node.menu_id, node);
    });

    // Construir jerarquía
    nodes.forEach((node) => {
      if (node.menu_padre_id === null || node.menu_padre_id === undefined) {
        // Es un nodo raíz
        rootNodes.push(node);
      } else {
        // Es un nodo hijo
        const parent = nodeMap.get(node.menu_padre_id);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
        }
      }
    });

    // Ordenar por menu_orden si está disponible
    this.sortTreeNodes(rootNodes);

    return rootNodes;
  }

  /**
   * Ordenar nodos del árbol por orden
   */
  private sortTreeNodes(nodes: MenuTreeNode[]): void {
    nodes.sort((a, b) => (a.menu_orden || 0) - (b.menu_orden || 0));

    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        this.sortTreeNodes(node.children);
      }
    });
  }
}
