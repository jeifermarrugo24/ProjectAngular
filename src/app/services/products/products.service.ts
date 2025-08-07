import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

import {
  Productos,
} from "../../models/products.model";

import { ApiResponseModel } from "app/models/response-api.model";
@Injectable({
  providedIn: 'root'
})
export class ProductsService {
private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = environment.token || "";
    return new HttpHeaders({
      Authorization: `${token}`,
      "Content-Type": "application/json",
    });
  }

  saveProducts(product: Productos): Observable<ApiResponseModel<any>> {
    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/guardarDatosProducto`,
      product,
      { headers: this.getHeaders() }
    );
  }

  getProducts(filtros: Partial<Productos> = {}): Observable<ApiResponseModel<Productos[]>> {
    return this.http.post<ApiResponseModel<Productos[]>>(
      `${this.apiUrl}/consultarDatosProducto`,
      filtros,
      { headers: this.getHeaders() }
    );
  }

  deleteProducts(id: number): Observable<ApiResponseModel<any>> {
    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/eliminarDatosProducto`,
      { producto_id: id },
      { headers: this.getHeaders() }
    );
  }

  updateProducts(product: Productos): Observable<ApiResponseModel<any>> {
    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/editarDatosProducto`,
      product,
      { headers: this.getHeaders() }
    );
  }
}