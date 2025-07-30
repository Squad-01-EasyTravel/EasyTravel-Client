import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterClientDto {
  name: string;
  email: string;
  cpf: string;
  passport?: string;
  password: string;
  telephone: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  login(data: LoginDto): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, data);
  }

  registerClient(data: RegisterClientDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/client`, data);
  }

  setToken(token: string) {
    localStorage.setItem('jwt', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  logout() {
    localStorage.removeItem('jwt');
  }
}
