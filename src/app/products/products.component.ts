import { Component, OnInit } from '@angular/core';
import { ProductsService } from "../services/products/products.service";
import { Productos } from "../models/products.model";

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Productos[] = [];
  error: string | null = null;

  constructor(private productServices: ProductsService) {}
  
  ngOnInit() {
    this.productServices.getProducts().subscribe((res) => {
      if ("data" in res) {
        this.products = res.data;
      }
      if ("error" in res) {
        this.error = res.error || "Error desconocido";
      }
    });
  }

}
