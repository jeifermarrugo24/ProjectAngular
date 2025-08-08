/*
  menu_descripcion: menu.menu_descripcion,
          menu_url: menu.menu_url,
          menu_icono: menu.menu_icono,
          menu_padre_id: menu.menu_padre_id,
          menu_orden: menu.menu_orden, */
export interface Menu {
  menu_id?: number; // Opcional porque no se envía al guardar
  menu_nombre: string;
  menu_tipo: string; // Tipo de menú para agrupación
  menu_id_padre?: number; // Para submenús (nullable)
  menu_path: string; // URL/ruta del menú

  // Propiedades adicionales que pueden existir en el backend
  menu_descripcion?: string;
  menu_url?: string;
  menu_icono?: string;
  menu_padre_id?: number; // Alias para compatibilidad
  menu_orden?: number;
  menu_estado?: string;
}

export interface GuardarMenuResponse {
  success: boolean;
  id_insertado: number;
}

export interface ConsultarMenuResponse {
  menus: Menu[];
}

export interface SimpleSuccessResponse {
  success: boolean;
}

export interface ErrorResponse {
  error: string;
}

export interface MenuInput {
  value: string;
  label: string;
}
