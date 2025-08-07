import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { GeneralStatesModel } from "app/models/common.model";
import { User, PerfilInput, EstadoInput } from "app/models/user.model";
import { UserService } from "app/services/users/users.service";

@Component({
  selector: "app-registrar",
  templateUrl: "./registrar.component.html",
  styleUrls: ["./registrar.component.scss"],
})
export class RegistrarComponent implements OnInit {
  userForm: FormGroup;
  searchTerm: string = "";
  searchResults: User[] = [];
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  currentUserId: number | null = null;
  userService: UserService;

  perfiles: PerfilInput[] = [
    { value: "1", label: "Administrador" },
    { value: "2", label: "Basico" },
  ];

  estados: EstadoInput[] = [
    { value: GeneralStatesModel.ACTIVO, label: "Activo", icon: "check_circle" },
    { value: GeneralStatesModel.INACTIVO, label: "Inactivo", icon: "cancel" },
  ];

  // Datos de ejemplo para la búsqueda
  allUsers: User[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    userService: UserService
  ) {
    this.createForm();
    this.userService = userService;
  }

  ngOnInit(): void {
    this.loadInitialUsers();
  }

  private loadInitialUsers(): void {
    this.userService.getUsers().subscribe((res) => {
      if ("data" in res) {
        this.allUsers = res.data;
        // Mostrar todos los usuarios al inicio
        this.searchResults = [...this.allUsers];
        console.log("Usuarios cargados inicialmente:", this.allUsers.length);
      }
      if ("error" in res) {
        alert(res.error || "Error desconocido al cargar usuarios");
      }
    });
  }

  createForm(): void {
    this.userForm = this.formBuilder.group({
      usuario_id: [null],
      usuario_nombres: ["", [Validators.required, Validators.minLength(2)]],
      usuario_apellidos: ["", [Validators.required, Validators.minLength(2)]],
      usuario_perfil: ["", Validators.required],
      usuario_estado: ["", Validators.required],
      accion: ["registrar"],
    });
  }

  onSearch(event: any): void {
    const searchValue = event.target.value.toLowerCase();
    this.searchTerm = searchValue;

    this.performSearch();
  }

  performSearch(): void {
    if (this.searchTerm.length === 0) {
      // Si no hay término de búsqueda, mostrar todos los usuarios
      this.searchResults = [...this.allUsers];
      return;
    }

    if (this.searchTerm.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searchResults = this.allUsers.filter((user) => {
      const matchNombres = user.usuario_nombres
        ?.toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      const matchApellidos = user.usuario_apellidos
        ?.toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      const matchPerfil = user.usuario_perfil == Number(this.searchTerm);

      return matchNombres || matchApellidos || matchPerfil;
    });

    console.log(
      `Búsqueda realizada: "${this.searchTerm}" - ${this.searchResults.length} resultados encontrados`
    );
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.valid) {
      this.isSubmitting = true;

      const userData: User = this.userForm.value;
      const isEditing = this.isEditMode && this.currentUserId;

      console.log(
        `${isEditing ? "Editando" : "Registrando"} usuario:`,
        userData
      );

      if (isEditing) {
        // Modo edición - llamar updateUser
        this.userService.updateUser(userData).subscribe((res) => {
          this.handleSubmitResponse(
            res,
            "Usuario actualizado exitosamente",
            "Error al actualizar usuario"
          );
        });
      } else {
        // Modo registro - llamar saveUser
        this.userService.saveUser(userData).subscribe((res) => {
          this.handleSubmitResponse(
            res,
            "Usuario registrado exitosamente",
            "Error al registrar usuario"
          );
        });
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.userForm.controls).forEach((key) => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  private handleSubmitResponse(
    res: any,
    successMessage: string,
    errorPrefix: string
  ): void {
    if ("message" in res) {
      alert(successMessage);
      // Recargar la lista de usuarios después de guardar/actualizar
      this.reloadUsersAndUpdateSearch();
      // Solo hacer reset si la operación fue exitosa
      this.onReset();
    }
    if ("error" in res) {
      console.error(res.error || `${errorPrefix} - error desconocido`);
      alert(res.error || errorPrefix);

      // En caso de error, solo detener el loading pero mantener el formulario
      this.isSubmitting = false;

      // Si estaba en modo edición y falló, cancelar la edición
      if (this.isEditMode) {
        this.cancelEdit();
      }
    }
  }

  private reloadUsersAndUpdateSearch(): void {
    this.userService.getUsers().subscribe((res) => {
      if ("data" in res) {
        // Actualizar la lista completa de usuarios
        this.allUsers = res.data;

        // Actualizar los resultados de búsqueda basándose en el término actual
        this.performSearch();

        console.log(
          "Lista de usuarios actualizada:",
          this.allUsers.length,
          "usuarios"
        );
        console.log(
          "Resultados de búsqueda actualizados:",
          this.searchResults.length,
          "resultados"
        );
      }
      if ("error" in res) {
        console.error("Error al recargar usuarios:", res.error);
        // No mostrar alert aquí para no molestar al usuario después de una operación exitosa
      }
    });
  }

  private cancelEdit(): void {
    // Cancelar el modo de edición y volver a registro
    this.isEditMode = false;
    this.currentUserId = null;
    this.userForm.patchValue({
      accion: "registrar",
    });

    // Limpiar el formulario pero mantener los datos para que el usuario pueda corregir
    // Solo limpiar el ID para evitar confusión
    this.userForm.patchValue({
      usuario_id: null,
    });
  }

  onReset(): void {
    this.userForm.reset();
    this.userForm.patchValue({
      accion: "registrar",
    });
    this.isEditMode = false;
    this.currentUserId = null;
    this.isSubmitting = false; // Asegurar que se detenga cualquier loading
    this.clearSearch();
  }

  onCancelEdit(): void {
    if (this.isEditMode) {
      if (
        confirm(
          "¿Está seguro de que desea cancelar la edición? Se perderán los cambios no guardados."
        )
      ) {
        this.onReset();
      }
    } else {
      this.onReset();
    }
  }

  clearSearch(): void {
    this.searchTerm = "";
    // Mantener todos los usuarios visibles después del reset
    this.searchResults = [...this.allUsers];
  }

  refreshUsersList(): void {
    console.log("Refrescando lista de usuarios manualmente...");
    this.reloadUsersAndUpdateSearch();
  }

  onCancel(): void {
    this.router.navigate(["/users"]);
  }

  editUser(user: User): void {
    // Configurar modo de edición
    this.isEditMode = true;
    this.currentUserId = user.usuario_id || null;

    // Llenar el formulario con los datos del usuario seleccionado
    this.userForm.patchValue({
      usuario_id: user.usuario_id,
      usuario_nombres: user.usuario_nombres,
      usuario_apellidos: user.usuario_apellidos,
      usuario_perfil: `${user.usuario_perfil}`, // Asegurarse de que el valor sea un string
      usuario_estado: user.usuario_estado,
      accion: "editar",
    });

    // Scroll hacia el formulario
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  deleteUser(userId: number): void {
    if (confirm("¿Está seguro de que desea eliminar este usuario?")) {
      this.userService.deleteUser(userId).subscribe((res) => {
        if ("message" in res) {
          console.log("Usuario eliminado:", res.message);
          alert("Usuario eliminado exitosamente");

          // Recargar usuarios y actualizar búsqueda
          this.reloadUsersAndUpdateSearch();
        }
        if ("error" in res) {
          console.error(res.error || "Error desconocido al eliminar usuario");
          alert(res.error || "Error al eliminar usuario");
        }
      });
    }
  }

  getPerfilLabel(perfilValue: string): string {
    const perfil = this.perfiles.find((p) => p.value === perfilValue);
    return perfil ? perfil.label : "Desconocido";
  }

  getEstadoLabel(estadoValue: string): string {
    const estado = this.estados.find((e) => e.value === estadoValue);
    return estado ? estado.label : "Desconocido";
  }

  getSubmitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode ? "Actualizando..." : "Guardando...";
    }
    return this.isEditMode ? "Actualizar Usuario" : "Guardar Usuario";
  }

  getFormTitle(): string {
    return this.isEditMode ? "Editar Usuario" : "Registro de Usuarios";
  }

  getFormSubtitle(): string {
    return this.isEditMode
      ? "Modifique los datos del usuario seleccionado"
      : "Complete el formulario para registrar un nuevo usuario";
  }

  getResetButtonText(): string {
    return this.isEditMode ? "Cancelar Edición" : "Limpiar Formulario";
  }

  getResetButtonIcon(): string {
    return this.isEditMode ? "cancel" : "refresh";
  }
}
