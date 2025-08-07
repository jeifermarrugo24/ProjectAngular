import { Component, OnInit } from '@angular/core';
import { CategoriesService } from "../services/categories/categories.service";
import { Categories } from "../models/categories.model";

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  categories: Categories[] = [];
  error: string | null = null;

  constructor(private categoriesServices: CategoriesService) {}

  ngOnInit() {
    this.categoriesServices.getCategories().subscribe((res) => {
      if ("data" in res) {
        this.categories = res.data;
      }
      if ("error" in res) {
        this.error = res.error || "Error desconocido";
      }
    });
  }

}
