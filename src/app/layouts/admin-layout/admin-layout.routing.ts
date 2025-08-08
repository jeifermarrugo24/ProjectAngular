import { Routes } from "@angular/router";

import { DashboardComponent } from "../../dashboard/dashboard.component";
import { UsersComponent } from "../../users/users.component";
import { CategoriesComponent } from "../../categories/categories.component";
import { ProductsComponent } from "../../products/products.component";
import { SubcategoriesComponent } from "../../subcategories/subcategories.component";
import { RegistrarComponent as UserRegistrarComponent } from "../../users/registrar/registrar.component";
import { RegistrarCategoriaComponent } from "../../categories/registrar/registrar.component";
import { RegistrarSubcategoriaComponent } from "../../subcategories/registrar/registrar.component";
import { PermisosComponent } from "../../permisos/permisos.component";
import { MenusComponent } from "../../menus/menus.component";

export const AdminLayoutRoutes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent },
  { path: "users", component: UsersComponent },
  { path: "users/registrar", component: UserRegistrarComponent },
  { path: "categories", component: CategoriesComponent },
  { path: "categories/registrar", component: RegistrarCategoriaComponent },
  { path: "subcategories", component: SubcategoriesComponent },
  {
    path: "subcategories/registrar",
    component: RegistrarSubcategoriaComponent,
  },
  { path: "subcategories", component: SubcategoriesComponent },
  { path: "products", component: ProductsComponent },
  { path: "permisos", component: PermisosComponent },
  { path: "menus", component: MenusComponent },
  { path: "menus/registrar", component: MenusComponent },
];
