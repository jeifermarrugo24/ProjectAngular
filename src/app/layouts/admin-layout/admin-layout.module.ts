import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AdminLayoutRoutes } from "./admin-layout.routing";
import { DashboardComponent } from "../../dashboard/dashboard.component";
import { UserProfileComponent } from "../../user-profile/user-profile.component";
import { UsersComponent } from "../../users/users.component";
import { RegistrarComponent } from "../../users/registrar/registrar.component";
import { RegistrarCategoriaComponent } from "../../categories/registrar/registrar.component";
import { RegistrarSubcategoriaComponent } from "../../subcategories/registrar/registrar.component";
import { RegistrarProductsComponent } from "../../products/registrar-products/registrar-products.component";
import { PermisosComponent } from "../../permisos/permisos.component";
import { TypographyComponent } from "../../typography/typography.component";
import { IconsComponent } from "../../icons/icons.component";
import { MapsComponent } from "../../maps/maps.component";
import { NotificationsComponent } from "../../notifications/notifications.component";
import { UpgradeComponent } from "../../upgrade/upgrade.component";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatRippleModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { CategoriesComponent } from "../../categories/categories.component";
import { SubcategoriesComponent } from "../../subcategories/subcategories.component";
import { ProductsComponent } from "../../products/products.component";
import { MenusComponent } from "../../menus/menus.component";
import { RegistrarMenuComponent } from "../../menus/registrar/registrar.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  declarations: [
    DashboardComponent,
    UserProfileComponent,
    UsersComponent,
    RegistrarComponent,
    CategoriesComponent,
    RegistrarCategoriaComponent,
    SubcategoriesComponent,
    RegistrarSubcategoriaComponent,
    ProductsComponent,
    RegistrarProductsComponent,
    MenusComponent,
    RegistrarMenuComponent,
    PermisosComponent,
    TypographyComponent,
    IconsComponent,
    MapsComponent,
    NotificationsComponent,
    UpgradeComponent,
  ],
})
export class AdminLayoutModule {}
