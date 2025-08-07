import { Routes } from "@angular/router";

import { DashboardComponent } from "../../dashboard/dashboard.component";
import { UsersComponent } from "../../users/users.component";
import { CategoriesComponent } from "../../categories/categories.component";
import { ProductsComponent } from "../../products/products.component";
import { RegistrarComponent as UserRegistrarComponent } from "../../users/registrar/registrar.component";
import { MenusComponent } from "app/menus/menus.component";

export const AdminLayoutRoutes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent },
  { path: "users", component: UsersComponent },
  { path: "users/registrar", component: UserRegistrarComponent },
  { path: "categories", component: CategoriesComponent },
  { path: "products", component: ProductsComponent },
  { path: "menus", component: DashboardComponent },
  { path: "roles", component: DashboardComponent },
  { path: "permisos", component: DashboardComponent },
  { path: "menus", component: MenusComponent },
  { path: "menus/registrar", component: MenusComponent },
];
