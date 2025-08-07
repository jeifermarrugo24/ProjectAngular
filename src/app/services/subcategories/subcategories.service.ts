import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

import { Subcategorie } from "../../models/subcategorie.model";

import { ApiResponseModel } from "app/models/response-api.model";
@Injectable({
  providedIn: 'root'
})
export class SubcategorieService {
private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = environment.token || "";
    return new HttpHeaders({
      Authorization: `${token}`,
      "Content-Type": "application/json",
    });
  }

  saveSubCategorie(subcategoria: Subcategorie): Observable<ApiResponseModel<any>> {
    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/guardarDatosSubcategoria`,
      subcategoria,
      { headers: this.getHeaders() }
    );
  }

  getSubCategorie(filtros: Partial<Subcategorie> = {}): Observable<ApiResponseModel<Subcategorie[]>> {
    return this.http.post<ApiResponseModel<Subcategorie[]>>(
      `${this.apiUrl}/consultarDatosSubcategoria`,
      filtros,
      { headers: this.getHeaders() }
    );
  }

  deleteSubcategorie(id: number): Observable<ApiResponseModel<any>> {
    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/eliminarDatosSubcategoria`,
      { producto_id: id },
      { headers: this.getHeaders() }
    );
  }

  updateSubcategorie(subcategoria: Subcategorie): Observable<ApiResponseModel<any>> {
    return this.http.post<ApiResponseModel<any>>(
      `${this.apiUrl}/editarDatosSubcategoria`,
      subcategoria,
      { headers: this.getHeaders() }
    );
  }
}