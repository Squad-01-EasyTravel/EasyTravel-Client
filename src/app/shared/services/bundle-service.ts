import { BundleClass } from '@/app/features/client/pages/bundle/class/bundle-class';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MediaResponse } from '../models/media-response.interface';
import { BundleLocationResponse } from '../models/bundle-location-response.interface';
import { Location } from '../models/location.interface';

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

  // Buscar localização do pacote por ID
  getBundleLocation(bundleId: number): Observable<BundleLocationResponse[]> {
    const url = `http://localhost:8080/api/bundle-locations/bundle/${bundleId}`;
    return this.http.get<BundleLocationResponse[]>(url);
  }

  // Buscar todos os locais disponíveis
  getLocations(): Observable<Location[]> {
    const url = `http://localhost:8080/api/locations`;
    return this.http.get<Location[]>(url);
  }

  getAllBundles(): Observable<BundleClass[]> {
    return this.http.get<BundleClass[]>(this.baseUrl);
  }

  // Criar novo bundle
  createBundle(bundle: Partial<BundleClass>): Observable<BundleClass> {
    return this.http.post<BundleClass>(this.baseUrl, bundle);
  }

  // Atualizar bundle existente
  updateBundle(id: number, bundle: Partial<BundleClass>): Observable<BundleClass> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<BundleClass>(url, bundle);
  }

  // Excluir bundle por ID
  deleteBundle(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url);
  }

  // Salvar mídia para um bundle
  saveBundleMedia(bundleId: number, mediaUrl: string, mediaType: string = 'IMAGE'): Observable<MediaResponse> {
    const mediaData = {
      mediaType: mediaType.toUpperCase(), // Garantir que seja maiúsculo (IMAGE ou VIDEO)
      mediaUrl: mediaUrl,
      bundleId: bundleId
    };
    
    // Headers específicos para requisições de mídia (sem autenticação)
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Skip-Auth': 'true' // Sinaliza para o interceptor pular autenticação
    });
    
    return this.http.post<MediaResponse>(this.mediaUrl, mediaData, { headers });
  }

  // Atualizar mídia existente
  updateBundleMedia(mediaId: number, mediaUrl: string, mediaType: string = 'IMAGE'): Observable<MediaResponse> {
    const url = `${this.mediaUrl}/${mediaId}`;
    const mediaData = {
      mediaType: mediaType.toUpperCase(), // Garantir que seja maiúsculo (IMAGE ou VIDEO)
      mediaUrl: mediaUrl
    };
    
    // Headers específicos para requisições de mídia (sem autenticação)
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Skip-Auth': 'true' // Sinaliza para o interceptor pular autenticação
    });
    
    return this.http.put<MediaResponse>(url, mediaData, { headers });
  }

  // Métodos de conveniência para tipos específicos de mídia

  // Salvar imagem para um bundle
  saveBundleImage(bundleId: number, imageUrl: string): Observable<MediaResponse> {
    return this.saveBundleMedia(bundleId, imageUrl, 'IMAGE');
  }

  // Salvar vídeo para um bundle
  saveBundleVideo(bundleId: number, videoUrl: string): Observable<MediaResponse> {
    return this.saveBundleMedia(bundleId, videoUrl, 'VIDEO');
  }

  // Atualizar imagem existente
  updateBundleImage(mediaId: number, imageUrl: string): Observable<MediaResponse> {
    return this.updateBundleMedia(mediaId, imageUrl, 'IMAGE');
  }

  // Atualizar vídeo existente
  updateBundleVideoMedia(mediaId: number, videoUrl: string): Observable<MediaResponse> {
    return this.updateBundleMedia(mediaId, videoUrl, 'VIDEO');
  }

  // Criar relação bundle-location
  createBundleLocation(bundleLocationData: { bundleId: number; destinationId: number; departureId: number }): Observable<BundleLocationResponse> {
    const url = `http://localhost:8080/api/bundle-locations`;
    return this.http.post<BundleLocationResponse>(url, bundleLocationData);
  }

  
}
