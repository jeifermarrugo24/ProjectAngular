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
  producto_subcaegoria?: number;
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
    this.loadSubcategorias();
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
    this.categoriesService.getCategories().subscribe((res) => {
      if ("data" in res) {
        this.categorias = res.data.filter(
          (cat) => cat.categoria_estado === "A"
        );
        console.log("Categorías cargadas:", this.categorias.length);
      }
      if ("error" in res) {
        console.error("Error al cargar categorías:", res.error);
      }
    });
  }

  private loadSubcategorias(): void {
    this.subcategoriesService.getSubCategorie().subscribe((res) => {
      if ("data" in res) {
        this.subcategorias = res.data.filter(
          (sub) => sub.subcategoria_estado === "A"
        );
        console.log("Subcategorías cargadas:", this.subcategorias.length);
      }
      if ("error" in res) {
        console.error("Error al cargar subcategorías:", res.error);
      }
    });
  }

  createForm(): void {
    this.productsForm = this.formBuilder.group({
      producto_id: [null],
      producto_nombre: ["", [Validators.required, Validators.minLength(3)]],
      producto_categoria: ["", Validators.required],
      producto_subcaegoria: [""], // Opcional
      accion: ["registrar"],
    });

    // Escuchar cambios en la categoría para filtrar subcategorías
    this.productsForm
      .get("producto_categoria")
      ?.valueChanges.subscribe((categoriaId) => {
        this.onCategoriaChange(categoriaId);
      });
  }

  onCategoriaChange(categoriaId: number): void {
    if (categoriaId) {
      this.filteredSubcategorias = this.subcategorias.filter(
        (sub) => sub.subcategoria_categoria === Number(categoriaId)
      );
    } else {
      this.filteredSubcategorias = [];
    }

    // Limpiar la subcategoría seleccionada cuando cambia la categoría
    this.productsForm.get("producto_subcaegoria")?.setValue("");
  }

  onSearch(event: any): void {
    const searchValue = event.target.value.toLowerCase();
    this.searchTerm = searchValue;
    this.performSearch();
  }

  performSearch(): void {
    if (this.searchTerm.length === 0) {
      this.searchResults = [...this.allProducts];
      return;
    }

    if (this.searchTerm.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searchResults = this.allProducts.filter((producto) => {
      const matchNombre = producto.producto_nombre
        ?.toLowerCase()
        .includes(this.searchTerm.toLowerCase());

      return matchNombre;
    });

    console.log(
      `Búsqueda: "${this.searchTerm}" - Resultados:`,
      this.searchResults.length
    );
  }

  clearSearch(): void {
    this.searchTerm = "";
    this.searchResults = [...this.allProducts];
    console.log("Búsqueda limpiada, mostrando todos los productos");
  }

  refreshUsersList(): void {
    this.loadInitialProducts();
  }

  getFormTitle(): string {
    return this.isEditMode ? "Editar Producto" : "Registrar Producto";
  }

  getFormSubtitle(): string {
    return this.isEditMode
      ? "Modifica los datos del producto seleccionado"
      : "Complete el formulario para registrar un nuevo producto";
  }

  getSubmitButtonText(): string {
    return this.isEditMode ? "Actualizar Producto" : "Guardar Producto";
  }

  getResetButtonText(): string {
    return this.isEditMode ? "Cancelar Edición" : "Limpiar Formulario";
  }

  getResetButtonIcon(): string {
    return this.isEditMode ? "close" : "refresh";
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productsForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.productsForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.productsForm.value;

    console.log("Datos del formulario:", formData);

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

    this.productsForm.patchValue({
      producto_nombre: producto.producto_nombre,
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

  private cancelEdit(): void {
    this.isEditMode = false;
    this.currentProductId = null;
    this.resetForm();
  }

  private resetForm(): void {
    this.productsForm.reset();
    this.productsForm.patchValue({
      accion: "registrar",
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productsForm.controls).forEach((key) => {
      const control = this.productsForm.get(key);
      control?.markAsTouched();
    });
  }
}
