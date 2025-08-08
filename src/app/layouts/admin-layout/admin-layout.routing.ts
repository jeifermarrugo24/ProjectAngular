import { Routes } from "@angular/router";

import { DashboardComponent } from "../../dashboard/dashboard.component";
import { UsersComponent } from "../../users/users.component";
import { CategoriesComponent } from "../../categories/categories.component";
import { ProductsComponent } from "../../products/products.component";
import { SubcategoriesComponent } from "../../subcategories/subcategories.component";
import { RegistrarComponent as UserRegistrarComponent } from "../../users/registrar/registrar.component";
import { RegistrarCategoriaComponent } from "../../categories/registrar/registrar.component";
import { RegistrarSubcategoriaComponent } from "../../subcategories/registrar/registrar.component";
import { RegistrarProductsComponent } from "../../products/registrar-products/registrar-products.component";
import { PermisosComponent } from "../../permisos/permisos.component";
import { MenusComponent } from "../../menus/menus.component";
import { RegistrarMenuComponent } from "../../menus/registrar/registrar.component";
import { UserProfileComponent } from "../../user-profile/user-profile.component";

export const AdminLayoutRoutes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent },
  { path: "user-profile", component: UserProfileComponent },
  { path: "users", component: UsersComponent },
  { path: "users/registrar", component: UserRegistrarComponent },
  { path: "categories", component: CategoriesComponent },
  { path: "categories/registrar", component: RegistrarCategoriaComponent },
  { path: "subcategories", component: SubcategoriesComponent },
  {
    path: "subcategories/registrar",
    component: RegistrarSubcategoriaComponent,
  },
  { path: "products", component: ProductsComponent },
  {
    path: "products/registrar-products",
    component: RegistrarProductsComponent,
  },
  { path: "permisos", component: PermisosComponent },
  { path: "menus", component: MenusComponent },
  { path: "menus/registrar", component: RegistrarMenuComponent },
];
