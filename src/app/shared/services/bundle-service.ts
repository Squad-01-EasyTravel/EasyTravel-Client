import { BundleClass } from '@/app/features/client/pages/bundle/class/bundle-class';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MediaResponse } from '../models/media-response.interface';

@Injectable({
  providedIn: 'root'
})
export class BundleService {

  private baseUrl = "http://localhost:8080/api/bundles";
  private mediaUrl = "http://localhost:8080/api/medias";
  constructor(private http: HttpClient) {}

  // Buscar todos os pacotes disponíveis
  getAvailableBundles(): Observable<BundleClass[]> {
    const url = `${this.baseUrl}/available`;
    return this.http.get<BundleClass[]>(url);
  }

  // Buscar pacote por ID
  getBundleById(id: string): Observable<BundleClass> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<BundleClass>(url);
  }

  // Buscar imagem do pacote por ID
  getBundleImage(bundleId: number): Observable<MediaResponse[]> {
    const url = `${this.mediaUrl}/images/bundle/${bundleId}`;
    return this.http.get<MediaResponse[]>(url);
  }
}
