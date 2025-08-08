import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ProductsService } from "app/services/products/products.service";
import { CategoriesService } from "app/services/categories/categories.service";
import { SubcategorieService } from "app/services/subcategories/subcategories.service";
import { Categories } from "app/models/categories.model";
import { Subcategorie } from "app/models/subcategorie.model";

interface Producto {
  producto_id?: number;
  producto_nombre: string;
  producto_categoria: number;
  subcategorias_ids?: number[];
  categoria_nombre?: string;
  subcategorias_nombres?: string;
}

@Component({
  selector: "app-registrar-products",
  templateUrl: "./registrar-products.component.html",
  styleUrls: ["./registrar-products.component.scss"],
})
export class RegistrarProductsComponent implements OnInit {
  productsForm: FormGroup;
  searchTerm: string = "";
  searchResults: Producto[] = [];
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  currentProductId: number | null = null;

  allProducts: Producto[] = [];
  categorias: Categories[] = [];
  subcategorias: Subcategorie[] = [];
  filteredSubcategorias: Subcategorie[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private subcategoriesService: SubcategorieService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadInitialProducts();
    this.loadCategorias();
  }

  private loadInitialProducts(): void {
    this.productsService.getProducts().subscribe((res) => {
      if ("data" in res) {
        this.allProducts = res.data;
        this.searchResults = [...this.allProducts];
        console.log(
          "Productos cargados inicialmente:",
          this.allProducts.length
        );
      }
      if ("error" in res) {
        alert(res.error || "Error desconocido al cargar productos");
      }
    });
  }

  private loadCategorias(): void {
    console.log("Cargando categorías desde la API...");
    this.categoriesService.getCategories().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categorias = res.data.filter(
            (cat) =>
              cat.categoria_estado === "activo" || cat.categoria_estado === "A"
          );
          console.log("Categorías cargadas:", this.categorias.length);
        } else {
          console.error("Error en respuesta de categorías:", res);
          this.categorias = [];
        }
      },
      error: (error) => {
        console.error("Error al cargar categorías:", error);
        this.categorias = [];
        alert("Error al cargar las categorías. Por favor, recargue la página.");
      },
    });
  }

  createForm(): void {
    this.productsForm = this.formBuilder.group({
      producto_id: [null],
      producto_nombre: ["", [Validators.required, Validators.minLength(3)]],
      producto_categoria: ["", Validators.required],
      subcategorias_seleccionadas: [[]],
      accion: ["registrar"],
    });

    this.productsForm
      .get("producto_categoria")
      ?.valueChanges.subscribe((categoriaId) => {
        this.onCategoriaChange(categoriaId);
      });
  }

  onCategoriaChange(categoriaId: number): void {
    console.log("Categoría seleccionada:", categoriaId);

    if (categoriaId) {
      this.productsForm.get("subcategorias_seleccionadas")?.setValue([]);
      this.filteredSubcategorias = [];

      const consultaData = {
        subcategoria_categoria: categoriaId,
      };

      this.subcategoriesService.getSubCategorie(consultaData).subscribe({
        next: (res) => {
          console.log("Respuesta de subcategorías:", res);

          if (res.success && res.data) {
            this.filteredSubcategorias = res.data.filter(
              (sub) =>
                sub.subcategoria_categoria === Number(categoriaId) &&
                (sub.subcategoria_estado === "activo" ||
                  sub.subcategoria_estado === "A")
            );

            console.log(
              "Subcategorías filtradas para categoría",
              categoriaId,
              ":",
              this.filteredSubcategorias
            );
          } else {
            console.warn(
              "No se encontraron subcategorías o respuesta inválida:",
              res
            );
            this.filteredSubcategorias = [];
          }
        },
        error: (error) => {
          console.error("Error al cargar subcategorías:", error);
          this.filteredSubcategorias = [];
          alert("Error al cargar las subcategorías de esta categoría.");
        },
      });
    } else {
      this.filteredSubcategorias = [];
      this.productsForm.get("subcategorias_seleccionadas")?.setValue([]);
    }
  }

  onSubcategoriaChange(subcategoriaId: number, isChecked: boolean): void {
    const subcategoriasSeleccionadas =
      this.productsForm.get("subcategorias_seleccionadas")?.value || [];

    if (isChecked) {
      if (!subcategoriasSeleccionadas.includes(subcategoriaId)) {
        subcategoriasSeleccionadas.push(subcategoriaId);
      }
    } else {
      const index = subcategoriasSeleccionadas.indexOf(subcategoriaId);
      if (index > -1) {
        subcategoriasSeleccionadas.splice(index, 1);
      }
    }

    this.productsForm
      .get("subcategorias_seleccionadas")
      ?.setValue(subcategoriasSeleccionadas);
  }

  isSubcategoriaSelected(subcategoriaId: number): boolean {
    const subcategoriasSeleccionadas =
      this.productsForm.get("subcategorias_seleccionadas")?.value || [];
    return subcategoriasSeleccionadas.includes(subcategoriaId);
  }

  onSearch(event: any): void {
    const searchValue = event.target.value.toLowerCase();
    this.searchTerm = searchValue;
    this.performSearch();
  }

  performSearch(): void {
    if (this.searchTerm.length === 0) {
      this.searchResults = [...this.allProducts];
      console.log("Búsqueda vacía, mostrando todos los productos");
      return;
    }

    if (this.searchTerm.length >= 2) {
      const searchData = {
        producto_nombre: this.searchTerm,
      };

      this.productsService.getProducts(searchData).subscribe((res) => {
        if ("data" in res) {
          this.searchResults = res.data;
          console.log("Resultados de búsqueda:", this.searchResults.length);
        }
        if ("error" in res) {
          console.log("Error en búsqueda:", res.error);
          this.searchResults = [];
        }
      });
    } else {
      this.searchResults = [...this.allProducts];
    }
  }

  clearSearch(): void {
    this.searchTerm = "";
    this.searchResults = [...this.allProducts];
    console.log("Búsqueda limpiada, mostrando todos los productos");
  }

  resetForm(): void {
    this.productsForm.reset();
    this.productsForm.patchValue({
      accion: "registrar",
    });
    this.isEditMode = false;
    this.currentProductId = null;
    this.filteredSubcategorias = [];
  }

  cancelEdit(): void {
    this.resetForm();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productsForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getSubmitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode ? "Actualizando..." : "Guardando...";
    }
    return this.isEditMode ? "Actualizar Producto" : "Guardar Producto";
  }

  getFormTitle(): string {
    return this.isEditMode ? "Editar Producto" : "Registrar Producto";
  }

  getFormSubtitle(): string {
    return this.isEditMode
      ? "Modifica los datos del producto seleccionado"
      : "Completa la información para registrar un nuevo producto";
  }

  getResetButtonIcon(): string {
    return this.isEditMode ? "cancel" : "refresh";
  }

  getResetButtonText(): string {
    return this.isEditMode ? "Cancelar" : "Limpiar";
  }

  onSubmit(): void {
    if (this.productsForm.invalid) {
      Object.keys(this.productsForm.controls).forEach((key) => {
        this.productsForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const formData = {
      ...this.productsForm.value,
    };

    if (this.isEditMode) {
      this.updateProduct(formData);
    } else {
      this.saveProduct(formData);
    }
  }

  private saveProduct(productData: any): void {
    this.productsService.saveProducts(productData).subscribe(
      (response: any) => {
        console.log("Respuesta del servidor:", response);
        this.isSubmitting = false;

        if (response.success) {
          alert(response.message || "Producto guardado exitosamente");
          this.resetForm();
          this.loadInitialProducts();
        } else if (response.error) {
          alert("Error: " + response.error);
        } else {
          alert("Respuesta inesperada del servidor");
        }
      },
      (error) => {
        console.error("Error en la petición:", error);
        this.isSubmitting = false;
        alert("Error de conexión al guardar el producto");
      }
    );
  }

  private updateProduct(productData: any): void {
    productData.producto_id = this.currentProductId;
    this.productsService.updateProducts(productData).subscribe(
      (response: any) => {
        console.log("Respuesta del servidor:", response);
        this.isSubmitting = false;

        if (response.success) {
          alert(response.message || "Producto actualizado exitosamente");
          this.cancelEdit();
          this.loadInitialProducts();
        } else if (response.error) {
          alert("Error: " + response.error);
        } else {
          alert("Respuesta inesperada del servidor");
        }
      },
      (error) => {
        console.error("Error en la petición:", error);
        this.isSubmitting = false;
        alert("Error de conexión al actualizar el producto");
      }
    );
  }

  editProduct(producto: Producto): void {
    this.isEditMode = true;
    this.currentProductId = producto.producto_id || null;

    if (producto.producto_categoria) {
      this.onCategoriaChange(producto.producto_categoria);
    }

    this.productsForm.patchValue({
      producto_nombre: producto.producto_nombre,
      producto_categoria: producto.producto_categoria || "",
      subcategorias_seleccionadas: producto.subcategorias_ids || [],
      accion: "editar",
    });

    console.log("Editando producto:", producto);
  }

  deleteProduct(productId: number): void {
    if (!confirm("¿Está seguro de que desea eliminar este producto?")) {
      return;
    }

    this.productsService.deleteProducts(productId).subscribe(
      (response: any) => {
        console.log("Respuesta del servidor:", response);

        if (response.success) {
          alert(response.message || "Producto eliminado exitosamente");
          this.loadInitialProducts();
        } else if (response.error) {
          alert("Error: " + response.error);
        } else {
          alert("Respuesta inesperada del servidor");
        }
      },
      (error) => {
        console.error("Error en la petición:", error);
        alert("Error de conexión al eliminar el producto");
      }
    );
  }

  onCancelEdit(): void {
    this.cancelEdit();
  }

  onCancel(): void {
    this.router.navigate(["/products"]);
  }

  isMobileMenu() {
    return window.innerWidth <= 991;
  }
}
