import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Productos } from "app/models/products.model";
import { ProductsService } from "app/services/products/products.service";

@Component({
  selector: 'app-registrar-products',
  templateUrl: './registrar-products.component.html',
  styleUrls: ['./registrar-products.component.scss']
})
export class RegistrarProductsComponent implements OnInit {

  productsForm: FormGroup;
  searchTerm: string = "";
  searchResults: Productos[] = [];
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  currentProductId: number | null = null;
  productsService: ProductsService;

  allProducts: Productos[] = [];
  

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    productsService: ProductsService
  ) {
    this.createForm();
    this.productsService = productsService;
  }
  

  ngOnInit(): void {
    this.loadInitialProducts();
  }

  private loadInitialProducts(): void {
    this.productsService.getProducts().subscribe((res) => {
      if ("data" in res) {
        this.allProducts = res.data;
        // Mostrar todos los productos al inicio
        this.searchResults = [...this.allProducts];
        console.log("productos cargados inicialmente:", this.allProducts.length);
      }
      if ("error" in res) {
        alert(res.error || "Error desconocido al cargar los productos");
      }
    });
  }

  createForm(): void {
    this.productsForm = this.formBuilder.group({
      producto_id: [null],
      producto_nombre: ["", [Validators.required, Validators.minLength(2)]],
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
      // Si no hay término de búsqueda, mostrar todos los productos
      this.searchResults = [...this.allProducts];
      return;
    }

    if (this.searchTerm.length < 2) {
      this.searchResults = [];
      return;
    }

    this.searchResults = this.allProducts.filter((product) => {
      const matchNombre = product.producto_nombre
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      return matchNombre;
    });

    console.log(
      `Búsqueda realizada: "${this.searchTerm}" - ${this.searchResults.length} resultados encontrados`
    );
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productsForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async onSubmit(): Promise<void> {
    if (this.productsForm.valid) {
      this.isSubmitting = true;

      const productsData: Productos = this.productsForm.value;
      const isEditing = this.isEditMode && this.currentProductId;

      console.log(
        `${isEditing ? "Editando" : "Registrando"} producto:`,
        productsData
      );

      if (isEditing) {
        // Modo edición - llamar updateUser
        this.productsService.updateProducts(productsData).subscribe((res) => {
          this.handleSubmitResponse(
            res,
            "Producto actualizado exitosamente",
            "Error al actualizar el producto"
          );
        });
      } else {
        // Modo registro - llamar saveUser
        this.productsService.saveProducts(productsData).subscribe((res) => {
          this.handleSubmitResponse(
            res,
            "Categoria registrada exitosamente",
            "Error al registrar la categoria"
          );
        });
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.productsForm.controls).forEach((key) => {
        this.productsForm.get(key)?.markAsTouched();
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
      // Recargar la lista de productos después de guardar/actualizar
      this.reloadProductsAndUpdateSearch();
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

  private reloadProductsAndUpdateSearch(): void {
    this.productsService.getProducts().subscribe((res) => {
      if ("data" in res) {
        // Actualizar la lista completa de productos
        this.allProducts = res.data;

        // Actualizar los resultados de búsqueda basándose en el término actual
        this.performSearch();

        console.log(
          "Lista de productos actualizada:",
          this.allProducts.length,
          "productos"
        );
          
        console.log(
          "Resultados de búsqueda actualizados:",
          this.searchResults.length,
          "resultados"
        );
      }
      if ("error" in res) {
        console.error("Error al recargar productos:", res.error);
        // No mostrar alert aquí para no molestar al usuario después de una operación exitosa
      }
    });
  }

  private cancelEdit(): void {
    // Cancelar el modo de edición y volver a registro
    this.isEditMode = false;
    this.currentProductId = null;
    this.productsForm.patchValue({
      accion: "registrar",
    });
    // Limpiar el formulario pero mantener los datos del producto pueda corregir
    // Solo limpiar el ID para evitar confusión
    this.productsForm.patchValue({
      producto_id: null,
    });
  }
  
  onReset(): void {
    this.productsForm.reset();
    this.productsForm.patchValue({
      accion: "registrar",
    });
    this.isEditMode = false;
    this.currentProductId = null;
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
    // Mantener todos los productos visibles después del reset
    this.searchResults = [...this.allProducts];
  }

  refreshUsersList(): void {
    console.log("Refrescando lista de productos manualmente...");
    this.reloadProductsAndUpdateSearch();
  }

  onCancel(): void {
    this.router.navigate(["/products"]);
  }

  editProduct(product: Productos): void {
    this.isEditMode = true;
    this.currentProductId = product.producto_id || null;

    this.productsForm.patchValue({
      categoria_id: product.producto_id,
      producto_nombre: product.producto_nombre,
      accion: "editar",
    });

    // Scroll hacia el formulario
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  deleteProduct(productoId: number): void {
    if (confirm("¿Está seguro de que desea eliminar este producto?")) {
      this.productsService.deleteProducts(productoId).subscribe((res) => {
        if ("message" in res) {
          console.log("producto eliminado:", res.message);
          alert("Producto eliminado exitosamente");

          // Recargar categoria y actualizar búsqueda
          this.reloadProductsAndUpdateSearch();
        }

        if ("error" in res) {
          console.error(res.error || "Error al eliminar el producto");
          alert(res.error || "Error al eliminar el producto");
        }
      });
    }
  }

  getSubmitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode ? "Actualizando..." : "Guardando...";
    }
    return this.isEditMode ? "Actualizar Producto" : "Guardar Producto";
  }

  getFormTitle(): string {
    return this.isEditMode ? "Editar Producto" : "Registro de productos";
  }

  getFormSubtitle(): string {
    return this.isEditMode
      ? "Modifique los datos del producto seleccionado"
      : "Complete el formulario para registrar un nuevo producto";
  }

  getResetButtonText(): string {
    return this.isEditMode ? "Cancelar Edición" : "Limpiar Formulario";
  }

  getResetButtonIcon(): string {
    return this.isEditMode ? "cancel" : "refresh";
  }
}
          
