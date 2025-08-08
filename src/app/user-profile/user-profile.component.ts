import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../services/users/users.service";
import { User } from "../models/user.model";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.css"],
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  isSubmitting = false;
  showPasswordFields = false;
  currentUser: User | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.loadCurrentUserProfile();
  }

  private createForm(): void {
    this.profileForm = this.formBuilder.group({
      usuario_nombres: ["", [Validators.required, Validators.minLength(2)]],
      usuario_apellidos: ["", [Validators.required, Validators.minLength(2)]],
      usuario_email: ["", [Validators.required, Validators.email]],
      current_password: [""],
      new_password: [""],
      confirm_password: [""],
    });
  }

  private loadCurrentUserProfile(): void {
    // Intentar cargar desde el nuevo endpoint que usa el token
    this.userService.getCurrentUserProfile().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentUser = response.data;
          this.populateForm();
          console.log("Perfil cargado desde token:", this.currentUser);
        }
      },
      error: (error) => {
        console.error("Error al cargar perfil desde token:", error);

        // Fallback: intentar con el método anterior usando el ID del localStorage
        const currentUserId = this.getCurrentUserId();
        if (currentUserId) {
          this.userService.getUsers({ usuario_id: currentUserId }).subscribe({
            next: (response) => {
              if (
                response.success &&
                response.data &&
                response.data.length > 0
              ) {
                this.currentUser = response.data[0];
                this.populateForm();
                console.log("Perfil cargado con fallback:", this.currentUser);
              }
            },
            error: (fallbackError) => {
              console.error("Error en fallback:", fallbackError);
              alert("Error al cargar la información del perfil");
            },
          });
        } else {
          alert(
            "No se pudo identificar el usuario actual. Por favor, inicie sesión nuevamente."
          );
        }
      },
    });
  }

  private populateForm(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        usuario_nombres: this.currentUser.usuario_nombres,
        usuario_apellidos: this.currentUser.usuario_apellidos,
        usuario_email: this.currentUser.usuario_email,
      });
    }
  }

  private getCurrentUserId(): number | null {
    // Implementar según tu sistema de autenticación
    // Por ejemplo, desde localStorage o token JWT
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log("Datos del usuario en localStorage:", user);

        // Si hay un token, intentar extraer el usuario_id del token
        if (user.token) {
          try {
            const tokenData = JSON.parse(atob(user.token));
            if (tokenData.usuario_id) {
              console.log(
                "Usuario ID extraído del token:",
                tokenData.usuario_id
              );
              return tokenData.usuario_id;
            }
          } catch (tokenError) {
            console.error("Error al decodificar token:", tokenError);
          }
        }

        // Fallback: buscar directamente en los datos del usuario
        if (user.usuario_id) {
          console.log("Usuario ID encontrado directamente:", user.usuario_id);
          return user.usuario_id;
        }

        return user.usuario_id || null;
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // Mock temporal para desarrollo - eliminar en producción
    console.warn(
      "No se encontró usuario en localStorage, usando mock temporal"
    );
    return 1;
  }

  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;

    if (this.showPasswordFields) {
      this.profileForm
        .get("current_password")
        ?.setValidators([Validators.required]);
      this.profileForm
        .get("new_password")
        ?.setValidators([Validators.required, Validators.minLength(6)]);
      this.profileForm
        .get("confirm_password")
        ?.setValidators([Validators.required]);
    } else {
      this.profileForm.get("current_password")?.clearValidators();
      this.profileForm.get("new_password")?.clearValidators();
      this.profileForm.get("confirm_password")?.clearValidators();

      this.profileForm.patchValue({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    }

    this.profileForm.get("current_password")?.updateValueAndValidity();
    this.profileForm.get("new_password")?.updateValueAndValidity();
    this.profileForm.get("confirm_password")?.updateValueAndValidity();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors) {
      if (field.errors["required"])
        return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors["email"]) return "Formato de email inválido";
      if (field.errors["minlength"]) {
        const minLength = field.errors["minlength"].requiredLength;
        return `Mínimo ${minLength} caracteres`;
      }
    }
    return "";
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      usuario_nombres: "Nombres",
      usuario_apellidos: "Apellidos",
      usuario_email: "Email",
      current_password: "Contraseña actual",
      new_password: "Nueva contraseña",
      confirm_password: "Confirmar contraseña",
    };
    return labels[fieldName] || fieldName;
  }

  validatePasswords(): boolean {
    if (this.showPasswordFields) {
      const newPassword = this.profileForm.get("new_password")?.value;
      const confirmPassword = this.profileForm.get("confirm_password")?.value;
      return newPassword === confirmPassword;
    }
    return true;
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach((key) => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.validatePasswords()) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (!this.currentUser) {
      alert("No se pudo identificar el usuario actual");
      return;
    }

    this.isSubmitting = true;

    const updateData: User = {
      usuario_id: this.currentUser.usuario_id,
      usuario_nombres: this.profileForm.get("usuario_nombres")?.value,
      usuario_apellidos: this.profileForm.get("usuario_apellidos")?.value,
      usuario_email: this.profileForm.get("usuario_email")?.value,
      usuario_estado: this.currentUser.usuario_estado,
      usuario_perfil: this.currentUser.usuario_perfil,
    };

    // Si hay cambio de contraseña, incluirla
    if (
      this.showPasswordFields &&
      this.profileForm.get("new_password")?.value
    ) {
      updateData.usuario_password = this.profileForm.get("new_password")?.value;
    }

    this.userService.updateUser(updateData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          alert("Perfil actualizado exitosamente");
          this.showPasswordFields = false;
          this.togglePasswordFields(); // Reset password fields
          this.loadCurrentUserProfile(); // Reload data
        } else {
          alert("Error al actualizar el perfil");
        }
      },
      error: (error) => {
        console.error("Error:", error);
        this.isSubmitting = false;
        alert("Error de conexión al actualizar el perfil");
      },
    });
  }

  cancelEdit(): void {
    this.populateForm();
    this.showPasswordFields = false;
    this.togglePasswordFields();
  }
}
