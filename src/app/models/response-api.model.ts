export interface ApiResponseModel<T> {
  success: boolean;
  data: T;
  message?: string;
  id_registro?: number;
  error?: string;
  detalle?: string;
}
