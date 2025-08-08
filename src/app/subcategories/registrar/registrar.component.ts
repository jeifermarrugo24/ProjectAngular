import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { SubcategorieService } from "app/services/subcategories/subcategories.service";
import { CategoriesService } from "app/services/categories/categories.service";

interface Subcategoria {
  subcategoria_id?: number;
  subcategoria_nombre: string;
  subcategoria_cantidad_productos: number;
  subcategoria_estado: string;
  subcategoria_categoria: number;
}

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
  selector: "app-registrar-subcategoria",
  templateUrl: "./registrar.component.html",
  styleUrls: ["./registrar.component.scss"],
})
export class RegistrarSubcategoriaComponent implements OnInit {
  subcategoriaForm: FormGroup;
  searchTerm: string = "";
  searchResults: Subcategoria[] = [];
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  currentSubcategoriaId: number | null = null;

  estados: EstadoInput[] = [
    { value: "A", label: "Activo", icon: "check_circle" },
    { value: "I", label: "Inactivo", icon: "cancel" },
  ];

  allSubcategorias: Subcategoria[] = [];
  categoriasList: Categoria[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private subcategoriesService: SubcategorieService,
    private categoriesService: CategoriesService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    // Cargar subcategorías y categorías en paralelo
    forkJoin({
      subcategorias: this.subcategoriesService.getSubCategorie(),
      categorias: this.categoriesService.getCategories(),
    }).subscribe({
      next: (results) => {
        console.log("Resultados completos:", results);

        // Procesar subcategorías
        if ("data" in results.subcategorias) {
          this.allSubcategorias = results.subcategorias.data;
          this.searchResults = [...this.allSubcategorias];
          console.log("Subcategorías cargadas:", this.allSubcategorias.length);
        }
        if ("error" in results.subcategorias) {
          console.error(
            "Error al cargar subcategorías:",
            results.subcategorias.error
          );
        }

        // Procesar categorías
        if ("data" in results.categorias) {
          this.categoriasList = results.categorias.data.filter(
            (cat) =>
              cat.categoria_estado === "Activo" || cat.categoria_estado === "A"
          );
          console.log("Categorías cargadas:", this.categoriasList.length);
          console.log("Datos de categorías:", this.categoriasList);
        }
        if ("error" in results.categorias) {
          console.error(
            "Error al cargar categorías:",
            results.categorias.error
          );
        }
      },
      error: (error) => {
        console.error("Error al cargar datos iniciales:", error);
        alert("Error al cargar los datos iniciales");
      },
    });
  }

  createForm(): void {
    this.subcategoriaForm = this.formBuilder.group({
      subcategoria_id: [null],
      subcategoria_nombre: ["", [Validators.required, Validators.minLength(3)]],
      subcategoria_cantidad_productos: [
        0,
        [Validators.required, Validators.min(0)],
      ],
      subcategoria_estado: ["", Validators.required],
      subcategoria_categoria: ["", Validators.required],
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
      this.searchResults = [...this.allSubcategorias];
      return;
    }

    if (this.searchTerm.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searchResults = this.allSubcategorias.filter((subcategoria) => {
      const matchNombre = subcategoria.subcategoria_nombre
        ?.toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      const matchEstado = subcategoria.subcategoria_estado
        ?.toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      const matchCategoria = this.getCategoryName(
        subcategoria.subcategoria_categoria
      )
        ?.toLowerCase()
        .includes(this.searchTerm.toLowerCase());

      return matchNombre || matchEstado || matchCategoria;
    });

    console.log(
      `Búsqueda realizada: "${this.searchTerm}" - ${this.searchResults.length} resultados`
    );
  }

  clearSearch(): void {
    this.searchTerm = "";
    this.searchResults = [...this.allSubcategorias];
  }

  refreshSubcategoriasList(): void {
    console.log("Refrescando lista de subcategorías...");
    this.loadInitialData();
  }

  onSubmit(): void {
    if (this.subcategoriaForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.subcategoriaForm.value;

      console.log("Datos del formulario:", formData);

      if (this.isEditMode) {
        // Modo edición
        formData.accion = "editar";
        this.subcategoriesService.updateSubcategorie(formData).subscribe({
          next: (response) => {
            console.log("Subcategoría actualizada:", response);
            alert("Subcategoría actualizada exitosamente");
            this.refreshSubcategoriasList();
            this.resetForm();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error("Error al actualizar subcategoría:", error);
            alert("Error al actualizar la subcategoría");
            this.isSubmitting = false;
          },
        });
      } else {
        // Modo creación
        this.subcategoriesService.saveSubCategorie(formData).subscribe({
          next: (response) => {
            console.log("Subcategoría guardada:", response);
            alert("Subcategoría registrada exitosamente");
            this.refreshSubcategoriasList();
            this.resetForm();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error("Error al guardar subcategoría:", error);
            alert("Error al registrar la subcategoría");
            this.isSubmitting = false;
          },
        });
      }
    } else {
      console.log("Formulario inválido");
      this.markFormGroupTouched();
    }
  }

  editSubcategoria(subcategoria: Subcategoria): void {
    console.log("Editando subcategoría:", subcategoria);
    this.isEditMode = true;
    this.currentSubcategoriaId = subcategoria.subcategoria_id || null;

    this.subcategoriaForm.patchValue({
      subcategoria_id: subcategoria.subcategoria_id,
      subcategoria_nombre: subcategoria.subcategoria_nombre,
      subcategoria_cantidad_productos:
        subcategoria.subcategoria_cantidad_productos,
      subcategoria_estado: subcategoria.subcategoria_estado,
      subcategoria_categoria: subcategoria.subcategoria_categoria,
      accion: "editar",
    });

    // Scroll hacia el formulario
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  deleteSubcategoria(subcategoriaId: number): void {
    if (confirm("¿Está seguro de que desea eliminar esta subcategoría?")) {
      this.subcategoriesService.deleteSubcategorie(subcategoriaId).subscribe({
        next: (response) => {
          console.log("Subcategoría eliminada:", response);
          alert("Subcategoría eliminada exitosamente");
          this.refreshSubcategoriasList();
        },
        error: (error) => {
          console.error("Error al eliminar subcategoría:", error);
          alert("Error al eliminar la subcategoría");
        },
      });
    }
  }

  onCancelEdit(): void {
    this.resetForm();
  }

  onCancel(): void {
    this.router.navigate(["/subcategories"]);
  }

  resetForm(): void {
    this.subcategoriaForm.reset();
    this.isEditMode = false;
    this.currentSubcategoriaId = null;
    this.subcategoriaForm.patchValue({
      subcategoria_cantidad_productos: 0,
      accion: "registrar",
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.subcategoriaForm.controls).forEach((key) => {
      const control = this.subcategoriaForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.subcategoriaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Método para obtener el nombre de la categoría por ID
  getCategoryName(categoriaId: number): string {
    const categoria = this.categoriasList.find(
      (cat) => cat.categoria_id === categoriaId
    );
    return categoria ? categoria.categoria_nombre : "N/A";
  }

  // Métodos para el template
  getFormTitle(): string {
    return this.isEditMode
      ? "Editar Subcategoría"
      : "Registrar Nueva Subcategoría";
  }

  getFormSubtitle(): string {
    return this.isEditMode
      ? "Modifique los datos de la subcategoría seleccionada"
      : "Complete la información para registrar una nueva subcategoría";
  }

  getSubmitButtonText(): string {
    return this.isEditMode
      ? "Actualizar Subcategoría"
      : "Registrar Subcategoría";
  }

  getResetButtonText(): string {
    return this.isEditMode ? "Cancelar Edición" : "Limpiar Formulario";
  }

  getResetButtonIcon(): string {
    return this.isEditMode ? "close" : "refresh";
  }
}
