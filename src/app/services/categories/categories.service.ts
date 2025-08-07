import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

import {
  Categories,
} from "../../models/categories.model";

import { ApiResponseModel } from "app/models/response-api.model";
@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = environment.token || "";
    return new HttpHeaders({
      Authorization: `${token}`,
      "Content-Type": "application/json",
    });
  }

  saveCategories(categories: Categories): Observable<ApiResponseModel<any>> {
    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/guardarDatosCategoria`,
      categories,
      { headers: this.getHeaders() }
    );
  }

  getCategories(filtros: Partial<Categories> = {}): Observable<ApiResponseModel<Categories[]>> {
    return this.http.post<ApiResponseModel<Categories[]>>(
      `${this.apiUrl}/consultarDatosCategoria`,
      filtros,
      { headers: this.getHeaders() }
    );
  }

  deleteCategories(id: number): Observable<ApiResponseModel<any>> {
    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/eliminarDatosCategoria`,
      { categoria_id: id },
      { headers: this.getHeaders() }
    );
  }

  updateCategories(categories: Categories): Observable<ApiResponseModel<any>> {
    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/editarDatosCategoria`,
      categories,
      { headers: this.getHeaders() }
    );
  }
}