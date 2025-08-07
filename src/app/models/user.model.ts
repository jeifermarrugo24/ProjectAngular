export interface User {
  usuario_id?: number; // Opcional porque no se envía al guardar
  usuario_nombres: string;
  usuario_apellidos: string;
  usuario_email: string;
  usuario_password?: string; // Opcional porque no se envía al editar
  usuario_estado: string;
  usuario_perfil: number;
}

export interface GuardarUserResponse {
  success: boolean;
  id_insertado: number;
}

export interface ConsultarUserResponse {
  users: User[];
}

export interface SimpleSuccessResponse {
  success: boolean;
}
export interface ErrorResponse {
  error: string;
}

export interface PerfilInput {
  value: string;
  label: string;
}

export interface EstadoInput {
  value: string;
  label: string;
  icon: string;
}
