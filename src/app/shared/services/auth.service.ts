import {jwtDecode} from 'jwt-decode';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CurrentUser } from '@/app/features/client/pages/booking/classe/current-user';


// export interface RoleClient{
//
// }

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
  role? : string;

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

  constructor(private http: HttpClient, private router: Router) {
    // Verificar se há token salvo no localStorage ao inicializar
    this.checkAuthStatus();




  }

   getUserRoleFromToken(): string | null {
    const token = localStorage.getItem('jwt');
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);

      return decoded.role || null;
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      return null;
    }
  }

  // Verificar se o usuário tem acesso administrativo
  hasAdminAccess(): boolean {
    const role = this.getUserRoleFromToken();
    return role === 'ADMIN' || role === 'EMPLOYEE';
  }

  // Obter o role atual do usuário
  getCurrentUserRole(): string | null {
    return this.getUserRoleFromToken();
  }

   currentUser: CurrentUser = new CurrentUser();

  login(data: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        console.log('Login bem sucedido, salvando dados:', response);
        this.setToken(response.token);
        this.setCurrentUser(response.user);
        localStorage.setItem('jwt', response.token);

        // Decodifica o token e armazena os dados em currentUser
        try {
          const decoded: any = jwtDecode(response.token);
          console.log('Role do usuário autenticado:', decoded.role);
          console.log('Token decodificado:', decoded);

          // Mapeia os dados decodificados para CurrentUser
          this.currentUser = this.mapDecodedToCurrentUser(decoded);

        } catch (error) {
          console.error('Erro ao decodificar o token:', error);
        }
      })
    );
  }

  private mapDecodedToCurrentUser(decoded: any): CurrentUser {
    const user = new CurrentUser();
    user.userId = decoded.id ;

   
  
    
    return user;
  }

  registerClient(data: RegisterClientDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/client`, data).pipe(
      tap(response => {
        console.log('📦 Resposta completa do backend:', response);
        console.log('🔑 Token presente:', !!response?.token);
        console.log('👤 User presente:', !!response?.user);
        
        // Se a resposta é null mas chegou até aqui, significa que o registro foi bem-sucedido
        if (response === null) {
          console.log('✅ Registro realizado com sucesso (resposta null do backend)');
          // Não fazer nada, deixar o componente lidar com isso
          return;
        }
        
        if (response) {
          // Se há token, salvar (mesmo que não tenha user)
          if (response.token) {
            console.log('✅ Salvando token:', response.token);
            this.setToken(response.token);
            localStorage.setItem('jwt', response.token);
          }
          
          // Se há user, salvar
          if (response.user) {
            console.log('✅ Salvando usuário:', response.user);
            this.setCurrentUser(response.user);
          }
        }
      }),
      // Converter resposta null em um objeto válido para o componente
      map((response: AuthResponse | null) => {
        if (response === null) {
          // Retornar um objeto indicando sucesso sem autenticação automática
          return { 
            token: null, 
            user: null, 
            success: true, 
            message: 'Usuário registrado com sucesso. Faça login para continuar.' 
          } as any;
        }
        return response;
      })
    );
  }

  logout(): void {
    // Limpar todos os dados do localStorage
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');

    // Notificar observadores que o usuário foi deslogado
    this.currentUserSubject.next(null);

    // Só redirecionar se estivermos em uma rota protegida
    const currentUrl = this.router.url;
    const publicRoutes = ['/', '/home', '/bundles', '/auth/login', '/auth/register'];
    const isInPublicRoute = publicRoutes.some(route => currentUrl === route || currentUrl.startsWith('/auth'));

    if (!isInPublicRoute) {
      this.router.navigate(['/home']);
    }
  }  setToken(token: string): void {
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

  updateCurrentUser(userData: any): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      // Atualizar dados do usuário mantendo a estrutura existente
      const updatedUser = {
        ...currentUser,
        name: userData.name || currentUser.name,
        email: userData.email || currentUser.email,
        cpf: userData.cpf || currentUser.cpf,
        telephone: userData.telephone || currentUser.telephone
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
      console.log('👤 Dados do usuário atualizados no AuthService:', updatedUser);
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
    const token = this.getToken();

    if (token) {
      if (this.isAuthenticated()) {
        // Se há um token válido, recuperar dados do usuário
        let user = this.getCurrentUser();

        // Se não há usuário no localStorage, tentar extrair do token
        if (!user) {
          try {
            const decoded: any = jwtDecode(token);
            user = {
              id: decoded.id || decoded.sub,
              name: decoded.name || decoded.username || 'Usuário',
              email: decoded.email,
              cpf: decoded.cpf || '',
              telephone: decoded.telephone || '',
              role: decoded.role || 'CLIENT'
            };
            // Salvar o usuário extraído do token
            this.setCurrentUser(user);
          } catch (error) {
            console.error('Erro ao extrair usuário do token:', error);
          }
        }

        if (user) {
          this.currentUserSubject.next(user);
        }
      } else {
        // Token existe mas está inválido/expirado - limpar sem redirecionar
        this.clearAuthData();
      }
    } else {
      // Não há token - usuário nunca fez login ou já fez logout
      // Apenas garantir que os dados estão limpos, sem redirecionar
      this.clearAuthData();
    }
  }

  // Método para limpar dados de autenticação sem redirecionamento
  private clearAuthData(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
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