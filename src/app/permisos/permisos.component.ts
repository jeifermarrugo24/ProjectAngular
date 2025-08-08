import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PermisosService } from "../services/permisos/permisos.service";
import { AuthService } from "../services/auth/auth.service";
import { MenuTreeNode, PerfilOption } from "../models/permiso.model";

@Component({
  selector: "app-permisos",
  templateUrl: "./permisos.component.html",
  styleUrls: ["./permisos.component.scss"],
})
export class PermisosComponent implements OnInit {
  permisosForm: FormGroup;
  menuTree: MenuTreeNode[] = [];
  perfiles: PerfilOption[] = [
    { value: 1, label: "Administrador" },
    { value: 2, label: "Básico" },
  ];
  selectedPerfil: number | null = null;
  isLoading = false;
  isSaving = false;
  isAdmin = false;
  currentUserPerfil: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private permisosService: PermisosService,
    private authService: AuthService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.loadPerfiles();
    this.loadMenuTree();
  }

  loadPerfiles(): void {
    // Obtener el usuario actual para verificar permisos de administración
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && currentUser.usuario_perfil) {
      console.log("Usuario actual:", currentUser);

      this.currentUserPerfil = Number(currentUser.usuario_perfil);
      this.isAdmin = this.currentUserPerfil === 1;

      // Si el usuario es administrador (perfil 1), puede gestionar todos los perfiles
      // Si no, solo puede gestionar su propio perfil
      if (this.isAdmin) {
        // Es administrador, puede gestionar todos los perfiles
        this.perfiles = [
          { value: 1, label: "Administrador" },
          { value: 2, label: "Básico" },
        ];
      } else {
        // Solo puede gestionar su propio perfil
        this.perfiles = [
          {
            value: this.currentUserPerfil,
            label: this.getPerfilNombre(this.currentUserPerfil),
          },
        ];

        // Preseleccionar su propio perfil
        this.permisosForm.patchValue({
          perfil: this.currentUserPerfil.toString(),
        });
      }
    } else {
      console.warn("No hay usuario autenticado o sin perfil");
      // Fallback a perfiles básicos
      this.perfiles = [
        { value: 1, label: "Administrador" },
        { value: 2, label: "Básico" },
      ];
    }
  }

  createForm(): void {
    this.permisosForm = this.formBuilder.group({
      perfil: ["", [Validators.required]],
    });

    // Escuchar cambios en el perfil seleccionado
    this.permisosForm.get("perfil")?.valueChanges.subscribe((perfilId) => {
      if (perfilId) {
        this.selectedPerfil = parseInt(perfilId);
        this.loadMenuTreeWithPermissions(this.selectedPerfil);
      }
    });
  }

  loadMenuTree(): void {
    this.isLoading = true;

    // Por defecto cargar sin permisos para mostrar la estructura
    this.permisosService.getMenuTreeWithPermissions(0).subscribe({
      next: (tree) => {
        this.menuTree = tree;
        this.isLoading = false;
        console.log("Árbol de menús cargado:", tree);
      },
      error: (error) => {
        console.error("Error al cargar árbol de menús:", error);
        this.isLoading = false;
        alert("Error al cargar los menús");
      },
    });
  }

  loadMenuTreeWithPermissions(perfilId: number): void {
    this.isLoading = true;

    this.permisosService.getMenuTreeWithPermissions(perfilId).subscribe({
      next: (tree) => {
        this.menuTree = tree;
        this.isLoading = false;
        console.log(
          `Árbol de menús con permisos para perfil ${perfilId}:`,
          tree
        );
      },
      error: (error) => {
        console.error("Error al cargar árbol de menús con permisos:", error);
        this.isLoading = false;
        alert("Error al cargar los permisos del perfil");
      },
    });
  }

  toggleMenuPermission(node: MenuTreeNode): void {
    if (!this.selectedPerfil) {
      alert("Debe seleccionar un perfil primero");
      return;
    }

    node.hasPermission = !node.hasPermission;

    if (node.hasPermission) {
      // Agregar permiso
      this.permisosService
        .savePermiso({
          permiso_perfil: this.selectedPerfil,
          permiso_menu: node.menu_id,
        })
        .subscribe({
          next: (response) => {
            console.log("Permiso agregado:", response);

            // Si tiene hijos, también marcarlos (opcional)
            if (node.children && node.children.length > 0) {
              this.toggleChildrenPermissions(node.children, true);
            }
          },
          error: (error) => {
            console.error("Error al agregar permiso:", error);
            node.hasPermission = false; // Revertir en caso de error
            alert("Error al agregar el permiso");
          },
        });
    } else {
      // Remover permiso
      this.permisosService
        .deletePermisoByPerfilMenu(this.selectedPerfil, node.menu_id)
        .subscribe({
          next: (response) => {
            console.log("Permiso removido:", response);

            // Si tiene hijos, también desmarcarlos (opcional)
            if (node.children && node.children.length > 0) {
              this.toggleChildrenPermissions(node.children, false);
            }
          },
          error: (error) => {
            console.error("Error al remover permiso:", error);
            node.hasPermission = true; // Revertir en caso de error
            alert("Error al remover el permiso");
          },
        });
    }
  }

  toggleChildrenPermissions(
    children: MenuTreeNode[],
    hasPermission: boolean
  ): void {
    if (!this.selectedPerfil) return;

    children.forEach((child) => {
      if (child.hasPermission !== hasPermission) {
        child.hasPermission = hasPermission;

        if (hasPermission) {
          // Agregar permiso al hijo
          this.permisosService
            .savePermiso({
              permiso_perfil: this.selectedPerfil!,
              permiso_menu: child.menu_id,
            })
            .subscribe({
              next: (response) =>
                console.log(
                  `Permiso agregado a hijo ${child.menu_nombre}:`,
                  response
                ),
              error: (error) => {
                console.error(
                  `Error al agregar permiso a hijo ${child.menu_nombre}:`,
                  error
                );
                child.hasPermission = false;
              },
            });
        } else {
          // Remover permiso del hijo
          this.permisosService
            .deletePermisoByPerfilMenu(this.selectedPerfil!, child.menu_id)
            .subscribe({
              next: (response) =>
                console.log(
                  `Permiso removido de hijo ${child.menu_nombre}:`,
                  response
                ),
              error: (error) => {
                console.error(
                  `Error al remover permiso de hijo ${child.menu_nombre}:`,
                  error
                );
                child.hasPermission = true;
              },
            });
        }

        // Recursivamente para nietos
        if (child.children && child.children.length > 0) {
          this.toggleChildrenPermissions(child.children, hasPermission);
        }
      }
    });
  }

  toggleNodeExpansion(node: MenuTreeNode): void {
    node.isExpanded = !node.isExpanded;
  }

  saveAllPermissions(): void {
    if (!this.selectedPerfil) {
      alert("Debe seleccionar un perfil primero");
      return;
    }

    this.isSaving = true;

    // Recopilar todos los menús seleccionados
    const selectedMenuIds = this.getSelectedMenuIds(this.menuTree);

    console.log("Guardando permisos para perfil:", this.selectedPerfil);
    console.log("Menús seleccionados:", selectedMenuIds);

    // Primero eliminar todos los permisos existentes del perfil
    this.permisosService
      .deleteAllPermisosByPerfil(this.selectedPerfil)
      .subscribe({
        next: () => {
          // Luego guardar los nuevos permisos
          if (selectedMenuIds.length > 0) {
            this.permisosService
              .savePermisosForPerfil(this.selectedPerfil!, selectedMenuIds)
              .subscribe({
                next: (response) => {
                  console.log("Permisos guardados exitosamente:", response);
                  this.isSaving = false;
                  alert("Permisos guardados exitosamente");
                },
                error: (error) => {
                  console.error("Error al guardar permisos:", error);
                  this.isSaving = false;
                  alert("Error al guardar los permisos");
                },
              });
          } else {
            this.isSaving = false;
            alert("Permisos actualizados (todos removidos)");
          }
        },
        error: (error) => {
          console.error("Error al eliminar permisos existentes:", error);
          this.isSaving = false;
          alert("Error al actualizar los permisos");
        },
      });
  }

  private getSelectedMenuIds(nodes: MenuTreeNode[]): number[] {
    let selectedIds: number[] = [];

    nodes.forEach((node) => {
      if (node.hasPermission) {
        selectedIds.push(node.menu_id);
      }

      if (node.children && node.children.length > 0) {
        selectedIds = selectedIds.concat(
          this.getSelectedMenuIds(node.children)
        );
      }
    });

    return selectedIds;
  }

  resetPermissions(): void {
    if (!this.selectedPerfil) {
      alert("Debe seleccionar un perfil primero");
      return;
    }

    if (
      confirm(
        "¿Está seguro de que desea quitar todos los permisos de este perfil?"
      )
    ) {
      this.isSaving = true;

      this.permisosService
        .deleteAllPermisosByPerfil(this.selectedPerfil)
        .subscribe({
          next: () => {
            console.log("Todos los permisos eliminados");
            this.loadMenuTreeWithPermissions(this.selectedPerfil!);
            this.isSaving = false;
            alert("Todos los permisos han sido eliminados");
          },
          error: (error) => {
            console.error("Error al eliminar permisos:", error);
            this.isSaving = false;
            alert("Error al eliminar los permisos");
          },
        });
    }
  }

  getPerfilNombre(perfilId: number): string {
    const perfil = this.perfiles.find((p) => p.value === perfilId);
    if (perfil) {
      return perfil.label;
    }

    // Fallback para nombres comunes
    switch (perfilId) {
      case 1:
        return "Administrador";
      case 2:
        return "Básico";
      case 3:
        return "Usuario";
      default:
        return `Perfil ${perfilId}`;
    }
  }
}
