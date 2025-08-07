import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting: boolean = false;
  rememberMe: boolean = false;

  constructor(private formBuilder: FormBuilder) {
    this.createLoginForm();
  }

  ngOnInit(): void {
    // Inicialización adicional si es necesaria
  }

  createLoginForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;

      const loginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
        rememberMe: this.loginForm.value.rememberMe,
      };

      console.log("=== DATOS DE LOGIN CAPTURADOS ===");
      console.log("Email:", loginData.email);
      console.log("Password:", loginData.password);
      console.log("Remember Me:", loginData.rememberMe);
      console.log("Timestamp:", new Date().toISOString());
      console.log("====================================");

      // Simular llamada a API
      setTimeout(() => {
        const message = `Login exitoso!\n\nEmail: ${
          loginData.email
        }\nRecordar sesión: ${loginData.rememberMe ? "Sí" : "No"}`;
        alert(message);
        this.isSubmitting = false;

        // Opcional: limpiar formulario después del login exitoso
        // this.resetForm();

        // Aquí iría la redirección al dashboard cuando esté listo
        // this.router.navigate(['/dashboard']);
      }, 2000);
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
        return `${
          fieldName === "email" ? "El email" : "La contraseña"
        } es requerida`;
      }
      if (field.errors["email"]) {
        return "Ingrese un email válido";
      }
      if (field.errors["minlength"]) {
        return "La contraseña debe tener al menos 6 caracteres";
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
