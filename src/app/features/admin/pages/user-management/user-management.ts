import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService, UserManagement as UserModel, UserManagementResponse, CreateUserDto, UpdateUserDto } from '../../../../shared/services/user-management.service';
import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagement implements OnInit {
  // Referência para Math para usar no template
  Math = Math;

  // Dados dos usuários
  users: UserModel[] = [];
  totalUsers: number = 0;
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  loading: boolean = false;

  // Filtros e busca
  searchTerm: string = '';
  selectedRole: string = '';
  sortBy: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Modal de usuário
  isUserModalOpen: boolean = false;
  isEditMode: boolean = false;
  selectedUser: UserModel | null = null;

  // Modal de criação/edição
  userForm: CreateUserDto & { id?: string } = {
    name: '',
    email: '',
    cpf: '',
    telephone: '',
    password: '',
    userRole: 'CLIENT'
  };

  // Modal de detalhes
  isDetailsModalOpen: boolean = false;

  // Estatísticas
  userStats = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    clientUsers: 0,
    employeeUsers: 0,
    adminUsers: 0
  };

  constructor(
    private userManagementService: UserManagementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar se o usuário está autenticado
    const currentUser = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    
    console.log('Current User:', currentUser);
    console.log('Token exists:', !!token);
    
    if (!currentUser) {
      console.error('Usuário não autenticado');
      // Opcional: redirecionar para login
      // this.router.navigate(['/login']);
      return;
    }

    // Verificar se o usuário tem permissão (ADMIN ou EMPLOYEE)
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'EMPLOYEE') {
      console.error('Usuário sem permissão para acessar gerenciamento de usuários');
      return;
    }

    this.loadUsers();
    this.loadUserStats();
  }

  // Carregar usuários
  loadUsers(): void {
    this.loading = true;
    this.userManagementService.getUsers(this.currentPage, this.pageSize, this.searchTerm, this.selectedRole)
      .subscribe({
        next: (response: UserManagementResponse) => {
          this.users = response.users;
          this.totalUsers = response.totalUsers;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar usuários:', error);
          this.loading = false;
          if (error.status === 403) {
            alert('Erro de autorização: Você não tem permissão para visualizar usuários. Verifique se está logado corretamente.');
          } else if (error.status === 401) {
            alert('Erro de autenticação: Faça login novamente.');
          } else {
            alert('Erro ao carregar usuários. Tente novamente.');
          }
        }
      });
  }

  // Carregar estatísticas
  loadUserStats(): void {
    this.userManagementService.getUserStats().subscribe({
      next: (stats) => {
        this.userStats = stats;
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas:', error);
        if (error.status === 403) {
          console.warn('Não foi possível carregar estatísticas: permissão negada');
        } else if (error.status === 401) {
          console.warn('Não foi possível carregar estatísticas: usuário não autenticado');
        }
        // Definir valores padrão para as estatísticas
        this.userStats = {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          clientUsers: 0,
          employeeUsers: 0,
          adminUsers: 0
        };
      }
    });
  }

  // Buscar usuários
  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  // Filtrar por role
  onRoleFilter(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  // Paginação
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  // Modal de criação
  openCreateModal(): void {
    this.isUserModalOpen = true;
    this.isEditMode = false;
    this.resetForm();
  }

  // Modal de edição
  openEditModal(user: UserModel): void {
    this.isUserModalOpen = true;
    this.isEditMode = true;
    this.selectedUser = user;
    this.userForm = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      telephone: user.telephone,
      password: '',
      userRole: user.userRole
    };
  }

  // Modal de detalhes
  openDetailsModal(user: UserModel): void {
    this.selectedUser = user;
    this.isDetailsModalOpen = true;
  }

  // Fechar modais
  closeModal(): void {
    this.isUserModalOpen = false;
    this.isDetailsModalOpen = false;
    this.selectedUser = null;
    this.resetForm();
  }

  // Resetar formulário
  resetForm(): void {
    this.userForm = {
      name: '',
      email: '',
      cpf: '',
      telephone: '',
      password: '',
      userRole: 'CLIENT'
    };
  }

  // Salvar usuário
  saveUser(): void {
    if (!this.isFormValid()) {
      return;
    }

    if (this.isEditMode && this.userForm.id) {
      const updateData: UpdateUserDto = {
        name: this.userForm.name,
        email: this.userForm.email,
        cpf: this.userForm.cpf,
        telephone: this.userForm.telephone,
        userRole: this.userForm.userRole
      };

      this.userManagementService.updateUser(this.userForm.id, updateData).subscribe({
        next: () => {
          this.loadUsers();
          this.loadUserStats();
          this.closeModal();
        },
        error: (error) => {
          console.error('Erro ao atualizar usuário:', error);
        }
      });
    } else {
      const createData: CreateUserDto = {
        name: this.userForm.name,
        email: this.userForm.email,
        cpf: this.userForm.cpf,
        telephone: this.userForm.telephone,
        password: this.userForm.password,
        userRole: this.userForm.userRole
      };

      this.userManagementService.createUser(createData).subscribe({
        next: () => {
          this.loadUsers();
          this.loadUserStats();
          this.closeModal();
        },
        error: (error) => {
          console.error('Erro ao criar usuário:', error);
        }
      });
    }
  }

  // Validar formulário
  isFormValid(): boolean {
    return !!(
      this.userForm.name?.trim() &&
      this.userForm.email?.trim() &&
      this.userForm.cpf?.trim() &&
      this.userForm.telephone?.trim() &&
      this.userForm.userRole &&
      (this.isEditMode || this.userForm.password?.trim())
    );
  }

  // Alternar status do usuário
  toggleUserStatus(user: UserModel): void {
    this.userManagementService.toggleUserStatus(user.id).subscribe({
      next: () => {
        user.isActive = !user.isActive;
        this.loadUserStats();
      },
      error: (error) => {
        console.error('Erro ao alterar status do usuário:', error);
      }
    });
  }

  // Excluir usuário
  deleteUser(user: UserModel): void {
    if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      this.userManagementService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
          this.loadUserStats();
        },
        error: (error) => {
          console.error('Erro ao excluir usuário:', error);
        }
      });
    }
  }

  // Utilidades
  getRoleDisplayName(role: string | undefined): string {
    if (!role) return 'Não definido';
    const roleNames: { [key: string]: string } = {
      'CLIENT': 'Cliente',
      'EMPLOYEE': 'Funcionário',
      'ADMIN': 'Administrador'
    };
    return roleNames[role] || role;
  }

  getRoleClass(role: string | undefined): string {
    if (!role) return 'badge bg-secondary';
    const roleClasses: { [key: string]: string } = {
      'CLIENT': 'badge bg-primary',
      'EMPLOYEE': 'badge bg-info',
      'ADMIN': 'badge bg-danger'
    };
    return roleClasses[role] || 'badge bg-secondary';
  }

  getRoleIcon(role: string | undefined): string {
    if (!role) return 'fas fa-user';
    const roleIcons: { [key: string]: string } = {
      'CLIENT': 'fas fa-user',
      'EMPLOYEE': 'fas fa-user-tie',
      'ADMIN': 'fas fa-user-shield'
    };
    return roleIcons[role] || 'fas fa-user';
  }

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Array para paginação
  get paginationArray(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Método para tratar erro de imagem
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.nextElementSibling) {
      target.style.display = 'none';
      (target.nextElementSibling as HTMLElement).style.display = 'flex';
    }
  }
}
