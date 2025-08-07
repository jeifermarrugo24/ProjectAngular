import { UserService } from "app/services/users/users.service";
import { User } from "app/models/user.model";
// import { SubcategorieService } from "../services/subcategories/subcategories.service";
// import { Subcategorie } from "../models/subcategorie";
import { Component, OnInit } from "@angular/core";
import { SubcategorieService } from "../services/subcategories/subcategories.service";
import { Subcategorie } from "../models/subcategorie.model";

@Component({
  selector: "app-subcategories",
  templateUrl: "./subcategories.component.html",
  styleUrls: ["./subcategories.component.scss"],
})
export class SubcategoriesComponent implements OnInit {
  error: string | null = null;
  subcategories: Subcategorie[] = [];
  constructor(
    private userService: UserService,
    private subcategorieService: SubcategorieService
  ) {}

  ngOnInit(): void {
    this.subcategorieService.getSubCategorie().subscribe((res) => {
      if ("data" in res) {
        this.subcategories = res.data;
      }
      if ("error" in res) {
        this.error = res.error || "Error desconocido";
      }
    });
  }
}
