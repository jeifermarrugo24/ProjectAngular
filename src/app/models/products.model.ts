export interface Productos {
  producto_id?: number; // Opcional porque no se envía al guardar
  producto_nombre: string;
  producto_categoria: number;
  producto_subcategoria?: number; // Opcional según la DB
  subcategorias_seleccionadas?: number[]; // Array de IDs de subcategorías seleccionadas
  subcategorias_ids?: number[]; // Para respuestas de consulta
  categoria_nombre?: string; // Para mostrar en la UI
  subcategorias_nombres?: string; // Para mostrar en la UI
  accion?: string; // Para determinar si es registrar o editar
}

export interface GuardarProductsResponse {
  success: boolean;
  id_insertado: number;
}

export interface ConsultarProductsResponse {
  products: Productos[];
}

export interface SimpleSuccessResponse {
  success: boolean;
}
export interface ErrorResponse {
  error: string;
}
