import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../shared/services/auth.service';
import { UserManagementService, UserManagement as User, UserStats } from '../../../../shared/services/user-management.service';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css'
})
export class UserManagement implements OnInit {
  users: User[] = [];
  stats: UserStats = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    clientUsers: 0,
    employeeUsers: 0,
    adminUsers: 0
  };

  // Filtros e paginação
  searchTerm: string = '';
  selectedRole: string = '';
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;
  loading: boolean = false;
  error: string | null = null;

  // Controle de modais
  showUserModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditMode: boolean = false;
  selectedUser: User | null = null;
  userToDelete: User | null = null;
  isUserModalOpen: boolean = false;
  isDetailsModalOpen: boolean = false;

  // Dados do formulário
  userForm: any = {
    name: '',
    email: '',
    cpf: '',
    telephone: '',
    passport: '',
    password: '',
    userRole: 'CLIENT'
  };

  constructor(
    private userManagementService: UserManagementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('🚀 UserManagement - Iniciando componente');
    
    // Verificar autenticação
    if (!this.authService.isAuthenticated()) {
      console.log('❌ UserManagement - Usuário não autenticado');
      this.error = 'Você precisa estar logado para acessar esta página.';
      return;
    }

    // Verificar permissões de admin
    if (!this.authService.hasAdminAccess()) {
      console.log('❌ UserManagement - Usuário sem permissões de admin');
      this.error = 'Você não tem permissão para acessar esta página.';
      return;
    }

    console.log('✅ UserManagement - Usuário autenticado e autorizado');
    this.loadUsers();
    this.loadUserStats();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
    console.log('📥 UserManagement - Carregando usuários...');

    this.userManagementService.getUsers(this.currentPage, this.pageSize, this.searchTerm, this.selectedRole)
      .subscribe({
        next: (response) => {
          console.log('✅ UserManagement - Usuários carregados:', response);
          this.users = response.users;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ UserManagement - Erro ao carregar usuários:', error);
          this.loading = false;
          
          if (error.status === 403) {
            this.error = 'Acesso negado. Verifique suas permissões.';
            console.log('❌ Token expirado ou inválido. Redirecionando para login...');
          } else if (error.status === 401) {
            this.error = 'Sessão expirada. Faça login novamente.';
          } else {
            this.error = 'Erro ao carregar usuários. Tente novamente mais tarde.';
          }
        }
      });
  }

  loadUserStats(): void {
    console.log('📊 UserManagement - Carregando estatísticas...');

    this.userManagementService.getUserStats()
      .subscribe({
        next: (stats) => {
          console.log('✅ UserManagement - Estatísticas carregadas:', stats);
          this.stats = stats;
        },
        error: (error) => {
          console.error('❌ UserManagement - Erro ao carregar estatísticas:', error);
          // Não exibir erro para as estatísticas, apenas log
        }
      });
  }

  // Métodos de controle de modal
  openCreateUserModal(): void {
    this.isEditMode = false;
    this.selectedUser = null;
    this.resetUserForm();
    this.showUserModal = true;
  }

  openEditUserModal(user: User): void {
    this.isEditMode = true;
    this.selectedUser = user;
    this.userForm = {
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      telephone: user.telephone,
      passport: user.passport || '',
      userRole: user.userRole
    };
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.resetUserForm();
  }

  openDeleteModal(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  resetUserForm(): void {
    this.userForm = {
      name: '',
      email: '',
      cpf: '',
      telephone: '',
      passport: '',
      password: '',
      userRole: 'CLIENT'
    };
  }

  // Métodos de ação
  onSubmitUser(): void {
    if (this.isEditMode && this.selectedUser) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    console.log('➕ UserManagement - Criando usuário:', this.userForm);

    this.userManagementService.createUser(this.userForm)
      .subscribe({
        next: (user) => {
          console.log('✅ UserManagement - Usuário criado:', user);
          this.closeUserModal();
          this.loadUsers();
          this.loadUserStats();
        },
        error: (error) => {
          console.error('❌ UserManagement - Erro ao criar usuário:', error);
          this.error = 'Erro ao criar usuário. Verifique os dados e tente novamente.';
        }
      });
  }

  updateUser(): void {
    if (!this.selectedUser) return;

    console.log('✏️ UserManagement - Atualizando usuário:', this.selectedUser.id, this.userForm);

    // Remover password do update se não foi fornecida
    const updateData = { ...this.userForm };
    if (!updateData.password) {
      delete updateData.password;
    }

    this.userManagementService.updateUser(this.selectedUser.id, updateData)
      .subscribe({
        next: (user) => {
          console.log('✅ UserManagement - Usuário atualizado:', user);
          this.closeUserModal();
          this.loadUsers();
          this.loadUserStats();
        },
        error: (error) => {
          console.error('❌ UserManagement - Erro ao atualizar usuário:', error);
          this.error = 'Erro ao atualizar usuário. Tente novamente.';
        }
      });
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    console.log('🗑️ UserManagement - Excluindo usuário:', this.userToDelete.id);

    this.userManagementService.deleteUser(this.userToDelete.id)
      .subscribe({
        next: () => {
          console.log('✅ UserManagement - Usuário excluído');
          this.closeDeleteModal();
          this.loadUsers();
          this.loadUserStats();
        },
        error: (error) => {
          console.error('❌ UserManagement - Erro ao excluir usuário:', error);
          this.error = 'Erro ao excluir usuário. Tente novamente.';
        }
      });
  }

  toggleUserStatus(user: User): void {
    console.log('🔄 UserManagement - Alterando status do usuário:', user.id);

    this.userManagementService.toggleUserStatus(user.id)
      .subscribe({
        next: () => {
          console.log('✅ UserManagement - Status alterado');
          this.loadUsers();
          this.loadUserStats();
        },
        error: (error) => {
          console.error('❌ UserManagement - Erro ao alterar status:', error);
          this.error = 'Erro ao alterar status do usuário. Tente novamente.';
        }
      });
  }

  // Métodos de filtro e paginação
  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onRoleFilter(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.currentPage = 1;
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  // Métodos utilitários
  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'EMPLOYEE': 'Funcionário',
      'CLIENT': 'Cliente'
    };
    return roleMap[role] || role;
  }

  getStatusDisplayName(status: string): string {
    return status === 'ACTIVATED' ? 'Ativo' : 'Inativo';
  }

  // Getters para o template
  get paginatedUsers(): User[] {
    return this.users;
  }

  get totalUsers(): number {
    return this.stats.totalUsers;
  }

  get userStats(): UserStats {
    return this.stats;
  }

  get paginationArray(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Métodos para modais
  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedUser = null;
    this.resetUserForm();
    this.isUserModalOpen = true;
  }

  openEditModal(user: User): void {
    this.isEditMode = true;
    this.selectedUser = user;
    this.userForm = {
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      telephone: user.telephone,
      passport: user.passport || '',
      userRole: user.userRole
    };
    this.isUserModalOpen = true;
  }

  openDetailsModal(user: User): void {
    this.selectedUser = user;
    this.isDetailsModalOpen = true;
  }

  closeModal(): void {
    this.isUserModalOpen = false;
    this.isDetailsModalOpen = false;
    this.selectedUser = null;
    this.resetUserForm();
  }

  // Métodos de paginação
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  // Métodos utilitários para UI
  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getRoleClass(role: string): string {
    const roleClasses: { [key: string]: string } = {
      'ADMIN': 'role-admin',
      'EMPLOYEE': 'role-employee',
      'CLIENT': 'role-client'
    };
    return roleClasses[role] || 'role-default';
  }

  getRoleIcon(role: string): string {
    const roleIcons: { [key: string]: string } = {
      'ADMIN': 'fas fa-crown',
      'EMPLOYEE': 'fas fa-user-tie',
      'CLIENT': 'fas fa-user'
    };
    return roleIcons[role] || 'fas fa-user';
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  // Validação do formulário
  isFormValid(): boolean {
    if (!this.userForm.name || !this.userForm.email || !this.userForm.cpf || 
        !this.userForm.telephone || !this.userForm.userRole) {
      return false;
    }
    
    if (!this.isEditMode && !this.userForm.password) {
      return false;
    }
    
    return true;
  }

  // Método para salvar usuário
  saveUser(): void {
    if (!this.isFormValid()) {
      this.error = 'Preencha todos os campos obrigatórios.';
      return;
    }

    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  // Getter para Math (usado no template)
  get Math() {
    return Math;
  }
}