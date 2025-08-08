import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MenusService } from "../../services/menus/menus.service";
import { Menu } from "../../models/menu.model";

interface MenuDisplay extends Menu {
  menu_tipo_nombre?: string;
}

@Component({
  selector: "app-registrar-menu",
  templateUrl: "./registrar.component.html",
  styleUrls: ["./registrar.component.scss"],
})
export class RegistrarMenuComponent implements OnInit {
  menuForm: FormGroup;
  searchTerm: string = "";
  searchResults: MenuDisplay[] = [];
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  currentMenuId: number | null = null;

  allMenus: MenuDisplay[] = [];
  menusParent: Menu[] = []; // Para el select de menú padre

  tiposMenu = [
    { value: "principal", label: "Principal" },
    { value: "submenu", label: "Submenú" },
    { value: "funcional", label: "Funcional" },
    { value: "configuracion", label: "Configuración" },
    { value: "reporte", label: "Reporte" },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private menusService: MenusService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadInitialMenus();
    this.loadParentMenus();
  }

  private createForm(): void {
    this.menuForm = this.formBuilder.group({
      menu_id: [null],
      menu_nombre: ["", [Validators.required, Validators.minLength(3)]],
      menu_tipo: ["principal", Validators.required],
      menu_id_padre: [null],
      menu_path: ["", [Validators.required]],
      menu_descripcion: [""],
      menu_icono: [""],
      menu_orden: [1, [Validators.min(1)]],
      accion: ["registrar"],
    });

    // Escuchar cambios en el tipo de menú
    this.menuForm.get("menu_tipo")?.valueChanges.subscribe((tipo) => {
      this.onTipoMenuChange(tipo);
    });
  }

  private loadInitialMenus(): void {
    this.menusService.getMenus().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.allMenus = res.data.map((menu) => ({
            ...menu,
            menu_tipo_nombre: this.getTipoMenuLabel(menu.menu_tipo),
          }));
          this.searchResults = [...this.allMenus];
          console.log("Menús cargados inicialmente:", this.allMenus.length);
        }
      },
      error: (error) => {
        console.error("Error al cargar menús:", error);
        this.allMenus = [];
        this.searchResults = [];
      },
    });
  }

  private loadParentMenus(): void {
    // Cargar menús que pueden ser padres (principales o de configuración)
    this.menusService.getMenus({ menu_tipo: "principal" }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.menusParent = res.data;
          console.log("Menús padre cargados:", this.menusParent.length);
        }
      },
      error: (error) => {
        console.error("Error al cargar menús padre:", error);
        this.menusParent = [];
      },
    });
  }

  private onTipoMenuChange(tipo: string): void {
    const menuIdPadreControl = this.menuForm.get("menu_id_padre");

    if (tipo === "submenu") {
      // Si es submenú, hacer obligatorio el menú padre
      menuIdPadreControl?.setValidators([Validators.required]);
    } else {
      // Si no es submenú, no es obligatorio el menú padre
      menuIdPadreControl?.clearValidators();
      menuIdPadreControl?.setValue(null);
    }

    menuIdPadreControl?.updateValueAndValidity();
  }

  onSearch(event: any): void {
    const searchValue = event.target.value.toLowerCase();
    this.searchTerm = searchValue;
    this.performSearch();
  }

  performSearch(): void {
    if (this.searchTerm.length === 0) {
      this.searchResults = [...this.allMenus];
      return;
    }

    if (this.searchTerm.length >= 2) {
      this.searchResults = this.allMenus.filter(
        (menu) =>
          menu.menu_nombre.toLowerCase().includes(this.searchTerm) ||
          menu.menu_tipo.toLowerCase().includes(this.searchTerm) ||
          (menu.menu_descripcion &&
            menu.menu_descripcion.toLowerCase().includes(this.searchTerm))
      );
      console.log("Resultados de búsqueda:", this.searchResults.length);
    } else {
      this.searchResults = [...this.allMenus];
    }
  }

  clearSearch(): void {
    this.searchTerm = "";
    this.searchResults = [...this.allMenus];
    console.log("Búsqueda limpiada, mostrando todos los menús");
  }

  resetForm(): void {
    this.menuForm.reset();
    this.menuForm.patchValue({
      menu_tipo: "principal",
      menu_orden: 1,
      accion: "registrar",
    });
    this.isEditMode = false;
    this.currentMenuId = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.menuForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.menuForm.get(fieldName);
    if (field?.errors) {
      if (field.errors["required"])
        return `${this.getFieldLabel(fieldName)} es requerido`;
      if (field.errors["minlength"]) {
        const minLength = field.errors["minlength"].requiredLength;
        return `Mínimo ${minLength} caracteres`;
      }
      if (field.errors["min"]) return "El valor debe ser mayor a 0";
    }
    return "";
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      menu_nombre: "Nombre del menú",
      menu_tipo: "Tipo de menú",
      menu_id_padre: "Menú padre",
      menu_path: "Ruta/URL",
      menu_descripcion: "Descripción",
      menu_icono: "Icono",
      menu_orden: "Orden",
    };
    return labels[fieldName] || fieldName;
  }

  getTipoMenuLabel(tipo: string): string {
    const tipoObj = this.tiposMenu.find((t) => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  getFormTitle(): string {
    return this.isEditMode ? "Editar Menú" : "Registrar Menú";
  }

  getFormSubtitle(): string {
    return this.isEditMode
      ? "Modifica los datos del menú seleccionado"
      : "Completa la información para registrar un nuevo menú";
  }

  getSubmitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode ? "Actualizando..." : "Guardando...";
    }
    return this.isEditMode ? "Actualizar Menú" : "Guardar Menú";
  }

  getResetButtonIcon(): string {
    return this.isEditMode ? "cancel" : "refresh";
  }

  getResetButtonText(): string {
    return this.isEditMode ? "Cancelar" : "Limpiar";
  }

  onSubmit(): void {
    if (this.menuForm.invalid) {
      Object.keys(this.menuForm.controls).forEach((key) => {
        this.menuForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const formData = {
      ...this.menuForm.value,
    };

    // Limpiar campos vacíos para evitar problemas en el backend
    if (!formData.menu_id_padre) {
      delete formData.menu_id_padre;
    }
    if (!formData.menu_descripcion) {
      delete formData.menu_descripcion;
    }
    if (!formData.menu_icono) {
      delete formData.menu_icono;
    }

    if (this.isEditMode) {
      this.updateMenu(formData);
    } else {
      this.saveMenu(formData);
    }
  }

  private saveMenu(menuData: any): void {
    this.menusService.saveMenu(menuData).subscribe({
      next: (response: any) => {
        console.log("Respuesta del servidor:", response);
        this.isSubmitting = false;

        if (response.success) {
          alert(response.message || "Menú guardado exitosamente");
          this.resetForm();
          this.loadInitialMenus();
          this.loadParentMenus();
        } else {
          alert("Error: " + (response.error || "Error desconocido"));
        }
      },
      error: (error) => {
        console.error("Error en la petición:", error);
        this.isSubmitting = false;
        alert("Error de conexión al guardar el menú");
      },
    });
  }

  private updateMenu(menuData: any): void {
    menuData.menu_id = this.currentMenuId;
    this.menusService.updateMenu(menuData).subscribe({
      next: (response: any) => {
        console.log("Respuesta del servidor:", response);
        this.isSubmitting = false;

        if (response.success) {
          alert(response.message || "Menú actualizado exitosamente");
          this.cancelEdit();
          this.loadInitialMenus();
          this.loadParentMenus();
        } else {
          alert("Error: " + (response.error || "Error desconocido"));
        }
      },
      error: (error) => {
        console.error("Error en la petición:", error);
        this.isSubmitting = false;
        alert("Error de conexión al actualizar el menú");
      },
    });
  }

  editMenu(menu: MenuDisplay): void {
    this.isEditMode = true;
    this.currentMenuId = menu.menu_id || null;

    this.menuForm.patchValue({
      menu_nombre: menu.menu_nombre,
      menu_tipo: menu.menu_tipo || "principal",
      menu_id_padre: menu.menu_id_padre || null,
      menu_path: menu.menu_path || "",
      menu_descripcion: menu.menu_descripcion || "",
      menu_icono: menu.menu_icono || "",
      menu_orden: menu.menu_orden || 1,
      accion: "editar",
    });

    console.log("Editando menú:", menu);
  }

  deleteMenu(menuId: number): void {
    if (!confirm("¿Está seguro de que desea eliminar este menú?")) {
      return;
    }

    this.menusService.deleteMenu(menuId).subscribe({
      next: (response: any) => {
        console.log("Respuesta del servidor:", response);

        if (response.success) {
          alert(response.message || "Menú eliminado exitosamente");
          this.loadInitialMenus();
          this.loadParentMenus();
        } else {
          alert("Error: " + (response.error || "Error desconocido"));
        }
      },
      error: (error) => {
        console.error("Error en la petición:", error);
        alert("Error de conexión al eliminar el menú");
      },
    });
  }

  onCancel(): void {
    this.router.navigate(["/menus"]);
  }

  isMobileMenu(): boolean {
    return window.innerWidth <= 991;
  }

  trackByMenuId(index: number, menu: MenuDisplay): number {
    return menu.menu_id || index;
  }
}
