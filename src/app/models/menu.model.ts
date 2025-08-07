export interface Menu {
  menu_id?: number; // Opcional porque no se envía al guardar
  menu_nombre: string;
  menu_descripcion?: string;
  menu_url?: string;
  menu_icono?: string;
  menu_orden?: number;
  menu_estado: string;
  menu_padre_id?: number; // Para submenús
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
