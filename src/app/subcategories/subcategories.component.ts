import { UserService } from "app/services/users/users.service";
import { Component, OnInit } from "@angular/core";
import { User } from "app/models/user.model";
// import { SubcategorieService } from "../services/subcategories/subcategories.service";
// import { Subcategorie } from "../models/subcategorie";

@Component({
  selector: "app-subcategories",
  templateUrl: "./subcategories.component.html",
  styleUrls: ["./subcategories.component.scss"],
})
export class SubcategoriesComponent implements OnInit {
  users: User[] = [];
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe((data) => {
      this.users = data.data;
    });
  }
}
