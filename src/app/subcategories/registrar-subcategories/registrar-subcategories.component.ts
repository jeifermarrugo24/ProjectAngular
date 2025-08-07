import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { GeneralStatesModel } from "app/models/common.model";
import { Subcategorie, EstadoInput } from "app/models/subcategorie.model";
import { SubcategorieService } from "app/services/subcategories/subcategories.service";
import { CategoriesService } from "app/services/categories/categories.service";

@Component({
  selector: "app-subcategories",
  templateUrl: "./registrar-subcategories.component.html",
  styleUrls: ["./registrar-subcategories.component.scss"],
})
export class RegistrarSubcategoriesComponent implements OnInit {
  subcategorieForm: FormGroup;
  searchTerm: string = "";
  searchResults: Subcategorie[] = [];
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  currentSubcategoriaId: number | null = null;
  subcategorieService: SubcategorieService;

  estados: EstadoInput[] = [
    { value: GeneralStatesModel.ACTIVO, label: "Activo", icon: "check_circle" },
    { value: GeneralStatesModel.INACTIVO, label: "Inactivo", icon: "cancel" },
  ];

  // Datos de ejemplo para la búsqueda
  allSubcategories: Subcategorie[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    subcategorieService: SubcategorieService
  ) {
    this.createForm();
    this.subcategorieService = subcategorieService;
  }

  ngOnInit(): void {
    this.loadInitialSubcategories();
  }

  private loadInitialSubcategories(): void {
    this.subcategorieService.getSubCategorie().subscribe((res) => {
      if ("data" in res) {
        this.allSubcategories = res.data;
        // Mostrar todos los usuarios al inicio
        this.searchResults = [...this.allSubcategories];
        console.log("Subcategorias cargadas inicialmente:", this.allSubcategories.length);
      }
      if ("error" in res) {
        alert(res.error || "Error desconocido al cargar usuarios");
      }
    });
  }

  createForm(): void {
    this.subcategorieForm = this.formBuilder.group({
      subcategoria_id: [null], // Opcional porque no se envía al guardar
      subcategoria_nombre: ["", [Validators.required, Validators.minLength(2)]],
      subcategoria_cantidad_productos: [0, [Validators.required, Validators.min(0)]],
      subcategoria_estado: ["", Validators.required],
      subcategoria_categoria: [null, Validators.required], // Asegurarse de que este campo sea requerido
      accion: ["registrar"], // Acción por defecto
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
      this.searchResults = [...this.allSubcategories];
      return;
    }

    if (this.searchTerm.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searchResults = this.allSubcategories.filter((subcategorie) => {
      const matchNombre = subcategorie.subcategoria_nombre
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      const matchCantidadProductos = subcategorie.subcategoria_cantidad_productos
        .toString()
        .includes(this.searchTerm);
      const matchCategoriaId = subcategorie.subcategoria_categoria
        .toString()
        .includes(this.searchTerm);

      return matchNombre || matchCantidadProductos || matchCategoriaId;
    });

    console.log(
      `Búsqueda realizada: "${this.searchTerm}" - ${this.searchResults.length} resultados encontrados`
    );
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.subcategorieForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async onSubmit(): Promise<void> {
    if (this.subcategorieForm.valid) {
      this.isSubmitting = true;

      const subcategorieData: Subcategorie = this.subcategorieForm.value;
      const isEditing = this.isEditMode && this.currentSubcategoriaId;

      console.log(
        `${isEditing ? "Editando" : "Registrando"} usuario:`,
        subcategorieData
      );

      if (isEditing) {
        // Modo edición - llamar updateUser
        this.subcategorieService.updateSubcategorie(subcategorieData).subscribe((res) => {
          this.handleSubmitResponse(
            res,
            "Subcategoria actualizada exitosamente",
            "Error al actualizar la subcategoria"
          );
        });
      } else {
        // Modo registro - llamar saveUser
        this.subcategorieService.saveSubCategorie(subcategorieData).subscribe((res) => {
          this.handleSubmitResponse(
            res,
            "Subcategoria registrada exitosamente",
            "Error al registrar la subcategoria"
          );
        });
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.subcategorieForm.controls).forEach((key) => {
        this.subcategorieForm.get(key)?.markAsTouched();
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
      this.reloadSubcategoriesAndUpdateSearch();
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

  private reloadSubcategoriesAndUpdateSearch(): void {
    this.subcategorieService.getSubCategorie().subscribe((res) => {
      if ("data" in res) {
        // Actualizar la lista completa de usuarios
        this.allSubcategories = res.data;

        // Actualizar los resultados de búsqueda basándose en el término actual
        this.performSearch();

        console.log(
          "Lista de subcategorias actualizada:",
          this.allSubcategories.length,
          "subcategorias"
        );
        console.log(
          "Resultados de búsqueda actualizados:",
          this.searchResults.length,
          "resultados"
        );
      }
      if ("error" in res) {
        console.error("Error al recargar subcategorias:", res.error);
        // No mostrar alert aquí para no molestar al usuario después de una operación exitosa
      }
    });
  }

  private cancelEdit(): void {
    // Cancelar el modo de edición y volver a registro
    this.isEditMode = false;
    this.currentSubcategoriaId = null;
    this.subcategorieForm.patchValue({
      accion: "registrar",
    });

    // Limpiar el formulario pero mantener los datos para que el usuario pueda corregir
    // Solo limpiar el ID para evitar confusión
    this.subcategorieForm.patchValue({
      usuario_id: null,
    });
  }

  onReset(): void {
    this.subcategorieForm.reset();
    this.subcategorieForm.patchValue({
      accion: "registrar",
    });
    this.isEditMode = false;
    this.currentSubcategoriaId = null;
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
    this.searchResults = [...this.allSubcategories];
  }

  refreshUsersList(): void {
    console.log("Refrescando lista de subcategorias manualmente...");
    this.reloadSubcategoriesAndUpdateSearch();
  }

  onCancel(): void {
    this.router.navigate(["/subcategories"]);
  }

  editUser(subcategorie: Subcategorie): void {
    // Configurar modo de edición
    this.isEditMode = true;
    this.currentSubcategoriaId = subcategorie.subcategoria_id || null;

    // Llenar el formulario con los datos del usuario seleccionado
    this.subcategorieForm.patchValue({
      subcategoria_id: subcategorie.subcategoria_id,
      subcategoria_nombre: subcategorie.subcategoria_nombre,
      subcategoria_cantidad_productos: subcategorie.subcategoria_cantidad_productos,
      subcategoria_estado: subcategorie.subcategoria_estado,
      subcategoria_categoria: subcategorie.subcategoria_categoria,
      accion: "editar", // Cambiar la acción a editar
    });
    // Scroll hacia el formulario
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  deleteUser(SubcategorieId: number): void {
    if (confirm("¿Está seguro de que desea eliminar esta subcategoria?")) {
      this.subcategorieService.deleteSubcategorie(SubcategorieId).subscribe((res) => {
        if ("message" in res) {
          console.log("Subcategoria eliminada:", res.message);
          alert("Subcategoria Eliminada exitosamente");

          // Recargar usuarios y actualizar búsqueda
          this.reloadSubcategoriesAndUpdateSearch();
        }
        if ("error" in res) {
          console.error(res.error || "Error desconocido al eliminar subcategoria");
          alert(res.error || "Error al eliminar subcategoria");
        }
      });
    }
  }

  getEstadoLabel(estadoValue: string): string {
    const estado = this.estados.find((e) => e.value === estadoValue);
    return estado ? estado.label : "Desconocido";
  }

  getSubmitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode ? "Actualizando..." : "Guardando...";
    }
    return this.isEditMode ? "Actualizar Subcategoria" : "Guardar Subcategoria";
  }

  getFormTitle(): string {
    return this.isEditMode ? "Editar Subcategoria" : "Registro de Subcategoria";
  }

  getFormSubtitle(): string {
    return this.isEditMode
      ? "Modifique los datos de la subcategoria seleccionada"
      : "Complete el formulario para registrar una nueva subcategoria";
  }

  getResetButtonText(): string {
    return this.isEditMode ? "Cancelar Edición" : "Limpiar Formulario";
  }

  getResetButtonIcon(): string {
    return this.isEditMode ? "cancel" : "refresh";
  }
}

