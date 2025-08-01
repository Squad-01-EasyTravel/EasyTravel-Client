import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BundleLocationsService {
  
  private baseUrl = "http://localhost:8080/api/bundles-locations";
  constructor(private http: HttpClient) {}

  getBundleLocation(id:string) {
    
  }
}
