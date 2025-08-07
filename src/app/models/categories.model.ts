export interface Categories {
  categoria_id?: number; // Opcional porque no se envía al guardar
  categoria_nombre: string;
  categoria_estado: string;
}

export interface GuardarCategorieResponse {
  success: boolean;
  id_insertado: number;
}

export interface ConsultarCategorieResponse {
  categories: Categories[];
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
