import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { GeneralStatesModel } from "app/models/common.model";
import { Categories, EstadoInput } from "app/models/categories.model";
import { CategoriesService } from "app/services/categories/categories.service";

@Component({
  selector: 'app-registrar-categories',
  templateUrl: './registrar-categories.component.html',
  styleUrls: ['./registrar-categories.component.scss']
})
export class RegistrarCategoriesComponent implements OnInit {
  categoriesForm: FormGroup;
  searchTerm: string = "";
  searchResults: Categories[] = [];
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  currentCategoriaId: number | null = null;
  categoriesServices: CategoriesService;

  estados: EstadoInput[] = [
    { value: GeneralStatesModel.ACTIVO, label: "Activo", icon: "check_circle" },
    { value: GeneralStatesModel.INACTIVO, label: "Inactivo", icon: "cancel" },
  ];

  allCategories: Categories[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    categoriesServices: CategoriesService
  ) {
    this.createForm();
    this.categoriesServices = categoriesServices;
  }

  ngOnInit(): void {
    this.loadInitialCategories();
  }

  private loadInitialCategories(): void {
    this.categoriesServices.getCategories().subscribe((res) => {
      if ("data" in res) {
        this.allCategories = res.data;
        // Mostrar todos las categorias al inicio
        this.searchResults = [...this.allCategories];
        console.log("categorias cargadas inicialmente:", this.allCategories.length);
      }
      if ("error" in res) {
        alert(res.error || "Error desconocido al cargar categorias");
      }
    });
  }

  createForm(): void {
    this.categoriesForm = this.formBuilder.group({
      categoria_id: [null],
      categoria_nombre: ["", [Validators.required, Validators.minLength(2)]],
      categoria_estado: ["", [Validators.required, Validators.minLength(2)]],
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
      this.searchResults = [...this.allCategories];
      return;
    }

    if (this.searchTerm.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searchResults = this.allCategories.filter((categorie) => {
      const matchNombre = categorie.categoria_nombre
        ?.toLowerCase()
        .includes(this.searchTerm.toLowerCase());

      return matchNombre;
    });

    console.log(
      `Búsqueda realizada: "${this.searchTerm}" - ${this.searchResults.length} resultados encontrados`
    );
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoriesForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async onSubmit(): Promise<void> {
    if (this.categoriesForm.valid) {
      this.isSubmitting = true;

      const categoriesData: Categories = this.categoriesForm.value;
      const isEditing = this.isEditMode && this.currentCategoriaId;

      console.log(
        `${isEditing ? "Editando" : "Registrando"} categoria:`,
        categoriesData
      );

      if (isEditing) {
        // Modo edición - llamar updateUser
        this.categoriesServices.updateCategories(categoriesData).subscribe((res) => {
          this.handleSubmitResponse(
            res,
            "Categoria actualizada exitosamente",
            "Error al actualizar la categoria"
          );
        });
      } else {
        // Modo registro - llamar saveUser
        this.categoriesServices.saveCategories(categoriesData).subscribe((res) => {
          this.handleSubmitResponse(
            res,
            "Categoria registrada exitosamente",
            "Error al registrar la categoria"
          );
        });
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.categoriesForm.controls).forEach((key) => {
        this.categoriesForm.get(key)?.markAsTouched();
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
      // Recargar la lista de categorias después de guardar/actualizar
      this.reloadCategoriesAndUpdateSearch();
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

  private reloadCategoriesAndUpdateSearch(): void {
    this.categoriesServices.getCategories().subscribe((res) => {
      if ("data" in res) {
        // Actualizar la lista completa de categorias
        this.allCategories = res.data;

        // Actualizar los resultados de búsqueda basándose en el término actual
        this.performSearch();

        console.log(
          "Lista de categorias actualizada:",
          this.allCategories.length,
          "categorias"
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
    this.currentCategoriaId = null;
    this.categoriesForm.patchValue({
      accion: "registrar",
    });

    // Limpiar el formulario pero mantener los datos de la categoria pueda corregir
    // Solo limpiar el ID para evitar confusión
    this.categoriesForm.patchValue({
      categoria_id: null,
    });
  }

  onReset(): void {
    this.categoriesForm.reset();
    this.categoriesForm.patchValue({
      accion: "registrar",
    });
    this.isEditMode = false;
    this.currentCategoriaId = null;
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
    // Mantener todos las categorias visibles después del reset
    this.searchResults = [...this.allCategories];
  }

  refreshUsersList(): void {
    console.log("Refrescando lista de categorias manualmente...");
    this.reloadCategoriesAndUpdateSearch();
  }

  onCancel(): void {
    this.router.navigate(["/categories"]);
  }

  editCategories(categorie: Categories): void {
      // Configurar modo de edición
    this.isEditMode = true;
    this.currentCategoriaId = categorie.categoria_id || null;

    // Llenar el formulario con los datos de la categoria seleccionado
    this.categoriesForm.patchValue({
      categoria_id: categorie.categoria_id,
      categoria_nombre: categorie.categoria_nombre, // Asegurarse de que el valor sea un string
      categoria_estado: categorie.categoria_estado,
      accion: "editar",
    });

    // Scroll hacia el formulario
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  deleteCategories(categoriaId: number): void {
    if (confirm("¿Está seguro de que desea eliminar esta categoria?")) {
      this.categoriesServices.deleteCategories(categoriaId).subscribe((res) => {
        if ("message" in res) {
          console.log("categoria eliminada:", res.message);
          alert("Categoria eliminada exitosamente");

          // Recargar categoria y actualizar búsqueda
          this.reloadCategoriesAndUpdateSearch();
        }
        if ("error" in res) {
          console.error(res.error || "Error desconocido al eliminar la categoria");
          alert(res.error || "Error al eliminar la categoria");
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
    return this.isEditMode ? "Actualizar categoria" : "Guardar categoria";
  }

  getFormTitle(): string {
    return this.isEditMode ? "Editar Categoria" : "Registro de Categoria";
  }

  getFormSubtitle(): string {
    return this.isEditMode
      ? "Modifique los datos de la categoria seleccionada"
      : "Complete el formulario para registrar una nueva categoria";
  }

  getResetButtonText(): string {
    return this.isEditMode ? "Cancelar Edición" : "Limpiar Formulario";
  }

  getResetButtonIcon(): string {
    return this.isEditMode ? "cancel" : "refresh";
  }

}
