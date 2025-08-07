export interface Productos {
  producto_id?: number; // Opcional porque no se envía al guardar
  producto_nombre: string;
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
