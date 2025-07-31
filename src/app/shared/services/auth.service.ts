import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

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

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  telephone: string;
  role: 'CLIENT' | 'EMPLOYEE' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar se há token salvo no localStorage ao inicializar
    this.checkAuthStatus();
  }

  login(data: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setCurrentUser(response.user);
      })
    );
  }

  registerClient(data: RegisterClientDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/client`, data).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setCurrentUser(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  setToken(token: string): void {
    localStorage.setItem('jwt', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  setCurrentUser(user: User): void {
    if (user && user.id) {
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  //    setCurrentUser(user: User): void {
  //   localStorage.setItem('user', JSON.stringify(user));
  //   this.currentUserSubject.next(user);
  // }
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('user');
    if (!userJson || userJson === 'undefined') {
      return null;
    }
    try {
      return JSON.parse(userJson);
    } catch (error) {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Verificar se o token não está expirado (implementação básica)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  checkAuthStatus(): void {
    const user = this.getCurrentUser();
    const token = this.getToken();

    if (user && token && this.isAuthenticated()) {
      this.currentUserSubject.next(user);
    } else {
      this.logout();
    }
  }

  // Método para obter informações do perfil do usuário (para o booking)
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  // Método para atualizar perfil do usuário
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, userData).pipe(
      tap(updatedUser => {
        this.setCurrentUser(updatedUser);
      })
    );
  }
}