import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { GeneralStatesModel } from "app/models/common.model";
import { CategoriesService } from "app/services/categories/categories.service";

interface Categoria {
  categoria_id?: number;
  categoria_nombre: string;
  categoria_estado: string;
}

interface EstadoInput {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: "app-registrar-categoria",
  templateUrl: "./registrar.component.html",
  styleUrls: ["./registrar.component.scss"],
})
export class RegistrarCategoriaComponent implements OnInit {
  categoriaForm: FormGroup;
  searchTerm: string = "";
  searchResults: Categoria[] = [];
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  currentCategoriaId: number | null = null;

  estados: EstadoInput[] = [
    { value: "A", label: "Activo", icon: "check_circle" },
    { value: "I", label: "Inactivo", icon: "cancel" },
  ];

  allCategorias: Categoria[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private categoriesService: CategoriesService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadInitialCategorias();
  }

  private loadInitialCategorias(): void {
    this.categoriesService.getCategories().subscribe((res) => {
      if ("data" in res) {
        this.allCategorias = res.data;
        this.searchResults = [...this.allCategorias];
        console.log(
          "Categorías cargadas inicialmente:",
          this.allCategorias.length
        );
      }
      if ("error" in res) {
        alert(res.error || "Error desconocido al cargar categorías");
      }
    });
  }

  createForm(): void {
    this.categoriaForm = this.formBuilder.group({
      categoria_id: [null],
      categoria_nombre: ["", [Validators.required, Validators.minLength(3)]],
      categoria_estado: ["", Validators.required],
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
      this.searchResults = [...this.allCategorias];
      return;
    }

    if (this.searchTerm.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searchResults = this.allCategorias.filter((categoria) => {
      const matchNombre = categoria.categoria_nombre
        ?.toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      const matchEstado = categoria.categoria_estado
        ?.toLowerCase()
        .includes(this.searchTerm.toLowerCase());

      return matchNombre || matchEstado;
    });

    console.log(
      `Búsqueda realizada: "${this.searchTerm}" - ${this.searchResults.length} resultados`
    );
  }

  clearSearch(): void {
    this.searchTerm = "";
    this.searchResults = [...this.allCategorias];
  }

  refreshCategoriasList(): void {
    console.log("Refrescando lista de categorías...");
    this.loadInitialCategorias();
  }

  onSubmit(): void {
    if (this.categoriaForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.categoriaForm.value;

      console.log("Datos del formulario:", formData);

      if (this.isEditMode) {
        // Modo edición
        formData.accion = "editar";
        this.categoriesService.updateCategories(formData).subscribe({
          next: (response) => {
            console.log("Categoría actualizada:", response);
            alert("Categoría actualizada exitosamente");
            this.refreshCategoriasList();
            this.resetForm();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error("Error al actualizar categoría:", error);
            alert("Error al actualizar la categoría");
            this.isSubmitting = false;
          },
        });
      } else {
        // Modo creación
        this.categoriesService.saveCategories(formData).subscribe({
          next: (response) => {
            console.log("Categoría guardada:", response);
            alert("Categoría registrada exitosamente");
            this.refreshCategoriasList();
            this.resetForm();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error("Error al guardar categoría:", error);
            alert("Error al registrar la categoría");
            this.isSubmitting = false;
          },
        });
      }
    } else {
      console.log("Formulario inválido");
      this.markFormGroupTouched();
    }
  }

  editCategoria(categoria: Categoria): void {
    console.log("Editando categoría:", categoria);
    this.isEditMode = true;
    this.currentCategoriaId = categoria.categoria_id || null;

    this.categoriaForm.patchValue({
      categoria_id: categoria.categoria_id,
      categoria_nombre: categoria.categoria_nombre,
      categoria_estado: categoria.categoria_estado,
      accion: "editar",
    });

    // Scroll hacia el formulario
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  deleteCategoria(categoriaId: number): void {
    if (confirm("¿Está seguro de que desea eliminar esta categoría?")) {
      this.categoriesService.deleteCategories(categoriaId).subscribe({
        next: (response) => {
          console.log("Categoría eliminada:", response);
          alert("Categoría eliminada exitosamente");
          this.refreshCategoriasList();
        },
        error: (error) => {
          console.error("Error al eliminar categoría:", error);
          alert("Error al eliminar la categoría");
        },
      });
    }
  }

  onCancelEdit(): void {
    this.resetForm();
  }

  onCancel(): void {
    this.router.navigate(["/categories"]);
  }

  resetForm(): void {
    this.categoriaForm.reset();
    this.isEditMode = false;
    this.currentCategoriaId = null;
    this.categoriaForm.patchValue({
      accion: "registrar",
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoriaForm.controls).forEach((key) => {
      const control = this.categoriaForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoriaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Métodos para el template
  getFormTitle(): string {
    return this.isEditMode ? "Editar Categoría" : "Registrar Nueva Categoría";
  }

  getFormSubtitle(): string {
    return this.isEditMode
      ? "Modifique los datos de la categoría seleccionada"
      : "Complete la información para registrar una nueva categoría";
  }

  getSubmitButtonText(): string {
    return this.isEditMode ? "Actualizar Categoría" : "Registrar Categoría";
  }

  getResetButtonText(): string {
    return this.isEditMode ? "Cancelar Edición" : "Limpiar Formulario";
  }

  getResetButtonIcon(): string {
    return this.isEditMode ? "close" : "refresh";
  }
}
