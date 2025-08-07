import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService, LoginRequest } from "./services/auth/auth.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting: boolean = false;
  rememberMe: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.createLoginForm();
  }

  ngOnInit(): void {
    // // Verificar si ya está autenticado
    // if (this.authService.isAuthenticated()) {
    //   this.authService.redirectToDashboard();
    // }
  }

  createLoginForm(): void {
    this.loginForm = this.formBuilder.group({
      usuario_email: ["", [Validators.required, Validators.minLength(2)]],
      usuario_password: ["", [Validators.required, Validators.minLength(2)]],
      rememberMe: [false],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;

      const loginData: LoginRequest = {
        usuario_email: this.loginForm.value.usuario_email,
        usuario_password: this.loginForm.value.usuario_password,
      };

      console.log("=== INICIANDO SESIÓN ===");
      console.log("Email:", loginData.usuario_email);
      console.log("Contraseña:", loginData.usuario_password);
      console.log("Timestamp:", new Date().toISOString());
      console.log("========================");

      this.authService.login(loginData).subscribe({
        next: (response) => {
          console.log("Respuesta del servidor:", response);

          if (response.success && response.token) {
            // Login exitoso
            console.log("Login exitoso, token recibido");

            // Guardar token y datos de usuario
            this.authService.setAuthData(response.token);

            // Mostrar mensaje de éxito
            alert(`¡Bienvenido! ${response.message}`);

            // Redirigir al dashboard
            this.authService.redirectToDashboard();
          } else {
            // Error en credenciales
            console.error(
              "Login fallido:",
              response.error || "Error desconocido"
            );
            alert(response.error || "Error en el inicio de sesión");
          }

          this.isSubmitting = false;
        },
        error: (error) => {
          console.error("Error en la llamada de login:", error);

          let errorMessage = "Error de conexión con el servidor";

          if (error.status === 401) {
            errorMessage = "Credenciales inválidas. Verifique sus datos.";
          } else if (error.status === 400) {
            errorMessage = "Datos incompletos. Complete todos los campos.";
          } else if (error.status === 500) {
            errorMessage = "Error interno del servidor. Intente más tarde.";
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          }

          alert(errorMessage);
          this.isSubmitting = false;
        },
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });

      console.log("Formulario inválido - Errores encontrados:");
      Object.keys(this.loginForm.controls).forEach((key) => {
        const control = this.loginForm.get(key);
        if (control?.errors) {
          console.log(`${key}:`, control.errors);
        }
      });

      alert("Por favor, complete todos los campos correctamente.");
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors) {
      if (field.errors["required"]) {
        if (fieldName === "usuario_nombres") {
          return "Los nombres son requeridos";
        } else if (fieldName === "usuario_apellidos") {
          return "Los apellidos son requeridos";
        }
        return "Este campo es requerido";
      }
      if (field.errors["minlength"]) {
        return `Este campo debe tener al menos ${field.errors["minlength"].requiredLength} caracteres`;
      }
    }
    return "";
  }

  onSocialLogin(provider: string): void {
    console.log(`Login con ${provider}`);
    alert(`Funcionalidad de ${provider} pendiente de implementar`);
  }

  onForgotPassword(): void {
    console.log("Recuperar contraseña");
    alert("Funcionalidad de recuperar contraseña pendiente de implementar");
  }

  onCreateAccount(): void {
    console.log("Crear nueva cuenta");
    alert("Funcionalidad de crear cuenta pendiente de implementar");
  }

  resetForm(): void {
    this.loginForm.reset();
    this.isSubmitting = false;
  }

  onClearForm(): void {
    if (confirm("¿Está seguro de que desea limpiar el formulario?")) {
      this.resetForm();
    }
  }
}
