import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

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
  userRole?: 'ADMIN' | 'EMPLOYEE' | 'CLIENT';
  userStatus?: 'ACTIVATED' | 'DEACTIVATED';
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private baseUrl = 'http://localhost:8080/api/users'; // Ajuste para a URL da sua API

  constructor(private http: HttpClient) {}

  // Método para tratar erros de autenticação
  private handleError(error: any): Observable<never> {
    if (error.status === 403) {
      console.error('Erro de autorização: Token inválido ou expirado');
      // Você pode adicionar aqui um redirecionamento para login se necessário
      // this.router.navigate(['/login']);
    } else if (error.status === 401) {
      console.error('Erro de autenticação: Usuário não autenticado');
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

  // Buscar usuários com paginação
  getUsers(page: number = 1, pageSize: number = 10, search?: string, role?: string): Observable<UserManagementResponse> {
    // Fazer chamada para API real
    return this.http.get<UserManagement[]>(`${this.baseUrl}`).pipe(
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

  // Buscar usuário por ID
  getUserById(id: number | string): Observable<UserManagement> {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    return this.http.get<UserManagement>(`${this.baseUrl}/${numericId}`).pipe(
      map(user => this.transformUser(user)),
      catchError(error => this.handleError(error))
    );
  }

  // Criar novo usuário
  createUser(userData: CreateUserDto): Observable<UserManagement> {
    return this.http.post<UserManagement>(`${this.baseUrl}`, userData).pipe(
      map(user => this.transformUser(user)),
      catchError(error => this.handleError(error))
    );
  }

  // Atualizar usuário
  updateUser(id: number | string, userData: UpdateUserDto): Observable<UserManagement> {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    return this.http.put<UserManagement>(`${this.baseUrl}/${numericId}`, userData).pipe(
      map(user => this.transformUser(user)),
      catchError(error => this.handleError(error))
    );
  }

  // Desativar/ativar usuário
  toggleUserStatus(id: number | string): Observable<boolean> {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    return this.getUserById(id).pipe(
      switchMap((user: UserManagement) => {
        const newStatus: 'ACTIVATED' | 'DEACTIVATED' = user.userStatus === 'ACTIVATED' ? 'DEACTIVATED' : 'ACTIVATED';
        return this.updateUser(id, { userStatus: newStatus });
      }),
      map(() => true),
      catchError(error => this.handleError(error))
    );
  }

  // Excluir usuário
  deleteUser(id: number | string): Observable<boolean> {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    return this.http.delete<boolean>(`${this.baseUrl}/${numericId}`).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // Buscar estatísticas de usuários
  getUserStats(): Observable<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    clientUsers: number;
    employeeUsers: number;
    adminUsers: number;
  }> {
    return this.http.get<UserManagement[]>(`${this.baseUrl}`).pipe(
      map(response => {
        const users = response.map(user => this.transformUser(user));
        return {
          totalUsers: users.length,
          activeUsers: users.filter(u => u.isActive).length,
          inactiveUsers: users.filter(u => !u.isActive).length,
          clientUsers: users.filter(u => u.role === 'CLIENT').length,
          employeeUsers: users.filter(u => u.role === 'EMPLOYEE').length,
          adminUsers: users.filter(u => u.role === 'ADMIN').length,
        };
      }),
      catchError(error => this.handleError(error))
    );
  }
}
