import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

// Interfaces para tipagem dos dados da API de usuários
export interface UserManagement {
  id: number;
  name: string;
  email: string;
  cpf: string;
  telephone: string;
  passport?: string;
  password?: string;
  userStatus: 'ACTIVATED' | 'DEACTIVATED';
  userRole: 'ADMIN' | 'EMPLOYEE' | 'CLIENT';
  avatar?: string;
  // Propriedades derivadas para compatibilidade com o frontend
  role?: 'ADMIN' | 'EMPLOYEE' | 'CLIENT';
  isActive?: boolean;
}

export interface UserManagementResponse {
  users: UserManagement[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  cpf: string;
  telephone: string;
  passport?: string;
  password: string;
  userRole: 'ADMIN' | 'EMPLOYEE' | 'CLIENT';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  cpf?: string;
  telephone?: string;
  passport?: string;
  password?: string;
  userRole?: 'ADMIN' | 'EMPLOYEE' | 'CLIENT';
  userStatus?: 'ACTIVATED' | 'DEACTIVATED';
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  clientUsers: number;
  employeeUsers: number;
  adminUsers: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private baseUrl = 'http://localhost:8080/api/users';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Método privado para obter headers de autenticação
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('🔑 UserManagementService - Token disponível:', !!token);
    console.log('🔑 UserManagementService - Usuário autenticado:', this.authService.isAuthenticated());
    console.log('🔑 UserManagementService - Role do usuário:', this.authService.getCurrentUserRole());

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('🔑 UserManagementService - Header Authorization adicionado');
    } else {
      console.log('❌ UserManagementService - Sem token disponível!');
    }

    return headers;
  }

  // Método para tratar erros de autenticação
  private handleError(error: any): Observable<never> {
    console.error('❌ UserManagementService - Erro na API:', error);
    
    if (error.status === 403) {
      console.error('❌ Erro de autorização: Token inválido ou expirado');
    } else if (error.status === 401) {
      console.error('❌ Erro de autenticação: Usuário não autenticado');
    }
    
    return throwError(() => error);
  }

  // Método utilitário para transformar dados do backend para frontend
  private transformUser(backendUser: any): UserManagement {
    return {
      ...backendUser,
      role: backendUser.userRole, // Mapeamento para compatibilidade
      isActive: backendUser.userStatus === 'ACTIVATED'
    };
  }

  // GET /api/users - Buscar todos os usuários
  getUsers(page: number = 1, pageSize: number = 10, search?: string, role?: string): Observable<UserManagementResponse> {
    const url = `${this.baseUrl}`;
    console.log('🔌 UserManagementService - Chamando API:', url);
    console.log('📊 UserManagementService - Parâmetros:', { page, pageSize, search, role });

    return this.http.get<UserManagement[]>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ UserManagementService - Usuários recebidos:', data.length, 'usuários')),
      map(response => {
        // Transformar os dados do backend
        let users = response.map(user => this.transformUser(user));
        
        // Aplicar filtros client-side
        if (search) {
          const searchLower = search.toLowerCase();
          users = users.filter(user => 
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.cpf.includes(search)
          );
        }
        
        if (role) {
          users = users.filter(user => user.userRole === role);
        }

        // Implementar paginação client-side
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedUsers = users.slice(startIndex, endIndex);
        
        return {
          users: paginatedUsers,
          totalUsers: users.length,
          currentPage: page,
          totalPages: Math.ceil(users.length / pageSize),
          pageSize: pageSize
        };
      }),
      catchError(error => this.handleError(error))
    );
  }

  // GET /api/users/{id} - Buscar usuário por ID
  getUserById(id: number | string): Observable<UserManagement> {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const url = `${this.baseUrl}/${numericId}`;
    console.log('🔌 UserManagementService - Chamando API:', url);

    return this.http.get<UserManagement>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ UserManagementService - Usuário por ID recebido:', data)),
      map(user => this.transformUser(user)),
      catchError(error => this.handleError(error))
    );
  }

  // POST /api/users - Criar novo usuário
  createUser(userData: CreateUserDto): Observable<UserManagement> {
    const url = `${this.baseUrl}`;
    console.log('🔌 UserManagementService - Criando usuário:', url, userData);

    return this.http.post<UserManagement>(url, userData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ UserManagementService - Usuário criado:', data)),
      map(user => this.transformUser(user)),
      catchError(error => this.handleError(error))
    );
  }

  // PUT /api/users/{id} - Atualizar usuário
  updateUser(id: number | string, userData: UpdateUserDto): Observable<UserManagement> {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const url = `${this.baseUrl}/${numericId}`;
    console.log('🔌 UserManagementService - Atualizando usuário:', url, userData);

    return this.http.put<UserManagement>(url, userData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ UserManagementService - Usuário atualizado:', data)),
      map(user => this.transformUser(user)),
      catchError(error => this.handleError(error))
    );
  }

  // DELETE /api/users/{id} - Excluir usuário
  deleteUser(id: number | string): Observable<boolean> {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const url = `${this.baseUrl}/${numericId}`;
    console.log('🔌 UserManagementService - Excluindo usuário:', url);

    return this.http.delete<boolean>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => console.log('✅ UserManagementService - Usuário excluído')),
      catchError(error => this.handleError(error))
    );
  }

  // Método auxiliar para alternar status do usuário
  toggleUserStatus(id: number | string): Observable<boolean> {
    console.log('🔄 UserManagementService - Alterando status do usuário:', id);
    
    return this.getUserById(id).pipe(
      switchMap((user: UserManagement) => {
        const newStatus: 'ACTIVATED' | 'DEACTIVATED' = user.userStatus === 'ACTIVATED' ? 'DEACTIVATED' : 'ACTIVATED';
        console.log('🔄 UserManagementService - Novo status:', newStatus);
        
        // Enviar todos os dados do usuário com apenas o userStatus alterado
        const updatedUser = {
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          passport: user.passport || undefined,
          password: undefined, // Não enviar senha na atualização
          telephone: user.telephone,
          userStatus: newStatus,
          userRole: user.userRole
        };
        
        console.log('📤 UserManagementService - Dados enviados para PUT:', updatedUser);
        return this.updateUser(id, updatedUser);
      }),
      map(() => {
        console.log('✅ UserManagementService - Status alterado com sucesso');
        return true;
      }),
      catchError(error => this.handleError(error))
    );
  }

  // Método para buscar estatísticas de usuários
  getUserStats(): Observable<UserStats> {
    console.log('📊 UserManagementService - Buscando estatísticas de usuários');
    
    return this.http.get<UserManagement[]>(`${this.baseUrl}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('✅ UserManagementService - Dados para estatísticas:', data.length, 'usuários')),
      map(response => {
        const users = response.map(user => this.transformUser(user));
        const stats = {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.isActive).length,
          inactiveUsers: users.filter(u => !u.isActive).length,
          clientUsers: users.filter(u => u.role === 'CLIENT').length,
          employeeUsers: users.filter(u => u.role === 'EMPLOYEE').length,
          adminUsers: users.filter(u => u.role === 'ADMIN').length,
        };
        console.log('📊 UserManagementService - Estatísticas calculadas:', stats);
        return stats;
      }),
      catchError(error => this.handleError(error))
    );
  }
}
