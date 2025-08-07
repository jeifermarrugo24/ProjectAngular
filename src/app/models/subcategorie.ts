export interface Subcategorie {
  subcategoria_id?: number; // Opcional porque no se envía al guardar
  subcategoria_nombre: string;
  subcategoria_cantidad_productos: number;
  subcategoria_estado: string;
  subcategoria_categoria: number;
}

export interface GuardarSubCategorieResponse {
  success: boolean;
  id_insertado: number;
}

export interface ConsultarSubCategorieResponse {
  subcategories: Subcategorie[];
}

export interface SimpleSuccessResponse {
  success: boolean;
}
export interface ErrorResponse {
  error: string;
}

export interface EstadoInput {
  value: string;
  label: string;
  icon: string;
}
