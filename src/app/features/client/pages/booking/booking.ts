import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Navbar } from "../../../../shared/navbar/navbar";
import { Footer } from "../../../../shared/footer/footer";
import { CurrentUser } from './classe/current-user';
import { BookingService } from '@/app/shared/services/booking.service';
import { BundleService } from '@/app/shared/services/bundle-service';
import { BundleClass } from '../bundle/class/bundle-class';
import { AuthService } from '@/app/shared/services/auth.service';
import { NotificationService } from '@/app/shared/services/notification.service';

interface ReservationData {
  id: string;
  bundleId?: number;
  title: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  travelers: number;
  duration: number;
  description: string;
  price: number;
  orderId: string;
  status: string;
}

interface SelectedPackage {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  rating: number;
  startDate: string;
  endDate: string;
  travelers: number;
  duration: number;
  description: string;
  includes: string[];
  basePrice: string;
  extraPrice?: string;
  discount?: string;
  extraServices?: boolean;
  selected: boolean; // Para seleção no checkout
}

interface UserProfile {
  fullName: string;
  birthDate: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
}

interface TravelerInfo {
  fullName: string;
  birthDate: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  editing: boolean;
  
  // Novos campos para a API /api/travelers
  documentNumber: string;
  documentType: 'CPF' | 'PASSPORT';
  age: number;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, Navbar, Footer],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking implements OnInit {

  // Dados da reserva recebidos da navegação
  reservationData: ReservationData | null = null;

  // Dados do pacote selecionado (da API)
  selectedPackageData: SelectedPackage | null = null;

  // Dados do perfil do usuário (carregados do serviço de auth)
  userProfile: UserProfile = {
    fullName: '',
    birthDate: '',
    cpf: '',
    rg: '',
    email: '',
    phone: ''
  };

  // Lista de pacotes no carrinho - adaptado para um único pacote
  packageList: SelectedPackage[] = [
    {
      id: 'pkg-001',
      title: 'Fortaleza - Ceará',
      category: 'OURO',
      imageUrl: '/assets/imgs/fortaleza.jpg',
      rating: 4.8,
      startDate: '15/08/2024',
      endDate: '22/08/2024',
      travelers: 2,
      duration: 7,
      description: 'Explore as belas praias de Fortaleza, com águas cristalinas e paisagens deslumbrantes. Inclui hospedagem, café da manhã e passeios exclusivos.',
      includes: [
        'Hospedagem em hotel 4 estrelas',
        'Café da manhã incluído',
        'Transfer aeroporto-hotel',
        'Passeio de buggy nas dunas',
        'City tour pela cidade',
        'Seguro viagem'
      ],
      basePrice: '2.400,00', // Preço por pessoa
      extraPrice: '200,00',
      discount: '300,00',
      extraServices: true,
      selected: true
    }
  ];

  // Propriedades para dados REAIS da API (igual à página home)
  bundleImageUrl: string = '';
  bundleLocationName: string = '';
  realBundleData: any = null;

  // Lista de viajantes já cadastrados na reserva
  registeredTravelers: any[] = [];

  // Controle de edição dos viajantes cadastrados
  editingRegisteredTravelers: { [travelerId: string]: boolean } = {};

  // Controle de confirmação de exclusão dos viajantes cadastrados
  deletingRegisteredTravelers: { [travelerId: string]: boolean } = {};

  // Informações dos viajantes extras para o pacote único
  travelersInfoByPackage: { [packageId: string]: TravelerInfo[] } = {};
  totalPrice: string = '0,00';
  totalPriceNumeric: number = 0; // Valor total numérico em reais para envio ao backend

  // Propriedade getter para facilitar o acesso ao pacote atual
  get currentPackage(): SelectedPackage {
    // Se temos dados selecionados da API, usar eles
    if (this.selectedPackageData) {
      return this.selectedPackageData;
    }
    return this.packageList[0];
  }

  // Método para definir dados do pacote selecionado da API
  setSelectedPackageData(packageData: any): void {
    // Usar dados do currentBundle se disponível, senão usar os dados passados
    const finalCategory = this.getFinalCategoryFromBundle();
    const finalRating = this.getFinalRatingFromBundle();
    
    // Buscar o melhor título possível
    const packageTitle = packageData.title || 
                        this.currentBundle?.bundleTitle || 
                        this.bundleLocationName ||
                        'Pacote Selecionado';
    
    this.selectedPackageData = {
      id: packageData.id?.toString() || this.currentBundle?.id?.toString() || '1',
      title: packageTitle,
      category: finalCategory,
      imageUrl: packageData.imageUrl || this.currentBundle?.imageUrl || '/assets/imgs/fortaleza.jpg',
      rating: finalRating,
      startDate: packageData.startDate || this.currentBundle?.initialDate || '',
      endDate: packageData.endDate || this.currentBundle?.finalDate || '',
      travelers: packageData.travelers || this.currentBundle?.travelersNumber || 1,
      duration: packageData.duration || 7,
      description: packageData.description || this.currentBundle?.bundleDescription || '',
      includes: packageData.includes || [
        'Hospedagem em hotel 4 estrelas',
        'Café da manhã incluído', 
        'Transfer aeroporto-hotel',
        'Seguro viagem'
      ],
      basePrice: packageData.basePrice || this.currentBundle?.initialPrice?.toString() || '0,00',
      extraPrice: packageData.extraPrice || '0,00',
      discount: packageData.discount || '0,00',
      extraServices: packageData.extraServices || false,
      selected: packageData.selected || true
    };
    
    console.log('✅ Dados do pacote selecionado definidos com rank da API:', this.selectedPackageData);
    console.log('📝 Título definido como:', packageTitle);
    console.log('📊 Rank do bundle:', finalCategory, 'Rating calculado:', finalRating);
  }

  constructor(
    private router: Router,
    private service: BookingService,
    private bundleService: BundleService, 
    private authService: AuthService,
    private notificationService: NotificationService,
    private http: HttpClient
  ) {}

  currentUser: CurrentUser = new CurrentUser();
  currentBundle: BundleClass = new BundleClass();

  ngOnInit(): void {
    console.log('🚀 Iniciando ngOnInit...');
    
    // Carregar dados do perfil do usuário
    this.loadUserProfile();
    
    // Verificar se há dados de reserva vindos da navegação
    const navigationState = this.router.getCurrentNavigation()?.extras?.state || history.state;
    if (navigationState && navigationState['reservationData']) {
      this.reservationData = navigationState['reservationData'];
      console.log('📦 Dados da reserva recebidos:', this.reservationData);
      
      // AGORA que temos os dados da reserva, carregar viajantes já cadastrados
      this.loadRegisteredTravelers();
      
      // Se temos bundleId, buscar dados REAIS da API (igual à página home)
      if (this.reservationData && this.reservationData.bundleId) {
        console.log('🔍 BundleId encontrado, buscando dados REAIS da API:', this.reservationData.bundleId);
        this.loadRealBundleData(this.reservationData.bundleId);
      } else {
        console.log('⚠️ Sem bundleId, usando dados da reserva com rating/rank mockados');
        this.populatePackageFromReservation();
        this.initializeTravelersForCurrentPackage();
        this.calculateTotalPrice();
        this.loadBookingData();
        
        // IMPORTANTE: Carregar viajantes já cadastrados na reserva
        this.loadRegisteredTravelers();
      }
      return; // Sair aqui para evitar outras requisições desnecessárias
    }

    // Só fazer as requisições se NÃO tiver dados de reserva
    console.log('📡 Carregando dados do usuário e bundle...');
    
    // 1. Pega o id do usuário autenticado
    const userId = this.authService.currentUser.userId;
    // 2. Busca os dados completos do usuário
    this.service.getCurrentUser(userId).subscribe({
      next: (user) => {
        this.currentUser = user;
        console.log('👤 Usuário carregado:', user);
        
        // 3. Busca o bundle pelo bundleId do usuário
        if (user.bundleId) {
          this.bundleService.getBundleById(user.bundleId).subscribe({
            next: (bundle) => {
              this.currentBundle = bundle;
              console.log('🔗 Bundle carregado da API:', bundle);
              
              // Usar dados do bundle para criar o pacote com rank correto
              this.setSelectedPackageData({});
              
              // Inicializa dependências após os dados estarem carregados
              this.initializeTravelersForCurrentPackage();
              this.calculateTotalPrice();
              this.loadBookingData();
            },
            error: (error) => {
              console.error('❌ Erro ao carregar bundle:', error);
              this.initializeTravelersForCurrentPackage();
              this.calculateTotalPrice();
              this.loadBookingData();
            }
          });
        } else {
          console.log('⚠️ Usuário sem bundleId');
          this.initializeTravelersForCurrentPackage();
          this.calculateTotalPrice();
          this.loadBookingData();
        }
      },
      error: (error) => {
        console.error('❌ Erro ao carregar usuário:', error);
        this.initializeTravelersForCurrentPackage();
        this.calculateTotalPrice();
        this.loadBookingData();
      }
    });
  }

  // Método para preencher os dados do pacote com base na reserva
  populatePackageFromReservation(): void {
    if (!this.reservationData) return;

    console.log('🔄 Preenchendo dados do pacote com informações da reserva da API...');
    console.log('📋 Dados recebidos da API:', this.reservationData);
    
    // Formatear datas para o formato esperado (DD/MM/YYYY)
    const formatDate = (dateString: string): string => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (error) {
        console.warn('Erro ao formatar data:', dateString);
        return dateString;
      }
    };

    // Usar dados reais da API ao invés de valores fixos
    const apiData = this.reservationData as any;
    
    // Atualizar o packageList com os dados REAIS da reserva
    this.packageList = [{
      id: apiData.id || this.reservationData.id,
      title: apiData.title || this.reservationData.title,
      category: apiData.category || 'GOLD', // Será recalculado baseado no rating
      imageUrl: apiData.imageUrl || this.reservationData.imageUrl || '/assets/imgs/fortaleza.jpg',
      rating: apiData.rating || 4.5, // ESTE É O VALOR PRINCIPAL
      startDate: apiData.startDate || formatDate(this.reservationData.startDate),
      endDate: apiData.endDate || formatDate(this.reservationData.endDate),
      travelers: apiData.travelers || this.reservationData.travelers,
      duration: apiData.duration || this.reservationData.duration,
      description: apiData.description || this.reservationData.description || 'Pacote de viagem selecionado',
      includes: apiData.includes || [
        'Hospedagem em hotel 4 estrelas',
        'Café da manhã incluído',
        'Transfer aeroporto-hotel',
        'Seguro viagem'
      ],
      basePrice: apiData.basePrice || this.formatPrice(this.reservationData.price),
      extraPrice: apiData.extraPrice || '0,00',
      discount: apiData.discount || '0,00',
      extraServices: apiData.extraServices || false,
      selected: apiData.selected !== undefined ? apiData.selected : true
    }];

    const finalRating = this.packageList[0].rating;
    const calculatedRank = this.getRankFromRating(finalRating);

    console.log('✅ Dados do pacote atualizados com informações da API:', this.packageList[0]);
    console.log('⭐ Rating da API:', finalRating);
    console.log('🏷️ Rank calculado pelo rating:', calculatedRank);
    console.log('📊 Conversão: Rating', finalRating, '→ Rank', calculatedRank);
  }

  // Método auxiliar para formatar preços
  private formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  showCurrentUser(): void {
    console.log('👤 Dados do usuário atual:', this.currentUser);
    console.log('📦 Dados do pacote atual:', this.currentPackage);
    console.log('🎯 Rank final detectado:', this.getFinalCategoryFromBundle());
    console.log('⭐ Rating final detectado:', this.getFinalRatingFromBundle());
  } 

  getLoggedUser() {
    this.service.getCurrentUser(this.currentUser.userId).subscribe(res => {
      this.currentUser = res;
     
    });
  }

  getLoggedBundle() {
    const id = this.currentUser.bundleId;
    this.bundleService.getBundleById(id)
    .subscribe(res => this.currentBundle = res)
  }

  initializeTravelersForCurrentPackage(): void {
    this.initializeTravelersForPackage(this.currentPackage.id, this.currentPackage.travelers);
  }

  initializeTravelersForAllPackages(): void {
    this.packageList.forEach(pkg => {
      this.initializeTravelersForPackage(pkg.id, pkg.travelers);
    });
  }

  initializeTravelersForPackage(packageId: string, travelerCount: number): void {
    this.travelersInfoByPackage[packageId] = [];
    
    // Se é apenas 1 viajante, usar dados do perfil do usuário
    if (travelerCount === 1) {
      return; // Não precisa inicializar viajantes extras
    }

    // A partir de 2 viajantes, criar viajantes extras (travelerCount - 1)
    for (let i = 1; i < travelerCount; i++) {
      this.travelersInfoByPackage[packageId].push({
        fullName: '',
        birthDate: '',
        cpf: '',
        rg: '',
        email: '',
        phone: '',
        editing: false,
        // Novos campos para a API
        documentNumber: '',
        documentType: 'CPF',
        age: 0
      });
    }
  }

  editTraveler(index: number): void {
    this.travelersInfoByPackage[this.currentPackage.id][index].editing = true;
  }

  saveTraveler(index: number): void {
    const traveler = this.travelersInfoByPackage[this.currentPackage.id][index];
    
    // Validar se todos os campos obrigatórios estão preenchidos
    if (!traveler.fullName || !traveler.documentNumber || !traveler.documentType || !traveler.age) {
      this.notificationService.showWarning('Campos obrigatórios', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Obter o ID da reserva
    const reservationId = this.reservationData?.id;
    if (!reservationId) {
      this.notificationService.showError('Erro', 'ID da reserva não encontrado');
      return;
    }

    // Preparar dados para envio à API
    const travelerData = {
      fullName: traveler.fullName,
      documentNumber: traveler.documentNumber,
      documentType: traveler.documentType,
      age: traveler.age,
      reservationId: parseInt(reservationId) // Converter para número se necessário
    };

    console.log('📝 Enviando viajante para API:', travelerData);

    // Fazer requisição POST para /api/travelers
    this.http.post<any>('http://localhost:8080/api/travelers', travelerData).subscribe({
      next: (response) => {
        console.log('✅ Viajante adicionado com sucesso:', response);
        
        // Atualizar o estado local
        traveler.editing = false;
        
        // Recarregar a lista de viajantes cadastrados
        this.loadRegisteredTravelers();
        
        // Mostrar notificação de sucesso
        this.notificationService.showSuccess(
          'Viajante adicionado!', 
          `${traveler.fullName} foi adicionado à reserva com sucesso`
        );
      },
      error: (error) => {
        console.error('❌ Erro ao adicionar viajante:', error);
        this.notificationService.showError(
          'Erro ao adicionar viajante', 
          'Não foi possível adicionar o viajante à reserva. Tente novamente.'
        );
      }
    });
  }

  cancelEdit(index: number): void {
    this.travelersInfoByPackage[this.currentPackage.id][index].editing = false;
    // Restaurar dados originais se necessário
  }

  /**
   * Inicia a edição de um viajante já cadastrado na reserva
   */
  editRegisteredTraveler(traveler: any): void {
    this.editingRegisteredTravelers[traveler.id] = true;
    console.log('✏️ Iniciando edição do viajante cadastrado:', traveler);
  }

  /**
   * Atualiza um viajante já cadastrado na reserva usando PUT /api/travelers/{id}
   */
  updateRegisteredTraveler(traveler: any): void {
    // Validar se todos os campos obrigatórios estão preenchidos
    if (!traveler.fullName || !traveler.documentNumber || !traveler.documentType || !traveler.age) {
      this.notificationService.showWarning('Campos obrigatórios', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Preparar dados para envio à API (sem alterar o reservationId)
    const travelerData = {
      fullName: traveler.fullName,
      documentNumber: traveler.documentNumber,
      documentType: traveler.documentType,
      age: traveler.age,
      reservationId: traveler.reservationId // Manter o reservationId original
    };

    console.log('📝 Atualizando viajante cadastrado ID:', traveler.id);
    console.log('📋 Dados para atualização:', travelerData);

    // Fazer requisição PUT para /api/travelers/{id}
    this.http.put<any>(`http://localhost:8080/api/travelers/${traveler.id}`, travelerData).subscribe({
      next: (response) => {
        console.log('✅ Viajante atualizado com sucesso:', response);
        
        // Parar o modo de edição
        this.editingRegisteredTravelers[traveler.id] = false;
        
        // Recarregar a lista de viajantes cadastrados para refletir as mudanças
        this.loadRegisteredTravelers();
        
        // Mostrar notificação de sucesso
        this.notificationService.showSuccess(
          'Usuário editado com sucesso', 
          `Os dados de ${traveler.fullName} foram atualizados com sucesso`
        );
      },
      error: (error) => {
        console.error('❌ Erro ao atualizar viajante:', error);
        this.notificationService.showError(
          'Erro ao atualizar viajante', 
          'Não foi possível atualizar os dados do viajante. Tente novamente.'
        );
      }
    });
  }

  /**
   * Cancela a edição de um viajante já cadastrado
   */
  cancelEditRegisteredTraveler(traveler: any): void {
    this.editingRegisteredTravelers[traveler.id] = false;
    
    // Recarregar os dados originais para desfazer as alterações
    this.loadRegisteredTravelers();
    
    console.log('❌ Edição cancelada para o viajante:', traveler.fullName);
  }

  /**
   * Ativa o modo de confirmação de exclusão no card do viajante
   */
  deleteRegisteredTraveler(traveler: any): void {
    console.log('🗑️ Ativando modo de confirmação de exclusão para:', traveler.fullName);
    
    // Ativar modo de confirmação de exclusão para este viajante
    this.deletingRegisteredTravelers[traveler.id] = true;
    
    // Desativar modo de edição se estiver ativo
    this.editingRegisteredTravelers[traveler.id] = false;
  }

  /**
   * Cancela o modo de confirmação de exclusão
   */
  cancelDeleteRegisteredTraveler(traveler: any): void {
    console.log('❌ Cancelando exclusão do viajante:', traveler.fullName);
    this.deletingRegisteredTravelers[traveler.id] = false;
  }

  /**
   * Confirma e executa a exclusão do viajante
   */
  confirmDeleteRegisteredTraveler(traveler: any): void {
    console.log('🗑️ Confirmando exclusão do viajante:', traveler.fullName);
    
    // Desativar modo de confirmação
    this.deletingRegisteredTravelers[traveler.id] = false;
    
    // Executar a exclusão
    this.executeDeleteTraveler(traveler);
  }

  /**
   * Executa a exclusão do viajante na API
   */
  private executeDeleteTraveler(traveler: any): void {
    console.log('🗑️ Deletando viajante cadastrado ID:', traveler.id);
    console.log('👤 Viajante a ser deletado:', traveler);

    // Fazer requisição DELETE para /api/travelers/{id}
    this.http.delete<any>(`http://localhost:8080/api/travelers/${traveler.id}`).subscribe({
      next: (response) => {
        console.log('✅ Viajante deletado com sucesso:', response);
        
        // Recarregar a lista de viajantes cadastrados para refletir a exclusão
        this.loadRegisteredTravelers();
        
        // Mostrar notificação de sucesso personalizada
        this.showDeleteSuccessNotification(traveler.fullName);
      },
      error: (error) => {
        console.error('❌ Erro ao deletar viajante:', error);
        this.notificationService.showError(
          'Erro ao remover viajante', 
          'Não foi possível remover o viajante da reserva. Tente novamente.'
        );
      }
    });
  }

  /**
   * Exibe confirmação personalizada para exclusão de viajante
   */
  private showDeleteConfirmation(traveler: any): void {
    // Remover qualquer modal anterior que possa existir
    const existingModal = document.querySelector('.delete-confirmation-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Evitar scroll do body enquanto modal está aberto
    document.body.classList.add('modal-open');

    // Criar elemento do modal de confirmação com melhor estrutura
    const modal = document.createElement('div');
    modal.className = 'delete-confirmation-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0'; 
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '999999';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    modal.innerHTML = `
      <div class="delete-confirmation-overlay"></div>
      <div class="delete-confirmation-content">
        <div class="delete-confirmation-header">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Confirmar Exclusão</h3>
        </div>
        <div class="delete-confirmation-body">
          <p>Tem certeza que deseja remover <strong>${traveler.fullName}</strong> da reserva?</p>
          <p class="warning-text">Esta ação não pode ser desfeita.</p>
        </div>
        <div class="delete-confirmation-actions">
          <button class="btn-confirm-delete" data-action="confirm">
            <i class="fas fa-trash"></i>
            Sim, Remover
          </button>
          <button class="btn-cancel-delete" data-action="cancel">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
        </div>
      </div>
    `;

    // Adicionar modal ao body no final da árvore DOM
    document.body.appendChild(modal);
    console.log('🎭 Modal de confirmação criado e adicionado ao DOM:', modal);
    console.log('📍 Posição do modal no DOM:', modal.getBoundingClientRect());

    // Garantir que o modal seja renderizado usando requestAnimationFrame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Forçar reflow para garantir que o elemento seja renderizado
        modal.offsetHeight;
        console.log('🔄 Forçando reflow do modal');
        
        // Verificar se o modal está sendo exibido corretamente
        const computedStyle = window.getComputedStyle(modal);
        console.log('🎨 Estilos computados do modal:', {
          position: computedStyle.position,
          zIndex: computedStyle.zIndex,
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          opacity: computedStyle.opacity
        });
      });
    });

    // Adicionar event listeners
    const confirmBtn = modal.querySelector('.btn-confirm-delete') as HTMLElement;
    const cancelBtn = modal.querySelector('.btn-cancel-delete') as HTMLElement;
    const overlay = modal.querySelector('.delete-confirmation-overlay') as HTMLElement;

    console.log('🔍 Elementos do modal encontrados:', { confirmBtn, cancelBtn, overlay });

    const handleConfirm = () => {
      this.confirmDeleteTraveler(traveler);
      this.closeDeleteModal(modal);
    };

    const handleCancel = () => {
      console.log('❌ Exclusão cancelada pelo usuário');
      this.closeDeleteModal(modal);
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    overlay.addEventListener('click', handleCancel);

    // Adicionar classe para animação com delay maior
    setTimeout(() => {
      modal.classList.add('show');
      console.log('✨ Modal de confirmação exibido com classe "show"');
      console.log('🔧 Posição após mostrar:', modal.getBoundingClientRect());
    }, 50);
  }

  /**
   * Confirma e executa a exclusão do viajante
   */
  private confirmDeleteTraveler(traveler: any): void {
    console.log('🗑️ Deletando viajante cadastrado ID:', traveler.id);
    console.log('👤 Viajante a ser deletado:', traveler);

    // Fazer requisição DELETE para /api/travelers/{id}
    this.http.delete<any>(`http://localhost:8080/api/travelers/${traveler.id}`).subscribe({
      next: (response) => {
        console.log('✅ Viajante deletado com sucesso:', response);
        
        // Recarregar a lista de viajantes cadastrados para refletir a exclusão
        this.loadRegisteredTravelers();
        
        // Mostrar notificação de sucesso personalizada
        this.showDeleteSuccessNotification(traveler.fullName);
      },
      error: (error) => {
        console.error('❌ Erro ao deletar viajante:', error);
        this.notificationService.showError(
          'Erro ao remover viajante', 
          'Não foi possível remover o viajante da reserva. Tente novamente.'
        );
      }
    });
  }

  /**
   * Fecha o modal de confirmação de exclusão
   */
  private closeDeleteModal(modal: HTMLElement): void {
    // Restaurar scroll do body
    document.body.classList.remove('modal-open');
    
    modal.classList.remove('show');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }

  /**
   * Exibe notificação de sucesso personalizada após exclusão
   */
  private showDeleteSuccessNotification(travelerName: string): void {
    // Criar elemento da notificação de sucesso com overlay
    const notification = document.createElement('div');
    notification.className = 'delete-success-notification';
    notification.innerHTML = `
      <div class="delete-success-overlay"></div>
      <div class="delete-success-content">
        <div class="delete-success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="delete-success-text">
          <h4>Viajante Removido!</h4>
          <p><strong>${travelerName}</strong> foi removido da reserva com sucesso</p>
        </div>
      </div>
    `;

    // Adicionar notificação ao body
    document.body.appendChild(notification);

    // Mostrar com animação
    setTimeout(() => notification.classList.add('show'), 10);

    // Remover após 5 segundos com clique no overlay
    const overlay = notification.querySelector('.delete-success-overlay') as HTMLElement;
    const autoHide = setTimeout(() => {
      this.hideDeleteSuccessNotification(notification);
    }, 5000);

    // Permitir fechar clicando no overlay
    overlay.addEventListener('click', () => {
      clearTimeout(autoHide);
      this.hideDeleteSuccessNotification(notification);
    });
  }

  /**
   * Oculta a notificação de sucesso com animação
   */
  private hideDeleteSuccessNotification(notification: HTMLElement): void {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 400);
  }

  allTravelersCompleted(): boolean {
    // Se é 1 viajante, sempre está completo (usa perfil do usuário)
    if (this.currentPackage.travelers === 1) {
      return true;
    }

    // Para múltiplos viajantes, verificar se todos os extras estão preenchidos
    const travelers = this.travelersInfoByPackage[this.currentPackage.id] || [];
    return travelers.every(traveler => {
      return traveler.fullName &&
             traveler.documentNumber &&
             traveler.documentType &&
             traveler.age > 0;
    });
  }

  updateTravelerCount(newCount: number): void {
    // Obter informações necessárias para o cálculo
    const maxTravelers = this.getMaxTravelers();
    const registeredCount = this.registeredTravelers.length;
    const titularCount = 1; // Sempre há 1 titular (usuário logado)
    const totalOccupied = titularCount + registeredCount;
    const availableSlots = Math.max(0, maxTravelers - totalOccupied);
    
    // O newCount representa o total de viajantes desejado (incluindo titular)
    // Mas precisamos considerar que já temos viajantes cadastrados
    
    if (newCount < 1) {
      console.log('⚠️ Não é possível ter menos de 1 viajante');
      this.notificationService.showWarning('Limite mínimo', 'Número mínimo de viajantes é 1');
      newCount = 1;
    }
    
    // Verificar se o total solicitado excede o máximo permitido
    if (newCount > maxTravelers) {
      console.log(`🚫 LIMITE ULTRAPASSADO! Solicitado: ${newCount}, Máximo: ${maxTravelers}`);
      this.notificationService.showWarning('Limite máximo', `Este pacote permite no máximo ${maxTravelers} viajantes`);
      newCount = maxTravelers;
    }
    
    // Verificar se já atingimos o limite com os viajantes cadastrados
    if (totalOccupied >= maxTravelers) {
      console.log(`⚠️ Limite já atingido! Cadastrados: ${totalOccupied}, Máximo: ${maxTravelers}`);
      this.notificationService.showWarning(
        'Limite atingido', 
        `Você já possui ${totalOccupied} viajante(s) cadastrado(s). O máximo para este pacote é ${maxTravelers}.`
      );
      newCount = totalOccupied;
    }

    // Atualizar o currentPackage e reinicializar viajantes
    this.currentPackage.travelers = newCount;
    console.log(`✅ Contagem de viajantes definida para: ${newCount}`);
    
    // Reinicializar formulários de viajantes baseado nos slots disponíveis reais
    const newAvailableSlots = Math.max(0, newCount - totalOccupied);
    this.initializeTravelersBasedOnAvailableSlots(newAvailableSlots);
    this.calculateTotalPrice();
  }

  getMaxTravelers(): number {
    // Tentar obter o limite do currentBundle primeiro
    let maxTravelers = this.currentBundle?.travelersNumber;
    
    // Se não encontrar no currentBundle, tentar no realBundleData
    if (!maxTravelers && this.realBundleData) {
      maxTravelers = this.realBundleData.travelersNumber || 
                    this.realBundleData.maxTravelers || 
                    this.realBundleData.travelers ||
                    this.realBundleData.maxViajantes ||
                    this.realBundleData.numeroViajantes;
    }
    
    // Se ainda não encontrar, usar fallback de 10
    if (!maxTravelers || maxTravelers <= 0) {
      maxTravelers = 10;
      console.log('⚠️ Usando fallback de 10 viajantes - campo não encontrado na API');
    }
    
    return maxTravelers;
  }

  // Função removida já que não trabalhamos mais com seleção múltipla
  // togglePackageSelection(packageId: string): void {
  //   const pkg = this.packageList.find(p => p.id === packageId);
  //   if (pkg) {
  //     pkg.selected = !pkg.selected;
  //     this.calculateTotalPrice();
  //   }
  // }

  getSelectedPackages(): SelectedPackage[] {
    return [this.currentPackage]; // Sempre retorna apenas o pacote atual
  }

  getFormattedBasePrice(pkg: SelectedPackage): string {
    const basePricePerPerson = parseFloat(pkg.basePrice.replace(/[.,]/g, '')) / 100;
    // Usar o número real de viajantes (titular + cadastrados)
    const totalTravelers = this.getTotalOccupiedSlots();
    const totalBasePrice = basePricePerPerson * totalTravelers;
    
    return totalBasePrice.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  getFormattedBundlePrice(): string {
    if (!this.currentBundle || !this.currentBundle.initialPrice) {
      return '0,00';
    }
    
    const totalPrice = this.currentBundle.initialPrice * this.currentBundle.travelersNumber;
    return totalPrice.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Método para traduzir rank para português
  getRankInPortuguese(category: string): string {
    const rankTranslations: { [key: string]: string } = {
      'GOLD': 'Ouro',
      'SILVER': 'Prata', 
      'BRONZE': 'Bronze',
      'PLATINUM': 'Platina',
      'OURO': 'Ouro',
      'PRATA': 'Prata',
      'PLATINA': 'Platina'
    };
    
    return rankTranslations[category?.toUpperCase()] || category || 'Básico';
  }

  // Método para obter classe CSS do rank
  getRankClass(category: string): string {
    const rankClasses: { [key: string]: string } = {
      'GOLD': 'rank-gold',
      'SILVER': 'rank-silver',
      'BRONZE': 'rank-bronze', 
      'PLATINUM': 'rank-platinum',
      'OURO': 'rank-gold',
      'PRATA': 'rank-silver',
      'PLATINA': 'rank-platinum'
    };
    
    return rankClasses[category?.toUpperCase()] || '';
  }

  // Método para formatar rating como número inteiro
  getIntegerRating(rating: number): number {
    return Math.round(rating || 4);
  }

  // Método para obter avaliação baseada no rank (mesma lógica das outras páginas)
  private getEvaluationByRank(rank: string): number {
    const rankEvaluations: { [key: string]: number } = {
      'BRONZE': 3.2,
      'SILVER': 3.8,
      'GOLD': 4.3,
      'PLATINUM': 4.9,
      // Manter as versões em português para compatibilidade
      'Bronze': 3.2,
      'Prata': 3.8,
      'Ouro': 4.3,
      'Platina': 4.9
    };
    return rankEvaluations[rank] || 3.0;
  }

  // Método de avaliação consistente (mesmo usado nas outras páginas)
  private getRatingFromRankConsistent(rank: string, bundleId: number): number {
    switch (rank.toUpperCase()) {
      case 'BRONZE': return 1;
      case 'SILVER': 
      case 'PRATA': return 2;
      case 'GOLD': 
      case 'OURO': return 3;
      case 'PLATINUM': 
      case 'PLATINA': 
        return (bundleId % 2 === 0) ? 4 : 5;
      default: return 3;
    }
  }

  // Método INVERSO: rating → rank (mesmo padrão das outras páginas)
  private getRankFromRating(rating: number): string {
    const roundedRating = Math.round(rating);
    switch (roundedRating) {
      case 1: return 'BRONZE';
      case 2: return 'SILVER';
      case 3: return 'GOLD';
      case 4:
      case 5: return 'PLATINUM';
      default: return 'GOLD'; // Padrão
    }
  }

  // Método para obter rating final baseado nos dados da API
  getFinalRatingFromBundle(): number {
    // 1. Prioridade: Se temos dados do currentPackage (vindos da API via navegação)
    if (this.selectedPackageData && this.selectedPackageData.rating) {
      return Math.round(this.selectedPackageData.rating);
    }
    
    // 2. Se temos dados do packageList (vindos da reserva)
    if (this.packageList && this.packageList[0] && this.packageList[0].rating) {
      return Math.round(this.packageList[0].rating);
    }
    
    // 3. Se temos dados do bundle carregado, calcular rating pelo rank
    if (this.currentBundle && this.currentBundle.bundleRank && this.currentBundle.id) {
      return this.getRatingFromRankConsistent(this.currentBundle.bundleRank, this.currentBundle.id);
    }
    
    return 4; // Valor padrão
  }

  // Método para obter category final baseado no RATING (padrão das outras páginas)
  getFinalCategoryFromBundle(): string {
    // 1. Prioridade: Se temos rating, calcular rank baseado no rating
    let finalRating = 0;
    
    // Obter rating de qualquer fonte disponível
    if (this.selectedPackageData && this.selectedPackageData.rating) {
      finalRating = this.selectedPackageData.rating;
    } else if (this.packageList && this.packageList[0] && this.packageList[0].rating) {
      finalRating = this.packageList[0].rating;
    } else if (this.currentBundle && this.currentBundle.bundleRank && this.currentBundle.id) {
      finalRating = this.getRatingFromRankConsistent(this.currentBundle.bundleRank, this.currentBundle.id);
    }
    
    // Se temos rating, calcular rank baseado nele (PADRÃO DAS OUTRAS PÁGINAS)
    if (finalRating > 0) {
      const calculatedRank = this.getRankFromRating(finalRating);
      return calculatedRank;
    }
    
    // 2. Fallback: Usar category/rank direto se disponível
    if (this.selectedPackageData && this.selectedPackageData.category) {
      return this.selectedPackageData.category;
    }
    
    if (this.packageList && this.packageList[0] && this.packageList[0].category) {
      return this.packageList[0].category;
    }
    
    if (this.currentBundle && this.currentBundle.bundleRank) {
      return this.currentBundle.bundleRank;
    }
    
    return 'GOLD'; // Valor padrão
  }

  calculateTotalPrice(): void {
    const pkg = this.currentPackage;
    const basePricePerPerson = parseFloat(pkg.basePrice.replace(/[.,]/g, '')) / 100;
    
    // IMPORTANTE: Calcular preço baseado no número REAL de viajantes
    // Titular (1) + Viajantes já cadastrados na reserva
    const realTravelerCount = this.getTotalOccupiedSlots();
    
    // Calcular total baseado no número real de viajantes
    let total = basePricePerPerson * realTravelerCount;
    
    let extraPrice = pkg.extraServices ?
      parseFloat(pkg.extraPrice?.replace(/[.,]/g, '') || '0') / 100 : 0;
    let discount = parseFloat(pkg.discount?.replace(/[.,]/g, '') || '0') / 100;

    total += extraPrice - discount;

    // Armazenar o valor total numérico para envio ao backend (em reais)
    this.totalPriceNumeric = Math.round(total * 100) / 100; // Arredondar para 2 casas decimais
    
    // Formatar para exibição na interface
    this.totalPrice = total.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }  

  loadBookingData(): void {
    // Simular carregamento de dados do backend
    console.log('Loading booking data from backend...');

    // Aqui você pode fazer uma chamada para o service
    // this.bookingService.getSelectedPackage().subscribe(data => {
    //   this.selectedPackage = data;
    //   this.initializeTravelers();
    // });
  }

  goToPayment(): void {
    if (!this.allTravelersCompleted()) {
      alert('Por favor, preencha todos os dados dos viajantes que você adicionou antes de continuar.');
      return;
    }

    // Obter o ID da reserva
    const reservationId = this.reservationData?.id;
    if (!reservationId) {
      alert('Erro: ID da reserva não encontrado. Não é possível prosseguir com o pagamento.');
      return;
    }

    const bookingData = {
      package: this.currentPackage,
      userProfile: this.userProfile,
      travelersInfo: this.travelersInfoByPackage[this.currentPackage.id] || [],
      registeredTravelers: this.registeredTravelers,
      totalPrice: this.totalPrice, // Valor formatado para exibição
      totalPriceNumeric: this.totalPriceNumeric, // Valor numérico em reais para API
      reservationId: parseInt(reservationId), // ID da reserva para o pagamento
      bookingDate: new Date().toISOString()
    };

    console.log('💳 Navegando para pagamento com dados completos:', bookingData);
    console.log('🔢 ID da reserva:', reservationId);

    // Navegar para a página de pagamento
    this.router.navigate(['/payment'], {
      state: { bookingData: bookingData }
    });
  }

  // NOVOS MÉTODOS: Carregar dados REAIS da API (baseado na lógica da página home)
  
  // MÉTODO: Carregar dados REAIS da API baseado no bundleId
  private loadRealBundleData(bundleId: number): void {
    console.log('🌐 Carregando dados reais do bundle:', bundleId);
    
    this.bundleService.getBundleById(bundleId.toString()).subscribe({
      next: (bundle) => {
        console.log('✅ Bundle carregado da API:', bundle);
        this.realBundleData = bundle;
        
        // Carregar imagem e localização em paralelo
        Promise.all([
          this.loadBundleImage(bundleId),
          this.loadBundleLocation(bundleId)
        ]).then(() => {
          // Após carregar tudo, popular o pacote com dados REAIS + rating/rank mockados
          this.populatePackageFromRealBundle(bundle);
        });
      },
      error: (error) => {
        console.error('❌ Erro ao carregar bundle da API:', error);
        // Fallback: usar dados da reserva
        this.populatePackageFromReservation();
        this.initializeTravelersForCurrentPackage();
        this.calculateTotalPrice();
        this.loadBookingData();
      }
    });
  }

  // MÉTODO: Carregar imagem do bundle (igual à página home)
  private loadBundleImage(bundleId: number): Promise<string> {
    return new Promise((resolve) => {
      this.bundleService.getBundleImage(bundleId).subscribe({
        next: (mediaResponse) => {
          let mediaData = Array.isArray(mediaResponse) ? mediaResponse[0] : mediaResponse;
          
          if (mediaData && mediaData.mediaUrl) {
            this.bundleImageUrl = `http://localhost:8080${mediaData.mediaUrl}`;
            console.log('🖼️ Imagem do bundle carregada:', this.bundleImageUrl);
          } else {
            this.bundleImageUrl = '/assets/imgs/fortaleza.jpg';
            console.log('🖼️ Usando imagem padrão');
          }
          resolve(this.bundleImageUrl);
        },
        error: (error) => {
          console.error('❌ Erro ao carregar imagem:', error);
          this.bundleImageUrl = '/assets/imgs/fortaleza.jpg';
          resolve(this.bundleImageUrl);
        }
      });
    });
  }

  // MÉTODO: Carregar localização do bundle (igual à página home)
  private loadBundleLocation(bundleId: number): Promise<string> {
    return new Promise((resolve) => {
      this.bundleService.getBundleLocation(bundleId).subscribe({
        next: (locationResponse) => {
          if (locationResponse && locationResponse.length > 0) {
            const location = locationResponse[0];
            // Usar destination.city ou departure.city como nome da localização
            this.bundleLocationName = location.destination?.city || location.departure?.city || 'Destino Incrível';
            console.log('📍 Localização do bundle carregada:', this.bundleLocationName);
          } else {
            this.bundleLocationName = 'Destino Incrível';
            console.log('📍 Usando localização padrão');
          }
          resolve(this.bundleLocationName);
        },
        error: (error) => {
          console.error('❌ Erro ao carregar localização:', error);
          this.bundleLocationName = 'Destino Incrível';
          resolve(this.bundleLocationName);
        }
      });
    });
  }

  // MÉTODO: Popular pacote com dados REAIS da API + rating/rank mockados
  private populatePackageFromRealBundle(bundle: any): void {
    console.log('📋 Populando pacote com dados REAIS da API:', bundle);
    
    // Calcular rating mockado baseado no rank (igual à página home)
    const mockRating = this.getRatingFromRankConsistent(bundle.bundleRank, bundle.id);
    console.log('⭐ Rating mockado calculado:', mockRating, 'baseado no rank:', bundle.bundleRank);
    
    // Buscar o melhor título possível
    const packageTitle = bundle.bundleTitle || 
                        bundle.bundleName || 
                        this.bundleLocationName || 
                        (this.reservationData ? this.reservationData.title : null) || 
                        'Pacote Incrível';
    
    console.log('📝 Título do pacote definido como:', packageTitle);
    
    this.packageList = [{
      id: bundle.id.toString(),
      title: packageTitle,
      category: bundle.bundleRank, // Rank REAL da API
      imageUrl: this.bundleImageUrl || '/assets/imgs/fortaleza.jpg',
      rating: mockRating, // Rating MOCKADO baseado no rank
      startDate: this.reservationData ? this.reservationData.startDate : '15/08/2024',
      endDate: this.reservationData ? this.reservationData.endDate : '22/08/2024',
      travelers: this.reservationData ? this.reservationData.travelers : 1,
      duration: bundle.duration || (this.reservationData ? this.reservationData.duration : 7),
      description: bundle.bundleDescription || bundle.description || (this.reservationData ? this.reservationData.description : 'Pacote de viagem incrível com tudo incluso'),
      includes: [
        'Hospedagem em hotel 4 estrelas',
        'Café da manhã incluído', 
        'Transfer aeroporto-hotel',
        'Seguro viagem'
      ],
      basePrice: this.formatPrice(bundle.bundlePrice || bundle.initialPrice || (this.reservationData ? this.reservationData.price : 2000)),
      extraPrice: '0,00',
      discount: '0,00',
      extraServices: false,
      selected: true
    }];

    this.selectedPackageData = this.packageList[0];
    
    // ✅ IMPORTANTE: Atualizar currentBundle com os dados REAIS da API
    this.currentBundle = {
      id: bundle.id,
      bundleTitle: packageTitle,
      bundleDescription: bundle.bundleDescription || bundle.description || '',
      initialPrice: bundle.bundlePrice || bundle.initialPrice || 0,
      bundleRank: bundle.bundleRank || '',
      initialDate: this.reservationData ? this.reservationData.startDate : '',
      finalDate: this.reservationData ? this.reservationData.endDate : '',
      quantity: bundle.quantity || 1,
      // ✅ Tentar diferentes nomes do campo de viajantes máximos
      travelersNumber: bundle.travelersNumber || bundle.maxTravelers || bundle.travelers || bundle.maxViajantes || bundle.numeroViajantes || 10,
      bundleStatus: bundle.bundleStatus || 'active',
      imageUrl: this.bundleImageUrl || '/assets/imgs/fortaleza.jpg',
      departureCity: bundle.departureCity || '',
      departureState: bundle.departureState || '',
      destinationCity: bundle.destinationCity || '',
      destinationState: bundle.destinationState || ''
    };
    
    console.log('🔄 currentBundle atualizado com dados REAIS:', this.currentBundle);
    console.log('👥 Número máximo de viajantes permitido:', this.currentBundle.travelersNumber);
    console.log('🔍 Campos possíveis do bundle da API:', {
      travelersNumber: bundle.travelersNumber,
      maxTravelers: bundle.maxTravelers,
      travelers: bundle.travelers,
      maxViajantes: bundle.maxViajantes,
      numeroViajantes: bundle.numeroViajantes,
      bundle: bundle // Todo o objeto para análise
    });
    
    console.log('✅ Pacote populado com dados REAIS da API:');
    console.log('📄 Título REAL:', this.bundleLocationName);
    console.log('🏷️ Rank REAL:', bundle.bundleRank);
    console.log('⭐ Rating MOCKADO:', mockRating);
    console.log('🖼️ Imagem REAL:', this.bundleImageUrl);
    console.log('📍 Localização REAL:', this.bundleLocationName);
    console.log('💰 Preço REAL:', bundle.bundlePrice);
    console.log('👥 Viajantes máximo REAL:', this.currentBundle.travelersNumber);
    
    this.initializeTravelersForCurrentPackage();
    this.calculateTotalPrice();
    this.loadBookingData();
    
    // IMPORTANTE: Carregar viajantes já cadastrados na reserva após carregar dados reais
    this.loadRegisteredTravelers();
  }

  /**
   * Carrega os dados do perfil do usuário autenticado da API
   */
  private loadUserProfile(): void {
    // Obter o usuário do localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      console.log('⚠️ Usuário não encontrado no localStorage');
      return;
    }

    const user = JSON.parse(storedUser);
    const userId = user.id;
    
    if (!userId) {
      console.log('⚠️ ID do usuário não encontrado');
      return;
    }

    console.log('👤 Carregando perfil do usuário ID:', userId);

    // Fazer requisição GET para /api/users/{id}
    this.http.get<any>(`http://localhost:8080/api/users/${userId}`).subscribe({
      next: (userData) => {
        console.log('✅ Dados do usuário carregados da API:', userData);
        
        // Mapear os dados da API para o userProfile
        this.userProfile = {
          fullName: userData.name || '',
          birthDate: '', // Não está disponível na API
          cpf: userData.cpf || '',
          rg: '', // Não está disponível na API
          email: userData.email || '',
          phone: userData.telephone || ''
        };
        
        console.log('📋 Perfil do usuário atualizado:', this.userProfile);
        console.log('📞 Telefone original:', userData.telephone);
        console.log('📞 Telefone formatado:', this.formatPhoneNumber(userData.telephone || ''));
      },
      error: (error) => {
        console.error('❌ Erro ao carregar dados do usuário:', error);
        this.notificationService.showError('Erro', 'Não foi possível carregar os dados do seu perfil');
      }
    });
  }

  /**
   * Carrega os viajantes já cadastrados na reserva
   */
  private loadRegisteredTravelers(): void {
    const reservationId = this.reservationData?.id;
    if (!reservationId) {
      console.log('⚠️ ID da reserva não encontrado para carregar viajantes');
      return;
    }

    console.log('🧳 Carregando viajantes já cadastrados na reserva ID:', reservationId);

    // Fazer requisição GET para /api/travelers/reservation/{reservationId}
    this.http.get<any[]>(`http://localhost:8080/api/travelers/reservation/${reservationId}`).subscribe({
      next: (travelers) => {
        console.log('✅ Viajantes cadastrados carregados da API:', travelers);
        this.registeredTravelers = travelers || [];
        
        // IMPORTANTE: Recalcular o número de viajantes disponíveis após carregar os cadastrados
        this.updateAvailableTravelerSlots();
        
        // IMPORTANTE: Recalcular o preço total após carregar os viajantes cadastrados
        this.calculateTotalPrice();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar viajantes cadastrados:', error);
        this.registeredTravelers = [];
        // Não mostrar erro para o usuário, pois pode ser que não tenha viajantes cadastrados ainda
        
        // Mesmo com erro, recalcular slots disponíveis
        this.updateAvailableTravelerSlots();
        
        // IMPORTANTE: Recalcular o preço total mesmo sem viajantes cadastrados
        this.calculateTotalPrice();
      }
    });
  }

  /**
   * Atualiza o número de slots de viajantes disponíveis considerando os já cadastrados
   */
  private updateAvailableTravelerSlots(): void {
    const maxTravelers = this.getMaxTravelers();
    const registeredCount = this.registeredTravelers.length;
    const titularCount = 1; // Sempre há 1 titular (usuário logado)
    
    // Total já ocupado = titular + viajantes já cadastrados
    const totalOccupied = titularCount + registeredCount;
    
    // Slots ainda disponíveis = máximo - já ocupados
    const availableSlots = Math.max(0, maxTravelers - totalOccupied);
      
    // Atualizar o currentPackage.travelers para refletir apenas os slots disponíveis
    if (this.selectedPackageData) {
      // Definir como o número atual de viajantes extras que podem ser adicionados
      this.selectedPackageData.travelers = Math.max(1, totalOccupied + Math.min(availableSlots, 1));
      console.log(`🔄 Travelers atualizado para: ${this.selectedPackageData.travelers}`);
    }
    
    // Atualizar packageList também
    if (this.packageList && this.packageList[0]) {
      this.packageList[0].travelers = Math.max(1, totalOccupied + Math.min(availableSlots, 1));
      console.log(`🔄 PackageList travelers atualizado para: ${this.packageList[0].travelers}`);
    }
    
    // Reinicializar viajantes extras baseado nos slots disponíveis
    this.initializeTravelersBasedOnAvailableSlots(availableSlots);
  }

  /**
   * Inicializa viajantes extras baseado nos slots disponíveis
   */
  private initializeTravelersBasedOnAvailableSlots(availableSlots: number): void {
    const packageId = this.currentPackage.id;
    
    console.log(`🎰 Inicializando ${availableSlots} slot(s) disponível(is) para viajantes extras`);
    
    // Limpar viajantes extras existentes
    this.travelersInfoByPackage[packageId] = [];
    
    // Se há slots disponíveis, criar formulários vazios para eles
    for (let i = 0; i < availableSlots; i++) {
      this.travelersInfoByPackage[packageId].push({
        fullName: '',
        birthDate: '',
        cpf: '',
        rg: '',
        email: '',
        phone: '',
        editing: false,
        // Novos campos para a API
        documentNumber: '',
        documentType: 'CPF',
        age: 0
      });
    }
    
    console.log(`✅ ${availableSlots} formulário(s) de viajante extra criado(s)`);
  }

  /**
   * Retorna o número de slots disponíveis para novos viajantes
   */
  getAvailableSlots(): number {
    const maxTravelers = this.getMaxTravelers();
    const registeredCount = this.registeredTravelers.length;
    const titularCount = 1;
    const totalOccupied = titularCount + registeredCount;
    return Math.max(0, maxTravelers - totalOccupied);
  }

  /**
   * Retorna o total de viajantes já ocupados (titular + cadastrados)
   */
  getTotalOccupiedSlots(): number {
    return 1 + this.registeredTravelers.length; // 1 titular + viajantes cadastrados
  }

  /**
   * Formata o número de telefone para exibição visual
   * @param phone - Número de telefone sem formatação
   * @returns Telefone formatado (ex: (11) 99999-9999 ou (11) 9999-9999)
   */
  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Se não tem número, retorna vazio
    if (cleanPhone.length === 0) return '';
    
    // Formata conforme o padrão brasileiro
    if (cleanPhone.length === 11) {
      // Celular: (XX) 9XXXX-XXXX
      return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 7)}-${cleanPhone.substring(7)}`;
    } else if (cleanPhone.length === 10) {
      // Fixo: (XX) XXXX-XXXX
      return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 6)}-${cleanPhone.substring(6)}`;
    } else if (cleanPhone.length === 9) {
      // Celular sem DDD: 9XXXX-XXXX
      return `${cleanPhone.substring(0, 5)}-${cleanPhone.substring(5)}`;
    } else if (cleanPhone.length === 8) {
      // Fixo sem DDD: XXXX-XXXX
      return `${cleanPhone.substring(0, 4)}-${cleanPhone.substring(4)}`;
    } else {
      // Outros casos, retorna como está
      return phone;
    }
  }

  /**
   * Formata o número do documento para exibição visual
   * @param documentNumber - Número do documento sem formatação
   * @param documentType - Tipo do documento (CPF ou PASSPORT)
   * @returns Documento formatado
   */
  formatDocumentNumber(documentNumber: string, documentType: string): string {
    if (!documentNumber) return '';
    
    if (documentType === 'CPF') {
      // Remove todos os caracteres não numéricos
      const cleanCpf = documentNumber.replace(/\D/g, '');
      
      // Se tem 11 dígitos, formata como CPF: 000.000.000-00
      if (cleanCpf.length === 11) {
        return `${cleanCpf.substring(0, 3)}.${cleanCpf.substring(3, 6)}.${cleanCpf.substring(6, 9)}-${cleanCpf.substring(9)}`;
      }
    }
    
    // Para passaporte ou CPF inválido, retorna como está
    return documentNumber;
  }
}