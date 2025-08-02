import { BundleClass } from '@/app/features/client/pages/bundle/class/bundle-class';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BundleService {

  private baseUrl = "http://localhost:8080/api/bundles";
  constructor(private http: HttpClient) {}

  getBundleById(id: string):Observable<BundleClass> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<BundleClass>(url);
  }
}
