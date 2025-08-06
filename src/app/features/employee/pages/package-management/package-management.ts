import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BundleService } from '@/app/shared/services/bundle-service';
import { BundleClass } from '@/app/features/client/pages/bundle/class/bundle-class';
import { MediaResponse } from '@/app/shared/models/media-response.interface';
import { Location } from '@/app/shared/models/location.interface';
import { BundleLocationResponse } from '@/app/shared/models/bundle-location-response.interface';
import { DeleteConfirmationService } from '@/app/shared/services/delete-confirmation.service';
import { ToastService } from '@/app/shared/services/toast.service';
import { DeleteConfirmationModal } from '@/app/shared/delete-confirmation-modal/delete-confirmation-modal';
import { ToastContainerComponent } from '@/app/shared/toast-container/toast-container';

export interface AdvancedFilterCriteria {
  tipoFiltro: string; // 'none', 'localizacao', 'preco', 'viajantes', 'data', 'categoria'
  origem: string;
  destino: string;
  dataIda: string;
  dataVolta: string;
  precoMinimo: number;
  precoMaximo: number;
  viajantes: number;
  categoria: string[];
  status: string; // 'all', 'available', 'unavailable'
  ordenacao: string; // 'recent', 'price_asc', 'price_desc', 'alphabetical'
}

interface TravelPackage {
  id: number;
  bundleTitle: string;
  bundleDescription: string;
  initialPrice: number;
  bundleRank: 'BRONZE' | 'PRATA' | 'OURO' | 'PLATINA' | 'GOLD' | 'SILVER';
  initialDate: string;
  finalDate: string;
  quantity: number;
  travelersNumber: number;
  bundleStatus: string;
  imageUrl?: string;
  available?: boolean;
  createdAt?: Date;
  destination?: string;
  origin?: string;
}

@Component({
  selector: 'app-package-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DeleteConfirmationModal, ToastContainerComponent],
  templateUrl: './package-management.html',
  styleUrl: './package-management.css'
})
export class PackageManagementComponent implements OnInit {
  packages: TravelPackage[] = [];
  filteredPackages: TravelPackage[] = []; // Lista filtrada dos pacotes
  selectedPackage: TravelPackage | null = null;
  isEditMode = false;
  isModalOpen = false;

  // Filtros de busca
  searchTerm: string = '';

  // Lista de locais da API para filtros avançados
  locations: Location[] = [];

  // Filtros avançados
  advancedFilters: AdvancedFilterCriteria = {
    tipoFiltro: 'none',
    origem: '',
    destino: '',
    dataIda: '',
    dataVolta: '',
    precoMinimo: 0,
    precoMaximo: 0,
    viajantes: 1,
    categoria: [],
    status: 'all',
    ordenacao: 'recent'
  };

  // Opções para filtros
  filterTypes = [
    { value: 'none', label: 'Nenhum filtro' },
    { value: 'localizacao', label: 'Filtro por Localização' },
    { value: 'preco', label: 'Filtro por Preço' },
    { value: 'categoria', label: 'Filtro por Categoria' },
    { value: 'data', label: 'Filtro por Data' },
    { value: 'status', label: 'Filtro por Status' }
  ];

  categories = [
    { value: 'BRONZE', label: '🥉 Bronze - Básico' },
    { value: 'PRATA', label: '🥈 Prata - Intermediário' },
    { value: 'OURO', label: '🥇 Ouro - Premium' },
    { value: 'PLATINA', label: '💎 Platina - Luxo' }
  ];

  // Paginação
  currentPage = 1;
  pageSize = 6;

  newPackage: Partial<TravelPackage> = {
    bundleTitle: '',
    bundleDescription: '',
    initialPrice: 0,
    bundleRank: undefined,
    initialDate: '',
    finalDate: '',
    quantity: 0,
    travelersNumber: 1,
    imageUrl: '',
    available: true
  };

  // Propriedades para upload de imagem
  selectedImageFile: File | null = null;
  selectedImagePreview: string | null = null;
  isDragOver = false;

  // Propriedades para o modal de visualização
  isViewModalOpen = false;
  viewPackage: TravelPackage | null = null;

  // Propriedades para o modal de filtro
  isFilterModalOpen = false;

  constructor(
    private service: BundleService,
    private deleteConfirmationService: DeleteConfirmationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPackages();
    this.loadLocations(); // Carregar locais para filtros
  }

  // Carregar locais da API para filtros
  loadLocations() {
    this.service.getLocations().subscribe({
      next: (response: Location[]) => {
        this.locations = response;
      },
      error: (error: any) => {
        console.error('Erro ao carregar locais:', error);
      }
    });
  }

  loadPackages(): void {
    console.log('🔄 Carregando pacotes da API...');
    
    this.service.getAllBundles().subscribe({
      next: (bundles: BundleClass[]) => {
        console.log('📦 Pacotes recebidos da API:', bundles.length, bundles);
        
        if (!bundles || !Array.isArray(bundles)) {
          console.warn('⚠️ Nenhum pacote encontrado ou resposta inválida');
          this.packages = [];
          return;
        }
        
        // Converter BundleClass para TravelPackage
        this.packages = bundles.map(bundle => this.convertBundleToTravelPackage(bundle));
        
        // Inicializar lista filtrada
        this.filteredPackages = [...this.packages];
        
        // Aplicar filtros existentes se houver
        if (this.searchTerm) {
          this.applyFilters();
        }
        
        // Carregar imagens para todos os pacotes
        this.loadPackageImages();
        
        console.log('✅ Pacotes convertidos para TravelPackage:', this.packages.length, this.packages);
        
        // Resetar para primeira página
        this.currentPage = 1;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar pacotes:', error);
        console.log('Status do erro:', error.status);
        console.log('Mensagem do erro:', error.message);
        
        // Em caso de erro, manter array vazio
        this.packages = [];
      }
    });
  }

  // Método para carregar imagens dos pacotes seguindo o padrão da home
  private loadPackageImages(): void {
    console.log('🖼️ Carregando imagens dos pacotes...');
    
    this.packages.forEach((packageItem) => {
      this.service.getBundleImage(packageItem.id).subscribe({
        next: (mediaResponse) => {
          console.log(`📸 Resposta de imagem para pacote ${packageItem.id}:`, mediaResponse);
          
          // Verificar se a resposta é um array ou objeto único
          let mediaData = Array.isArray(mediaResponse) ? mediaResponse[0] : mediaResponse;
          
          if (mediaData && mediaData.mediaUrl) {
            // Seguir o padrão da home: usar URL completa com localhost:8080
            packageItem.imageUrl = `http://localhost:8080${mediaData.mediaUrl}`;
            console.log(`✅ Imagem carregada para pacote ${packageItem.id}: ${packageItem.imageUrl}`);
          } else {
            // Usar imagem padrão inteligente baseada no pacote
            packageItem.imageUrl = this.getDefaultImageForPackage({
              id: packageItem.id,
              bundleTitle: packageItem.bundleTitle,
              bundleRank: this.convertRankToBackend(packageItem.bundleRank),
              destinationCity: packageItem.destination?.split(',')[0] || '',
              destinationState: packageItem.destination?.split(',')[1]?.trim() || ''
            } as BundleClass);
            console.log(`🎨 Usando imagem padrão para pacote ${packageItem.id}: ${packageItem.imageUrl}`);
          }
        },
        error: (error) => {
          console.error(`❌ Erro ao carregar imagem para pacote ${packageItem.id}:`, error);
          
          // Usar imagem padrão em caso de erro
          packageItem.imageUrl = this.getDefaultImageForPackage({
            id: packageItem.id,
            bundleTitle: packageItem.bundleTitle,
            bundleRank: this.convertRankToBackend(packageItem.bundleRank),
            destinationCity: packageItem.destination?.split(',')[0] || '',
            destinationState: packageItem.destination?.split(',')[1]?.trim() || ''
          } as BundleClass);
          console.log(`🎨 Usando imagem padrão (erro) para pacote ${packageItem.id}: ${packageItem.imageUrl}`);
        }
      });
    });
  }

  private convertBundleToTravelPackage(bundle: BundleClass): TravelPackage {
    // Criar o TravelPackage com dados básicos primeiro
    const travelPackage: TravelPackage = {
      id: bundle.id,
      bundleTitle: bundle.bundleTitle,
      bundleDescription: bundle.bundleDescription,
      initialPrice: bundle.initialPrice,
      bundleRank: this.mapBundleRank(bundle.bundleRank),
      initialDate: bundle.initialDate,
      finalDate: bundle.finalDate,
      quantity: bundle.quantity,
      travelersNumber: bundle.travelersNumber,
      bundleStatus: bundle.bundleStatus,
      imageUrl: '/assets/imgs/background-hero-section.png', // Imagem temporária, será substituída pelo loadPackageImages()
      available: bundle.bundleStatus === 'AVAILABLE',
      createdAt: new Date(),
      destination: 'Carregando destino...',
      origin: 'Carregando origem...'
    };

    // Carregar localização usando a mesma API do details-bundle
    this.loadBundleLocationForPackage(bundle.id, travelPackage);

    return travelPackage;
  }

  // Método para carregar localização de um pacote específico usando a API do details-bundle
  private loadBundleLocationForPackage(bundleId: number, travelPackage: TravelPackage): void {
    console.log(`🗺️ Iniciando carregamento de localização para bundle ${bundleId}...`);
    
    this.service.getBundleLocation(bundleId).subscribe({
      next: (locationResponse: BundleLocationResponse[]) => {
        console.log(`🗺️ Resposta da API de localização para bundle ${bundleId}:`, locationResponse);
        
        if (locationResponse && Array.isArray(locationResponse) && locationResponse.length > 0) {
          const location = locationResponse[0];
          
          // Formatar local de partida seguindo o padrão do details-bundle
          if (location.departure) {
            travelPackage.origin = `${location.departure.city}, ${location.departure.states} - ${location.departure.country.trim()}`;
            console.log(`🛫 Local de partida para bundle ${bundleId}: ${travelPackage.origin}`);
          } else {
            travelPackage.origin = 'Local de partida não informado';
            console.log(`⚠️ Local de partida não encontrado para bundle ${bundleId}`);
          }
          
          // Formatar local de destino seguindo o padrão do details-bundle
          if (location.destination) {
            travelPackage.destination = `${location.destination.city}, ${location.destination.states} - ${location.destination.country.trim()}`;
            console.log(`🛬 Local de destino para bundle ${bundleId}: ${travelPackage.destination}`);
          } else {
            travelPackage.destination = 'Local de destino não informado';
            console.log(`⚠️ Local de destino não encontrado para bundle ${bundleId}`);
          }
        } else {
          console.log(`🗺️ Resposta de localização inválida ou vazia para bundle ${bundleId}`);
          travelPackage.origin = 'Local de partida não informado';
          travelPackage.destination = 'Local de destino não informado';
        }
      },
      error: (error) => {
        console.error(`❌ Erro ao carregar localização para bundle ${bundleId}:`, error);
        travelPackage.origin = 'Erro ao carregar local de partida';
        travelPackage.destination = 'Erro ao carregar local de destino';
      }
    });
  }

  // Método auxiliar para formatar localização (cidade, estado)
  private formatLocation(city?: string, state?: string, defaultText: string = 'Não informado'): string {
    // Limpar e validar dados
    const cleanCity = city?.trim();
    const cleanState = state?.trim();
    
    // Se ambos existem
    if (cleanCity && cleanState) {
      return `${cleanCity}, ${cleanState}`;
    }
    
    // Se só a cidade existe
    if (cleanCity && !cleanState) {
      return cleanCity;
    }
    
    // Se só o estado existe
    if (!cleanCity && cleanState) {
      return cleanState;
    }
    
    // Se nenhum existe
    return defaultText;
  }

  private mapBundleRank(rank: string): 'BRONZE' | 'PRATA' | 'OURO' | 'PLATINA' | 'GOLD' | 'SILVER' {
    // Mapear diferentes formatos de rank para nosso enum
    const normalizedRank = rank.toUpperCase();
    
    switch (normalizedRank) {
      case 'GOLD':
        return 'OURO';
      case 'SILVER':
        return 'PRATA';
      case 'BRONZE':
        return 'BRONZE';
      case 'PLATINUM':
      case 'PLATINA':
        return 'PLATINA';
      default:
        return 'BRONZE';
    }
  }

  private convertRankToBackend(rank: string): string {
    // Converter rank do frontend de volta para formato do backend
    const normalizedRank = rank.toUpperCase();
    
    switch (normalizedRank) {
      case 'OURO':
        return 'GOLD';
      case 'PRATA':
        return 'SILVER';
      case 'BRONZE':
        return 'BRONZE';
      case 'PLATINA':
        return 'PLATINUM';
      case 'GOLD':
        return 'GOLD';
      case 'SILVER':
        return 'SILVER';
      default:
        return 'BRONZE';
    }
  }

  private getDefaultImageForPackage(bundle: BundleClass): string {
    // Selecionar imagem baseada no destino ou outras características
    const destination = bundle.destinationCity?.toLowerCase() || '';
    const title = bundle.bundleTitle?.toLowerCase() || '';
    
    // Mapear destinos específicos para imagens
    if (destination.includes('fortaleza') || destination.includes('ceará') || destination.includes('ce')) {
      return '/assets/imgs/fortaleza.jpg';
    } else if (destination.includes('gramado') || destination.includes('rio grande do sul') || destination.includes('rs')) {
      return '/assets/imgs/gramado.jpg';
    } else if (title.includes('nordeste') || destination.includes('salvador') || destination.includes('recife') || destination.includes('natal')) {
      return '/assets/imgs/fortaleza.jpg';
    } else if (title.includes('sul') || destination.includes('gramado') || destination.includes('canela')) {
      return '/assets/imgs/gramado.jpg';
    } else {
      // Imagens padrão baseadas no rank
      const rank = bundle.bundleRank?.toUpperCase();
      switch (rank) {
        case 'GOLD':
        case 'OURO':
          return '/assets/imgs/gramado.jpg'; // Imagem premium para pacotes Gold
        case 'PLATINUM':
        case 'PLATINA':
          return '/assets/imgs/Easy.jpg'; // Imagem luxo para pacotes Platina
        case 'SILVER':
        case 'PRATA':
          return '/assets/imgs/fortaleza.jpg'; // Imagem intermediária
        case 'BRONZE':
        default:
          return '/assets/imgs/background-hero-section.png'; // Imagem básica
      }
    }
  }

  getAvailablePackagesCount(): number {
    return this.filteredPackages.filter(p => p.available).length;
  }

  getUnavailablePackagesCount(): number {
    return this.filteredPackages.filter(p => !p.available).length;
  }

  // ===== MÉTODOS DE FILTRO E BUSCA =====

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm.trim();
    this.applyFilters();
    // Resetar para primeira página após busca
    this.currentPage = 1;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
    this.currentPage = 1;
  }

  private applyFilters(): void {
    console.log('🔍 Aplicando filtros. Termo de busca:', this.searchTerm);
    
    let filtered = [...this.packages];

    // Filtro por texto de busca (mantido - apenas bundleTitle)
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(pkg => {
        // Buscar SOMENTE no título do pacote (bundleTitle)
        return pkg.bundleTitle?.toLowerCase().includes(searchLower) || false;
      });
    }

    // Aplicar filtros avançados
    filtered = this.applyAdvancedFilters(filtered);

    this.filteredPackages = filtered;
    console.log(`✅ Filtros aplicados. ${filtered.length} pacotes encontrados de ${this.packages.length} total`);
  }

  // Aplicar filtros avançados baseado na lógica do bundle.ts
  private applyAdvancedFilters(packages: TravelPackage[]): TravelPackage[] {
    let filtered = [...packages];

    // Filtro por localização (origem/destino)
    if (this.advancedFilters.tipoFiltro === 'localizacao') {
      if (this.advancedFilters.origem) {
        filtered = filtered.filter(pkg => 
          pkg.origin?.toLowerCase().includes(this.advancedFilters.origem.toLowerCase()) ||
          pkg.destination?.toLowerCase().includes(this.advancedFilters.origem.toLowerCase())
        );
      }
      if (this.advancedFilters.destino) {
        filtered = filtered.filter(pkg => 
          pkg.destination?.toLowerCase().includes(this.advancedFilters.destino.toLowerCase()) ||
          pkg.origin?.toLowerCase().includes(this.advancedFilters.destino.toLowerCase())
        );
      }
    }

    // Filtro por preço
    if (this.advancedFilters.tipoFiltro === 'preco') {
      if (this.advancedFilters.precoMinimo > 0) {
        filtered = filtered.filter(pkg => (pkg.initialPrice || 0) >= this.advancedFilters.precoMinimo);
      }
      if (this.advancedFilters.precoMaximo > 0) {
        filtered = filtered.filter(pkg => (pkg.initialPrice || 0) <= this.advancedFilters.precoMaximo);
      }
    }

    // Filtro por categoria (bundleRank)
    if (this.advancedFilters.tipoFiltro === 'categoria' && this.advancedFilters.categoria.length > 0) {
      filtered = filtered.filter(pkg => 
        this.advancedFilters.categoria.includes(pkg.bundleRank || '')
      );
    }

    // Filtro por status (available)
    if (this.advancedFilters.status !== 'all') {
      const isAvailable = this.advancedFilters.status === 'available';
      filtered = filtered.filter(pkg => pkg.available === isAvailable);
    }

    // Filtro por número de viajantes
    if (this.advancedFilters.viajantes > 1) {
      filtered = filtered.filter(pkg => (pkg.travelersNumber || 1) >= this.advancedFilters.viajantes);
    }

    // Filtro por data
    if (this.advancedFilters.tipoFiltro === 'data') {
      if (this.advancedFilters.dataIda) {
        filtered = filtered.filter(pkg => {
          if (!pkg.initialDate) return false;
          const packageDate = new Date(pkg.initialDate);
          const filterDate = new Date(this.advancedFilters.dataIda);
          return packageDate >= filterDate;
        });
      }
      if (this.advancedFilters.dataVolta) {
        filtered = filtered.filter(pkg => {
          if (!pkg.finalDate) return false;
          const packageDate = new Date(pkg.finalDate);
          const filterDate = new Date(this.advancedFilters.dataVolta);
          return packageDate <= filterDate;
        });
      }
    }

    // Aplicar ordenação
    return this.applySorting(filtered);
  }

  // Aplicar ordenação baseado na lógica do bundle.ts
  private applySorting(packages: TravelPackage[]): TravelPackage[] {
    switch (this.advancedFilters.ordenacao) {
      case 'price-asc':
        return packages.sort((a, b) => (a.initialPrice || 0) - (b.initialPrice || 0));
      case 'price-desc':
        return packages.sort((a, b) => (b.initialPrice || 0) - (a.initialPrice || 0));
      case 'title':
        return packages.sort((a, b) => (a.bundleTitle || '').localeCompare(b.bundleTitle || ''));
      case 'recent':
      default:
        return packages.sort((a, b) => {
          const dateA = new Date(a.initialDate || '');
          const dateB = new Date(b.initialDate || '');
          return dateB.getTime() - dateA.getTime();
        });
    }
  }

  // Abrir modal de filtros avançados
  openFilterModal() {
    this.isFilterModalOpen = true;
  }

  // Fechar modal de filtros avançados
  closeFilterModal() {
    this.isFilterModalOpen = false;
  }

  // Aplicar filtros avançados
  applyAdvancedFilterModal() {
    this.applyFilters(); // Reaplicar todos os filtros
    this.closeFilterModal();
  }

  // Limpar filtros avançados
  clearAdvancedFilters() {
    this.advancedFilters = {
      tipoFiltro: 'none',
      origem: '',
      destino: '',
      dataIda: '',
      dataVolta: '',
      precoMinimo: 0,
      precoMaximo: 0,
      viajantes: 1,
      categoria: [],
      status: 'all',
      ordenacao: 'recent'
    };
    this.applyFilters();
  }

  // Verificar se há filtros ativos
  hasActiveFilters(): boolean {
    return this.advancedFilters.tipoFiltro !== 'none' ||
           this.advancedFilters.origem !== '' ||
           this.advancedFilters.destino !== '' ||
           this.advancedFilters.dataIda !== '' ||
           this.advancedFilters.dataVolta !== '' ||
           this.advancedFilters.precoMinimo > 0 ||
           this.advancedFilters.precoMaximo > 0 ||
           this.advancedFilters.viajantes > 1 ||
           this.advancedFilters.categoria.length > 0 ||
           this.advancedFilters.status !== 'all' ||
           this.advancedFilters.ordenacao !== 'recent';
  }

  // Gerenciar seleção de categorias
  onCategoryChange(category: string, event: any) {
    if (event.target.checked) {
      if (!this.advancedFilters.categoria.includes(category)) {
        this.advancedFilters.categoria.push(category);
      }
    } else {
      const index = this.advancedFilters.categoria.indexOf(category);
      if (index > -1) {
        this.advancedFilters.categoria.splice(index, 1);
      }
    }
  }

  // Obter tags de filtros ativos
  getActiveFilterTags(): string[] {
    const tags: string[] = [];
    
    if (this.advancedFilters.tipoFiltro !== 'none') {
      const filterType = this.filterTypes.find(f => f.value === this.advancedFilters.tipoFiltro);
      if (filterType) tags.push(filterType.label);
    }
    
    if (this.advancedFilters.origem) {
      tags.push(`Origem: ${this.advancedFilters.origem}`);
    }
    
    if (this.advancedFilters.destino) {
      tags.push(`Destino: ${this.advancedFilters.destino}`);
    }
    
    if (this.advancedFilters.precoMinimo > 0) {
      tags.push(`Preço mín: R$ ${this.advancedFilters.precoMinimo}`);
    }
    
    if (this.advancedFilters.precoMaximo > 0) {
      tags.push(`Preço máx: R$ ${this.advancedFilters.precoMaximo}`);
    }
    
    if (this.advancedFilters.viajantes > 1) {
      tags.push(`${this.advancedFilters.viajantes} viajantes`);
    }
    
    if (this.advancedFilters.categoria.length > 0) {
      tags.push(`Categorias: ${this.advancedFilters.categoria.join(', ')}`);
    }
    
    if (this.advancedFilters.status !== 'all') {
      tags.push(`Status: ${this.advancedFilters.status === 'available' ? 'Disponível' : 'Indisponível'}`);
    }
    
    return tags;
  }

  openCreateModal(): void {
    this.selectedPackage = null;
    this.isEditMode = false;
    this.isModalOpen = true;
    this.resetForm();
    // Aguardar a renderização do modal antes de configurar o scroll
    setTimeout(() => this.setupModalScroll(), 100);
  }

  openEditModal(packageItem: TravelPackage): void {
    this.selectedPackage = packageItem;
    this.isEditMode = true;
    this.isModalOpen = true;
    this.newPackage = { ...packageItem };
    // Resetar variáveis de upload ao editar
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
    // Aguardar a renderização do modal antes de configurar o scroll
    setTimeout(() => this.setupModalScroll(), 100);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedPackage = null;
    this.resetForm();
  }

  setupModalScroll(): void {
    const modalBody = document.querySelector('.modal-body-premium');
    if (modalBody) {
      modalBody.addEventListener('scroll', () => {
        if (modalBody.scrollTop > 10) {
          modalBody.classList.add('scrolled');
        } else {
          modalBody.classList.remove('scrolled');
        }
      });
    }
  }

  // ===== MÉTODOS PARA MODAL DE VISUALIZAÇÃO =====

  openViewModal(packageItem: TravelPackage): void {
    this.viewPackage = packageItem;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewPackage = null;
  }

  editFromView(): void {
    if (this.viewPackage) {
      this.closeViewModal();
      this.openEditModal(this.viewPackage);
    }
  }

  // ===== MÉTODOS PARA MODAL DE FILTRO =====
  getRankDisplay(rank?: string): string {
    const rankMap: { [key: string]: string } = {
      'BRONZE': '🥉 Bronze - Básico',
      'PRATA': '🥈 Prata - Intermediário', 
      'SILVER': '🥈 Prata - Intermediário',
      'OURO': '🥇 Ouro - Premium',
      'GOLD': '🥇 Ouro - Premium',
      'PLATINA': '💎 Platina - Luxo',
      'PLATINUM': '💎 Platina - Luxo'
    };
    return rank ? rankMap[rank.toUpperCase()] || rank : 'Não definido';
  }

  resetForm(): void {
    this.newPackage = {
      bundleTitle: '',
      bundleDescription: '',
      initialPrice: 0,
      bundleRank: undefined,
      initialDate: '',
      finalDate: '',
      quantity: 0,
      travelersNumber: 1,
      imageUrl: '',
      available: true
    };

    // Resetar variáveis de upload
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
    this.isDragOver = false;
  }

  // Métodos de paginação baseados na página Bundle
  getTotalPages(): number {
    return Math.ceil(this.filteredPackages.length / this.pageSize);
  }

  getPaginatedPackages(): TravelPackage[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredPackages.slice(startIndex, endIndex);
  }

  changePage(page: number | string) {
    if (typeof page === 'number' && page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getVisiblePages(): (number | string)[] {
    const totalPages = this.getTotalPages();
    const current = this.currentPage;
    const visible: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        visible.push(i);
      }
    } else {
      visible.push(1);

      if (current > 4) {
        visible.push('...');
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);

      for (let i = start; i <= end; i++) {
        visible.push(i);
      }

      if (current < totalPages - 3) {
        visible.push('...');
      }

      if (totalPages > 1) {
        visible.push(totalPages);
      }
    }

    return visible;
  }

  getDisplayStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getDisplayEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredPackages.length);
  }

  onPageSizeChange() {
    const previousPageSize = this.pageSize;
    this.pageSize = Number(this.pageSize);

    if (this.pageSize > 24) {
      this.pageSize = 24;
    }

    const currentFirstItem = (this.currentPage - 1) * previousPageSize;
    this.currentPage = Math.floor(currentFirstItem / this.pageSize) + 1;

    const totalPages = this.getTotalPages();
    this.currentPage = Math.max(1, Math.min(this.currentPage, totalPages));
  }

  savePackage(): void {
    if (this.isEditMode && this.selectedPackage) {
      // Atualizar pacote existente
      console.log('✏️ Atualizando pacote existente:', this.selectedPackage.id);
      
      // Converter rank para formato do backend
      const backendRank = this.convertRankToBackend(this.newPackage.bundleRank || 'BRONZE');
      
      // Preparar dados para update (todos os campos obrigatórios)
      const updateData = {
        bundleTitle: this.newPackage.bundleTitle || '',
        bundleDescription: this.newPackage.bundleDescription || '',
        initialPrice: this.newPackage.initialPrice || 0,
        bundleRank: backendRank,
        initialDate: this.newPackage.initialDate || '',
        finalDate: this.newPackage.finalDate || '',
        quantity: this.newPackage.quantity || 0,
        travelersNumber: this.newPackage.travelersNumber || 1,
        bundleStatus: this.newPackage.available ? 'AVAILABLE' : 'UNAVAILABLE'
      };
      
      console.log('📤 Enviando dados de edição para API:', updateData);
      
      // Fazer chamada para API de update
      this.service.updateBundle(this.selectedPackage.id, updateData).subscribe({
        next: (updatedBundle) => {
          console.log('✅ Bundle editado com sucesso:', updatedBundle);
          
          // Atualizar na lista local
          const index = this.packages.findIndex(p => p.id === this.selectedPackage!.id);
          if (index !== -1) {
            this.packages[index] = {
              ...this.selectedPackage!,
              ...this.newPackage,
              id: this.selectedPackage!.id,
              createdAt: this.selectedPackage!.createdAt,
              bundleRank: this.mapBundleRank(updatedBundle.bundleRank), // Converter de volta para frontend
              available: updatedBundle.bundleStatus === 'AVAILABLE',
              bundleStatus: updatedBundle.bundleStatus
            } as TravelPackage;
          }
          
          this.closeModal();
          
          // Recarregar dados da API após salvar
          console.log('🔄 Recarregando dados da API após edição...');
          this.loadPackages();
          
          // Mostrar mensagem de sucesso
          alert('Pacote editado com sucesso!');
        },
        error: (error) => {
          console.error('❌ Erro ao editar pacote:', error);
          console.log('Status do erro:', error.status);
          console.log('Mensagem do erro:', error.message);
          
          // Mostrar mensagem de erro
          if (error.status === 404) {
            alert('Pacote não encontrado. Pode ter sido excluído.');
            this.loadPackages();
            this.closeModal();
          } else if (error.status === 403) {
            alert('Você não tem permissão para editar este pacote.');
          } else if (error.status === 400) {
            alert('Dados inválidos. Verifique os campos e tente novamente.');
          } else {
            alert('Erro ao editar pacote. Tente novamente.');
          }
        }
      });
    } else {
      // Criar novo pacote
      console.log('➕ Criando novo pacote');
      
      // Converter rank para formato do backend
      const backendRank = this.convertRankToBackend(this.newPackage.bundleRank || 'BRONZE');
      
      // Preparar dados para criação (todos os campos obrigatórios)
      const createData = {
        bundleTitle: this.newPackage.bundleTitle || '',
        bundleDescription: this.newPackage.bundleDescription || '',
        initialPrice: this.newPackage.initialPrice || 0,
        bundleRank: backendRank,
        initialDate: this.newPackage.initialDate || '',
        finalDate: this.newPackage.finalDate || '',
        quantity: this.newPackage.quantity || 0,
        travelersNumber: this.newPackage.travelersNumber || 1,
        bundleStatus: this.newPackage.available ? 'AVAILABLE' : 'UNAVAILABLE'
      };
      
      console.log('📤 Enviando dados de criação para API:', createData);
      
      // Fazer chamada para API de create
      this.service.createBundle(createData).subscribe({
        next: (createdBundle) => {
          console.log('✅ Bundle criado com sucesso:', createdBundle);
          
          // Converter e adicionar na lista local
          const newPackage: TravelPackage = {
            id: createdBundle.id,
            bundleTitle: createdBundle.bundleTitle,
            bundleDescription: createdBundle.bundleDescription,
            initialPrice: createdBundle.initialPrice,
            bundleRank: this.mapBundleRank(createdBundle.bundleRank), // Converter de volta para frontend
            initialDate: createdBundle.initialDate,
            finalDate: createdBundle.finalDate,
            quantity: createdBundle.quantity,
            travelersNumber: createdBundle.travelersNumber,
            bundleStatus: createdBundle.bundleStatus,
            available: createdBundle.bundleStatus === 'AVAILABLE',
            createdAt: new Date(),
            imageUrl: this.newPackage.imageUrl || '/assets/imgs/fortaleza.jpg'
          };
          
          this.packages.push(newPackage);
          
          // Resetar para primeira página se necessário
          const totalPages = this.getTotalPages();
          if (this.currentPage > totalPages) {
            this.currentPage = Math.max(1, totalPages);
          }

          this.closeModal();
          
          // Recarregar dados da API após criar
          console.log('🔄 Recarregando dados da API após criação...');
          this.loadPackages();
          
          // Mostrar mensagem de sucesso
          alert('Pacote criado com sucesso!');
        },
        error: (error) => {
          console.error('❌ Erro ao criar pacote:', error);
          console.log('Status do erro:', error.status);
          console.log('Mensagem do erro:', error.message);
          
          // Mostrar mensagem de erro
          if (error.status === 400) {
            alert('Dados inválidos. Verifique os campos e tente novamente.');
          } else if (error.status === 403) {
            alert('Você não tem permissão para criar pacotes.');
          } else {
            alert('Erro ao criar pacote. Tente novamente.');
          }
        }
      });
    }
  }

  deletePackage(id: number): void {
    // Encontrar o pacote para mostrar informações no modal
    const packageToDelete = this.packages.find(p => p.id === id);
    const packageName = packageToDelete ? packageToDelete.bundleTitle : `Pacote ID: ${id}`;

    // Mostrar modal de confirmação
    this.deleteConfirmationService.showConfirmationModal({
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este pacote? Esta ação não pode ser desfeita.',
      itemName: packageName,
      itemType: 'Pacote',
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      isDestructive: true
    }).subscribe(result => {
      if (result.confirmed) {
        console.log('🗑️ Excluindo pacote ID:', id);
        
        // Fazer chamada para API de delete
        this.service.deleteBundle(id).subscribe({
          next: () => {
            console.log('✅ Pacote excluído com sucesso da API');
            
            // Remover da lista local
            this.packages = this.packages.filter(p => p.id !== id);

            // Ajustar página se necessário
            const totalPages = this.getTotalPages();
            if (this.currentPage > totalPages && totalPages > 0) {
              this.currentPage = totalPages;
            }
            
            // Recarregar dados da API para garantir sincronização
            console.log('🔄 Recarregando dados da API após exclusão...');
            this.loadPackages();
            
            // Mostrar mensagem de sucesso
            this.toastService.showSuccess(
              'Pacote Excluído',
              `O pacote "${packageName}" foi excluído com sucesso!`
            );
          },
          error: (error) => {
            console.error('❌ Erro ao excluir pacote:', error);
            console.log('Status do erro:', error.status);
            console.log('Mensagem do erro:', error.message);
            
            // Mostrar mensagem de erro específica
            if (error.status === 404) {
              this.toastService.showWarning(
                'Pacote Não Encontrado',
                'O pacote pode já ter sido excluído. Atualizando a lista...'
              );
              // Recarregar dados para sincronizar
              this.loadPackages();
            } else if (error.status === 403) {
              this.toastService.showError(
                'Acesso Negado',
                'Você não tem permissão para excluir este pacote.'
              );
            } else if (error.status === 409) {
              this.toastService.showError(
                'Não é Possível Excluir',
                'Este pacote possui reservas ativas e não pode ser excluído.'
              );
            } else {
              this.toastService.showError(
                'Erro ao Excluir',
                'Ocorreu um erro inesperado ao tentar excluir o pacote. Tente novamente.'
              );
            }
          }
        });
      }
    });
  }

  toggleAvailability(packageItem: TravelPackage): void {
    console.log('🔄 Alterando disponibilidade do pacote ID:', packageItem.id);
    
    // Determinar o novo status
    const newStatus = packageItem.available ? 'UNAVAILABLE' : 'AVAILABLE';
    console.log(`📋 Alterando status de ${packageItem.bundleStatus} para ${newStatus}`);
    
    // Converter rank de volta para formato do backend
    const backendRank = this.convertRankToBackend(packageItem.bundleRank);
    
    // Preparar dados para update (todos os campos obrigatórios)
    const updateData = {
      bundleTitle: packageItem.bundleTitle,
      bundleDescription: packageItem.bundleDescription,
      initialPrice: packageItem.initialPrice,
      bundleRank: backendRank, // Usar o rank convertido para o backend
      initialDate: packageItem.initialDate,
      finalDate: packageItem.finalDate,
      quantity: packageItem.quantity,
      travelersNumber: packageItem.travelersNumber,
      bundleStatus: newStatus
    };
    
    console.log('📤 Enviando dados para API:', updateData);
    
    // Fazer chamada para API
    this.service.updateBundle(packageItem.id, updateData).subscribe({
      next: (updatedBundle) => {
        console.log('✅ Bundle atualizado com sucesso:', updatedBundle);
        
        // Atualizar localmente
        packageItem.available = newStatus === 'AVAILABLE';
        packageItem.bundleStatus = newStatus;
        
        // Recarregar dados da API para garantir sincronização
        console.log('🔄 Recarregando dados da API após alterar status...');
        this.loadPackages();
      },
      error: (error) => {
        console.error('❌ Erro ao alterar status do bundle:', error);
        console.log('Status do erro:', error.status);
        console.log('Mensagem do erro:', error.message);
        
        // Em caso de erro, reverter as alterações locais
        alert('Erro ao alterar disponibilidade do pacote. Tente novamente.');
      }
    });
  }

  // Método para alterar status no modal de edição (mesma funcionalidade dos botões Pausar/Tornar inativo)
  onStatusToggleChange(): void {
    if (this.isEditMode && this.selectedPackage) {
      console.log('🔄 Alterando status do pacote no modal - ID:', this.selectedPackage.id);
      console.log(`📋 Novo status: ${this.newPackage.available ? 'AVAILABLE' : 'UNAVAILABLE'}`);
      
      // Determinar o novo status baseado no toggle
      const newStatus = this.newPackage.available ? 'AVAILABLE' : 'UNAVAILABLE';
      
      // Converter rank de volta para formato do backend
      const backendRank = this.convertRankToBackend(this.newPackage.bundleRank || 'BRONZE');
      
      // Preparar dados para update (todos os campos obrigatórios)
      const updateData = {
        bundleTitle: this.newPackage.bundleTitle || '',
        bundleDescription: this.newPackage.bundleDescription || '',
        initialPrice: this.newPackage.initialPrice || 0,
        bundleRank: backendRank,
        initialDate: this.newPackage.initialDate || '',
        finalDate: this.newPackage.finalDate || '',
        quantity: this.newPackage.quantity || 0,
        travelersNumber: this.newPackage.travelersNumber || 1,
        bundleStatus: newStatus
      };
      
      console.log('📤 Enviando dados para API (alteração de status no modal):', updateData);
      
      // Fazer chamada para API
      this.service.updateBundle(this.selectedPackage.id, updateData).subscribe({
        next: (updatedBundle) => {
          console.log('✅ Status alterado com sucesso no modal:', updatedBundle);
          
          // Atualizar o pacote selecionado
          this.selectedPackage!.available = newStatus === 'AVAILABLE';
          this.selectedPackage!.bundleStatus = newStatus;
          
          // Atualizar na lista local também
          const index = this.packages.findIndex(p => p.id === this.selectedPackage!.id);
          if (index !== -1) {
            this.packages[index].available = newStatus === 'AVAILABLE';
            this.packages[index].bundleStatus = newStatus;
          }
          
          // Recarregar dados da API para garantir sincronização
          console.log('🔄 Recarregando dados da API após alterar status no modal...');
          this.loadPackages();
        },
        error: (error) => {
          console.error('❌ Erro ao alterar status no modal:', error);
          console.log('Status do erro:', error.status);
          console.log('Mensagem do erro:', error.message);
          
          // Em caso de erro, reverter a alteração no form
          this.newPackage.available = !this.newPackage.available;
          
          // Mostrar mensagem de erro
          if (error.status === 404) {
            alert('Pacote não encontrado. Pode ter sido excluído.');
            this.loadPackages();
            this.closeModal();
          } else if (error.status === 403) {
            alert('Você não tem permissão para alterar este pacote.');
          } else if (error.status === 400) {
            alert('Dados inválidos. Verifique os campos e tente novamente.');
          } else {
            alert('Erro ao alterar status do pacote. Tente novamente.');
          }
        }
      });
    }
  }

  changeQuantity(packageItem: TravelPackage, change: number): void {
    console.log('🔢 Alterando quantidade do pacote ID:', packageItem.id, 'Mudança:', change);
    
    // Calcular nova quantidade
    const newQuantity = packageItem.quantity + change;
    
    // Validar se a nova quantidade é válida (não pode ser negativa)
    if (newQuantity < 0) {
      console.log('⚠️ Quantidade não pode ser negativa');
      return;
    }
    
    console.log(`📋 Alterando quantidade de ${packageItem.quantity} para ${newQuantity}`);
    
    // Converter rank de volta para formato do backend
    const backendRank = this.convertRankToBackend(packageItem.bundleRank);
    
    // Preparar dados para update (todos os campos obrigatórios)
    const updateData = {
      bundleTitle: packageItem.bundleTitle,
      bundleDescription: packageItem.bundleDescription,
      initialPrice: packageItem.initialPrice,
      bundleRank: backendRank,
      initialDate: packageItem.initialDate,
      finalDate: packageItem.finalDate,
      quantity: newQuantity, // Nova quantidade
      travelersNumber: packageItem.travelersNumber,
      bundleStatus: packageItem.bundleStatus
    };
    
    console.log('📤 Enviando dados para API (alteração de quantidade):', updateData);
    
    // Fazer chamada para API
    this.service.updateBundle(packageItem.id, updateData).subscribe({
      next: (updatedBundle) => {
        console.log('✅ Quantidade atualizada com sucesso:', updatedBundle);
        
        // Atualizar localmente
        packageItem.quantity = newQuantity;
        
        // Recarregar dados da API para garantir sincronização
        console.log('🔄 Recarregando dados da API após alterar quantidade...');
        this.loadPackages();
      },
      error: (error) => {
        console.error('❌ Erro ao alterar quantidade do bundle:', error);
        console.log('Status do erro:', error.status);
        console.log('Mensagem do erro:', error.message);
        
        // Em caso de erro, mostrar mensagem
        alert('Erro ao alterar quantidade de vagas. Tente novamente.');
      }
    });
  }

  // ===== MÉTODOS PARA UPLOAD DE IMAGEM =====

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file && this.isValidImageFile(file)) {
      this.selectedImageFile = file;
      this.createImagePreview(file);
      // Limpa a URL se uma imagem foi selecionada
      this.newPackage.imageUrl = '';
    }
  }

  onImageUrlChange(url: string): void {
    if (url) {
      // Se uma URL foi inserida, limpa a imagem selecionada
      this.selectedImageFile = null;
      this.selectedImagePreview = null;
    }
  }

  removeImage(): void {
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
    this.newPackage.imageUrl = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (this.isValidImageFile(file)) {
        this.selectedImageFile = file;
        this.createImagePreview(file);
        this.newPackage.imageUrl = '';
      } else {
        alert('Arquivo inválido! Por favor, selecione uma imagem (JPG, PNG, WebP) com até 5MB.');
      }
    }
  }

  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert('Tipo de arquivo não suportado! Use JPG, PNG ou WebP.');
      return false;
    }

    if (file.size > maxSize) {
      alert('Arquivo muito grande! O tamanho máximo é 5MB.');
      return false;
    }

    return true;
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ===== FIM DOS MÉTODOS DE UPLOAD =====

  isFormValid(): boolean {
    const hasImage = !!(this.newPackage.imageUrl || this.selectedImageFile);

    return !!(
      this.newPackage.bundleTitle &&
      this.newPackage.bundleDescription &&
      this.newPackage.initialPrice &&
      this.newPackage.initialPrice > 0 &&
      this.newPackage.bundleRank &&
      this.newPackage.initialDate &&
      this.newPackage.finalDate &&
      this.newPackage.quantity !== undefined && 
      this.newPackage.quantity >= 0 &&
      hasImage
    );
  }

  onImageError(event: any, packageItem: TravelPackage): void {
    console.warn('❌ Erro ao carregar imagem para o pacote:', packageItem.bundleTitle, 'URL:', event.target.src);
    
    // Usar imagem padrão baseada no rank do pacote
    event.target.src = this.getDefaultImageForPackage({
      destinationCity: packageItem.destination?.split(',')[0] || '',
      destinationState: packageItem.destination?.split(',')[1]?.trim() || '',
      bundleTitle: packageItem.bundleTitle,
      bundleRank: this.convertRankToBackend(packageItem.bundleRank)
    } as BundleClass);
  }
}
