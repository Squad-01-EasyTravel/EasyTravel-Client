import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HomeFilter } from '../classes/home-filter';
import { Observable } from 'rxjs';
import { Bundle } from '@/app/features/client/pages/bundle/bundle';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  
  constructor(private http: HttpClient ){

  }

  homefilter: HomeFilter = new HomeFilter()
  

  baseUrl: string = "http://localhost:8080/api/bundles";

  buscarPacote(origem: string, destino: string): Observable<Bundle[]> {
    const url: string = `${this.baseUrl}/api/bundles-locations/route?origem=${encodeURIComponent(origem)}&destino=${encodeURIComponent(destino)}`;
    return this.http.get<Bundle[]>(url);
  }
}
