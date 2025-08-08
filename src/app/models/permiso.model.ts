export interface Permiso {
  permiso_id?: number; // Opcional porque no se envía al guardar
  permiso_perfil: number; // ID del perfil/rol
  permiso_menu: number; // ID del menú
}

export interface PermisoConDetalles extends Permiso {
  menu_nombre?: string;
  menu_descripcion?: string;
  menu_url?: string;
  menu_icono?: string;
  menu_padre_id?: number;
  perfil_nombre?: string;
}

// Nueva interfaz para los datos que devuelve el backend con el campo 'selected'
export interface MenuConPermiso {
  menu_id: number;
  menu_nombre: string;
  menu_tipo: string;
  menu_path: string;
  menu_id_padre?: number;
  selected: number; // 1 si tiene permiso, 0 si no
}

export interface GuardarPermisoResponse {
  success: boolean;
  id_insertado: number;
}

export interface ConsultarPermisoResponse {
  permisos: Permiso[];
}

export interface SimpleSuccessResponse {
  success: boolean;
}

export interface ErrorResponse {
  error: string;
}

export interface PerfilOption {
  value: number;
  label: string;
}

export interface MenuTreeNode {
  menu_id: number;
  menu_nombre: string;
  menu_descripcion?: string;
  menu_url?: string;
  menu_icono?: string;
  menu_padre_id?: number;
  menu_orden?: number;
  children?: MenuTreeNode[];
  hasPermission?: boolean; // Indica si el perfil tiene permiso para este menú
  isExpanded?: boolean; // Para controlar la expansión del árbol
}
