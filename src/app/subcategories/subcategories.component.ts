import { Component, OnInit } from '@angular/core';
import { SubcategorieService } from "../services/subcategories/subcategorie.service";
import { Subcategorie } from "../models/subcategorie.model";

@Component({
  selector: 'app-subcategories',
  templateUrl: './subcategories.component.html',
  styleUrls: ['./subcategories.component.scss']
})
export class SubcategoriesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
