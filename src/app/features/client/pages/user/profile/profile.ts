import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Navbar } from '../../../../../shared/navbar/navbar';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '@/app/shared/services/auth.service';
import { NotificationService } from '@/app/shared/services/notification.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  cpf: string;
  passport?: string;
  telephone: string;
  userStatus: string;
  userRole: string;
}

@Component({
  selector: 'app-profile',
  imports: [Navbar, RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  standalone: true
})
export class Profile implements OnInit, OnDestroy {
  profileForm: FormGroup;
  isLoading = false;
  isSaving = false;
  currentUser: any = null;
  originalUserData: UserProfile | null = null; // Armazenar dados originais
  private baseUrl = "http://localhost:8080/api";
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private http: HttpClient,
    private router: Router
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit() {
    console.log('🚀 Componente Profile inicializado');
    
    // Carregar dados do perfil imediatamente
    this.loadUserProfile();
    
    // Monitorar navegações para recarregar dados quando o usuário retornar ao perfil
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      if (event.url.includes('/profile')) {
        console.log('🔄 Navegação detectada para o perfil, recarregando dados...');
        this.loadUserProfile();
      }
    });
  }

  ngOnDestroy() {
    console.log('🔚 Componente Profile destruído');
    this.destroy$.next();
    this.destroy$.complete();
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      passport: ['', [Validators.pattern(/^[A-Z0-9]{6,10}$/)]]
    });
  }

  loadUserProfile() {
    this.isLoading = true;
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser && this.currentUser.id) {
      console.log('👤 Usuário do localStorage:', this.currentUser);
      console.log('🔍 Buscando dados atuais via API para ID:', this.currentUser.id);
      
      // Sempre buscar dados atuais do usuário via API
      this.getUserById(this.currentUser.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
        next: (userData) => {
          console.log('✅ Dados atuais do usuário carregados via GET /api/users/' + this.currentUser.id + ':', userData);
          this.populateForm(userData);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Erro ao carregar dados do usuário via API:', error);
          console.error('🔗 URL da requisição:', `${this.baseUrl}/users/${this.currentUser.id}`);
          console.error('📄 Status:', error.status);
          
          let errorMessage = 'Não foi possível carregar suas informações. Tente novamente.';
          
          if (error.status === 404) {
            errorMessage = 'Usuário não encontrado. Verifique se você está logado corretamente.';
          } else if (error.status === 403) {
            errorMessage = 'Você não tem permissão para acessar estes dados.';
          } else if (error.status === 401) {
            errorMessage = 'Sua sessão expirou. Faça login novamente.';
          }
          
          this.notificationService.showError(
            'Erro ao Carregar Dados',
            errorMessage
          );
          this.isLoading = false;
        }
      });
    } else {
      console.error('❌ Usuário não encontrado no localStorage ou ID inválido');
      this.isLoading = false;
      this.notificationService.showError(
        'Erro de Autenticação',
        'Usuário não encontrado no sistema. Faça login novamente.'
      );
      // Opcional: redirecionar para login
      // this.router.navigate(['/login']);
    }
  }

  populateForm(userData: UserProfile) {
    // Armazenar dados originais para comparação posterior
    this.originalUserData = { ...userData };
    
    // Dividir o nome completo em primeiro nome e sobrenome
    const nameParts = userData.name ? userData.name.split(' ') : ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    this.profileForm.patchValue({
      firstName: firstName,
      lastName: lastName,
      email: userData.email || '',
      telephone: this.formatPhone(userData.telephone || ''),
      cpf: this.formatCPF(userData.cpf || ''),
      passport: userData.passport || ''
    });
  }

  formatPhone(phone: string): string {
    // Remove caracteres não numéricos
    const numbers = phone.replace(/\D/g, '');
    
    // Aplica máscara (11) 99999-9999
    if (numbers.length === 11) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
    } else if (numbers.length === 10) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
    }
    
    return phone;
  }

  formatCPF(cpf: string): string {
    // Remove caracteres não numéricos
    const numbers = cpf.replace(/\D/g, '');
    
    // Aplica máscara 000.000.000-00
    if (numbers.length === 11) {
      return `${numbers.substring(0, 3)}.${numbers.substring(3, 6)}.${numbers.substring(6, 9)}-${numbers.substring(9)}`;
    }
    
    return cpf;
  }

  getUserById(userId: number): Observable<UserProfile> {
    const token = this.authService.getToken();
    const url = `${this.baseUrl}/users/${userId}`;
    
    console.log('🔄 Fazendo requisição GET para:', url);
    console.log('🔑 Token presente:', token ? 'Sim' : 'Não');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<UserProfile>(url, { headers });
  }

  /**
   * Detecta quais campos foram modificados comparando com os dados originais
   */
  getModifiedFields(): any {
    if (!this.originalUserData) {
      console.warn('⚠️ Dados originais não encontrados, enviando todos os campos');
      return this.getAllFormData();
    }

    const formData = this.profileForm.value;
    const modifiedFields: any = {};

    // Comparar nome completo
    const currentFullName = `${formData.firstName} ${formData.lastName}`.trim();
    if (currentFullName !== this.originalUserData.name) {
      modifiedFields.name = currentFullName;
      console.log('📝 Nome modificado:', this.originalUserData.name, '->', currentFullName);
    }

    // Comparar email
    if (formData.email !== this.originalUserData.email) {
      modifiedFields.email = formData.email;
      console.log('📧 Email modificado:', this.originalUserData.email, '->', formData.email);
    }

    // Comparar CPF (remover máscara para comparação)
    const currentCPF = formData.cpf.replace(/\D/g, '');
    const originalCPF = this.originalUserData.cpf.replace(/\D/g, '');
    if (currentCPF !== originalCPF) {
      modifiedFields.cpf = currentCPF;
      console.log('🆔 CPF modificado:', originalCPF, '->', currentCPF);
    }

    // Comparar telefone (remover máscara para comparação)
    const currentPhone = formData.telephone.replace(/\D/g, '');
    const originalPhone = this.originalUserData.telephone.replace(/\D/g, '');
    if (currentPhone !== originalPhone) {
      modifiedFields.telephone = currentPhone;
      console.log('📱 Telefone modificado:', originalPhone, '->', currentPhone);
    }

    // Comparar passaporte
    const currentPassport = formData.passport || '';
    const originalPassport = this.originalUserData.passport || '';
    if (currentPassport !== originalPassport) {
      modifiedFields.passport = formData.passport || null;
      console.log('📔 Passaporte modificado:', originalPassport, '->', currentPassport);
    }

    console.log('🔍 Campos modificados detectados:', modifiedFields);
    return modifiedFields;
  }

  /**
   * Retorna todos os dados do formulário formatados para envio
   */
  getAllFormData(): any {
    const formData = this.profileForm.value;
    return {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      cpf: formData.cpf.replace(/\D/g, ''),
      passport: formData.passport || null,
      telephone: formData.telephone.replace(/\D/g, ''),
      userStatus: this.currentUser?.userStatus || 'ACTIVATED',
      userRole: this.currentUser?.userRole || 'USER'
    };
  }

  onSubmit() {
    if (this.profileForm.valid && !this.isSaving) {
      this.saveProfile();
    } else {
      this.markFormGroupTouched();
      this.notificationService.showWarning(
        'Formulário Inválido',
        'Por favor, corrija os erros nos campos antes de continuar.'
      );
    }
  }

  saveProfile() {
    this.isSaving = true;
    
    // Obter apenas os campos que foram modificados
    const modifiedFields = this.getModifiedFields();
    
    // Verificar se há campos modificados
    if (Object.keys(modifiedFields).length === 0) {
      console.log('ℹ️ Nenhuma alteração detectada');
      this.notificationService.showInfo(
        'Nenhuma Alteração',
        'Não foram detectadas alterações nos seus dados.'
      );
      this.isSaving = false;
      return;
    }

    console.log('📤 Enviando apenas campos modificados:', modifiedFields);

    this.updateUserProfile(this.currentUser.id, modifiedFields)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (response) => {
        console.log('✅ Perfil atualizado com sucesso:', response);
        
        this.notificationService.showSuccess(
          'Perfil Atualizado!',
          'Suas informações foram atualizadas com sucesso.'
        );
        
        // Atualizar dados do usuário no AuthService se necessário
        this.authService.updateCurrentUser(response);
        
        // Recarregar dados do perfil para sincronizar com o backend
        this.loadUserProfile();
        
        this.isSaving = false;
      },
      error: (error) => {
        console.error('❌ Erro ao atualizar perfil:', error);
        
        let errorTitle = 'Erro ao Atualizar Perfil';
        let errorMessage = '';
        
        if (error.status === 409) {
          errorMessage = 'Email ou CPF já estão em uso por outro usuário.';
        } else if (error.status === 400) {
          errorMessage = 'Dados inválidos fornecidos. Verifique os campos e tente novamente.';
        } else if (error.status === 403) {
          errorMessage = 'Você não tem permissão para alterar estes dados.';
        } else {
          errorMessage = 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.';
        }
        
        this.notificationService.showError(errorTitle, errorMessage);
        this.isSaving = false;
      }
    });
  }

  updateUserProfile(userId: number, userData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put(`${this.baseUrl}/users/${userId}`, userData, { headers });
  }

  onCancel() {
    if (this.hasUnsavedChanges()) {
      const modifiedFields = this.getModifiedFieldNames();
      this.notificationService.showInfo(
        'Alterações Canceladas',
        `As alterações nos campos "${modifiedFields.join(', ')}" foram descartadas.`
      );
    }
    
    if (this.currentUser && this.originalUserData) {
      this.populateForm(this.originalUserData); // Restaurar dados originais
    }
  }

  markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.markAsTouched();
    });
  }

  // Métodos de validação para o template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return field ? field.valid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return 'Este campo é obrigatório';
      if (field.errors['email']) return 'Digite um e-mail válido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) {
        if (fieldName === 'telephone') return 'Formato: (11) 99999-9999';
        if (fieldName === 'cpf') return 'Formato: 000.000.000-00';
        if (fieldName === 'passport') return 'Formato inválido de passaporte';
      }
    }
    return '';
  }

  /**
   * Método público para forçar o reload dos dados do perfil
   * Pode ser chamado externamente quando necessário
   */
  refreshProfile(): void {
    console.log('🔄 Refresh manual do perfil solicitado');
    this.loadUserProfile();
  }

  /**
   * Verifica se há alterações pendentes no formulário
   */
  hasUnsavedChanges(): boolean {
    const modifiedFields = this.getModifiedFields();
    return Object.keys(modifiedFields).length > 0;
  }

  /**
   * Retorna uma lista dos campos que foram modificados
   */
  getModifiedFieldNames(): string[] {
    const modifiedFields = this.getModifiedFields();
    const fieldNames: string[] = [];
    
    if (modifiedFields.name) fieldNames.push('Nome');
    if (modifiedFields.email) fieldNames.push('E-mail');
    if (modifiedFields.cpf) fieldNames.push('CPF');
    if (modifiedFields.telephone) fieldNames.push('Telefone');
    if (modifiedFields.passport !== undefined) fieldNames.push('Passaporte');
    
    return fieldNames;
  }
}
