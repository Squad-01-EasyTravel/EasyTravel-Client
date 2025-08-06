import { Component, OnInit, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from './card/card';
import { Filter, FilterCriteria } from './filter/filter';
import { Navbar } from '../../../../shared/navbar/navbar';
import { Footer } from '../../../../shared/footer/footer';
import { CartConfirmationModal } from '../../../../shared/cart-confirmation-modal/cart-confirmation-modal';
import { BundleService } from '../../../../shared/services/bundle-service';
import { BundleClass } from './class/bundle-class';
import { MediaResponse } from '../../../../shared/models/media-response.interface';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-bundle',
  imports: [CommonModule, FormsModule, Card, Navbar, Footer, Filter, CartConfirmationModal],
  templateUrl: './bundle.html',
  styleUrl: './bundle.css'
})
export class Bundle implements OnInit, OnDestroy {
  @ViewChild(Filter) filterComponent!: Filter;
  
  // URL base do backend
  private readonly BACKEND_BASE_URL = 'http://localhost:8080';
  
  // Subject para destruição de observables
  private destroy$ = new Subject<void>();
  
  // Dados da API
  allPackages: BundleClass[] = [];
  filteredPackages: BundleClass[] = [];
  packagesWithImages: any[] = [];
  allPackagesWithImages: any[] = []; // Array completo como backup para filtragem

  currentFilters: FilterCriteria = {
    tipoFiltro: 'none',
    origem: '',
    destino: '',
    dataIda: '',
    dataVolta: '',
    precoMaximo: 0,
    viajantes: 1,
    ordenacao: 'popular'
  };

  // Propriedade para ordenação
  currentSort = 'popular';

  // Filtros pendentes do localStorage
  pendingFilters: {origem: string, destino: string} | null = null;

  // Paginação
  currentPage = 1;
  pageSize = 6;

  constructor(
    private bundleService: BundleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBundlesFromAPI();
    this.checkLocalStorageFilters();
  }

  checkLocalStorageFilters() {
    console.log('🔍 Verificando filtros do localStorage...');
    
    const origem = localStorage.getItem('origem');
    const destino = localStorage.getItem('destino');
    
    if (origem || destino) {
      console.log('📍 Filtros encontrados no localStorage:', { origem, destino });
      
      // Armazenar os filtros para aplicar após carregamento
      this.pendingFilters = {
        origem: origem || '',
        destino: destino || ''
      };
      
      // Limpar localStorage após usar
      localStorage.removeItem('origem');
      localStorage.removeItem('destino');
    }
  }

  applyLocalStorageFiltersAfterLoad() {
    if (this.pendingFilters) {
      console.log('🎯 Aplicando filtros pendentes do localStorage:', this.pendingFilters);
      
      // Configurar filtros automaticamente
      this.currentFilters = {
        ...this.currentFilters,
        tipoFiltro: 'localizacao',
        origem: this.pendingFilters.origem,
        destino: this.pendingFilters.destino
      };
      
      console.log('✅ Filtros aplicados automaticamente:', this.currentFilters);
      
      // Aguardar um pouco para garantir que o componente filter esteja carregado
      setTimeout(() => {
        this.syncFiltersWithFilterComponent();
        this.applyFilters();
      }, 1000);
      
      // Limpar filtros pendentes
      this.pendingFilters = null;
    }
  }

  syncFiltersWithFilterComponent() {
    if (this.filterComponent) {
      console.log('🔄 Sincronizando filtros com o componente Filter...');
      this.filterComponent.filtros = { ...this.currentFilters };
      console.log('✅ Filtros sincronizados com sucesso');
    } else {
      console.warn('⚠️ Componente Filter não está disponível ainda');
    }
  }

  loadBundlesFromAPI() {
    console.log('🔄 Iniciando carregamento de bundles da API...');
    this.bundleService.getAvailableBundles().subscribe({
      next: (bundles) => {
        console.log('📦 Bundles recebidos da API:', bundles.length, bundles);
        
        if (!bundles || !Array.isArray(bundles) || bundles.length === 0) {
          console.warn('⚠️ Nenhum bundle encontrado ou resposta inválida');
          return;
        }
        
        this.allPackages = bundles;
        this.filteredPackages = [...bundles];
        
        // Inicializar packagesWithImages com os dados básicos dos bundles
        this.packagesWithImages = bundles.map(bundle => ({
          ...bundle,
          image: 'assets/imgs/gramado.jpg', // Imagem padrão temporária
          origin: 'Carregando origem...',
          destination: 'Carregando destino...',
          evaluation: this.getRatingFromRankConsistent(bundle.bundleRank, bundle.id),
          duration: this.calculateDuration(bundle.initialDate, bundle.finalDate)
        }));
        
        // Criar backup completo para filtragem
        this.allPackagesWithImages = [...this.packagesWithImages];
        
        console.log('🏗️ Array packagesWithImages inicializado:', this.packagesWithImages.length, this.packagesWithImages);
        
        // Aplicar filtros do localStorage após dados iniciais carregados
        this.applyLocalStorageFiltersAfterLoad();
        
        // Processar cada bundle para obter imagens e localização
        bundles.forEach(bundle => {
          console.log(`🔄 Iniciando processamento do bundle ${bundle.id}...`);
          this.loadBundleImage(bundle);
          this.loadBundleLocation(bundle);
        });
        
        // Log final para verificar o estado do array
        setTimeout(() => {
          console.log('📊 Estado final do packagesWithImages após 2 segundos:', this.packagesWithImages);
        }, 2000);
        
        this.applySorting('popular');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar bundles:', error);
      }
    });
  }

  private loadBundleImage(bundle: BundleClass) {
    console.log(`🖼️ Iniciando carregamento de imagem para bundle ${bundle.id}...`);
    console.log(`🖼️ URL do endpoint: http://localhost:8080/api/medias/images/bundle/${bundle.id}`);
    
    this.bundleService.getBundleImage(bundle.id).subscribe({
      next: (imageResponse: MediaResponse[]) => {
        console.log(`🖼️ Resposta da API de imagem para bundle ${bundle.id}:`, imageResponse);
        console.log(`🖼️ Tipo da resposta:`, typeof imageResponse, Array.isArray(imageResponse));
        
        let imageUrl = 'assets/imgs/gramado.jpg'; // Default
        
        if (imageResponse && Array.isArray(imageResponse) && imageResponse.length > 0) {
          const rawImageUrl = imageResponse[0].mediaUrl;
          imageUrl = this.processImageUrl(rawImageUrl);
          console.log(`🖼️ URL original da API: ${rawImageUrl}`);
          console.log(`🖼️ URL processada: ${imageUrl}`);
        } else {
          console.log(`🖼️ Resposta inválida ou vazia, usando imagem padrão`);
        }
        
        const existingIndex = this.packagesWithImages.findIndex(p => p.id === bundle.id);
        console.log(`🖼️ Index encontrado para bundle ${bundle.id}: ${existingIndex}`);
        
        if (existingIndex !== -1) {
          console.log(`🖼️ Atualizando imagem do bundle ${bundle.id} - antes:`, this.packagesWithImages[existingIndex].image);
          this.packagesWithImages[existingIndex].image = imageUrl;
          
          // Atualizar também no array backup
          const backupIndex = this.allPackagesWithImages.findIndex(p => p.id === bundle.id);
          if (backupIndex !== -1) {
            this.allPackagesWithImages[backupIndex].image = imageUrl;
          }
          
          console.log(`🖼️ Atualizando imagem do bundle ${bundle.id} - depois:`, this.packagesWithImages[existingIndex].image);
          console.log(`🖼️ Backup atualizado. Total no backup:`, this.allPackagesWithImages.length);
        } else {
          console.warn(`🖼️ Bundle ${bundle.id} não encontrado no array packagesWithImages`);
          console.log(`🖼️ Array atual:`, this.packagesWithImages.map(p => ({ id: p.id, title: p.bundleTitle })));
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(`🖼️ Erro ao carregar imagem do bundle ${bundle.id}:`, error);
        console.error(`🖼️ Status do erro:`, error.status);
        console.error(`🖼️ Mensagem do erro:`, error.message);
        
        // Se for erro 404, pode ser que a imagem não exista no servidor
        if (error.status === 404) {
          console.warn(`🖼️ Imagem não encontrada no servidor para bundle ${bundle.id}`);
        }
        
        // Se for erro de CORS ou conexão, pode ser problema de conectividade
        if (error.status === 0) {
          console.warn(`🖼️ Erro de conectividade com o servidor backend`);
        }
        
        const existingIndex = this.packagesWithImages.findIndex(p => p.id === bundle.id);
        if (existingIndex !== -1) {
          this.packagesWithImages[existingIndex].image = 'assets/imgs/gramado.jpg';
          
          // Atualizar também no array backup
          const backupIndex = this.allPackagesWithImages.findIndex(p => p.id === bundle.id);
          if (backupIndex !== -1) {
            this.allPackagesWithImages[backupIndex].image = 'assets/imgs/gramado.jpg';
          }
          
          console.log(`🖼️ Imagem padrão definida para bundle ${bundle.id}`);
        }
        this.cdr.detectChanges();
      }
    });
  }

  private loadBundleLocation(bundle: BundleClass) {
    console.log(`Carregando localização para bundle ${bundle.id}...`);
    this.bundleService.getBundleLocation(bundle.id).subscribe({
      next: (locationResponse) => {
        console.log(`Resposta da localização para bundle ${bundle.id}:`, locationResponse);
        const location = locationResponse.length > 0 ? locationResponse[0] : null;
        const origin = location ? `${location.departure.city}, ${location.departure.states}` : 'Local de origem';
        const destination = location ? `${location.destination.city}, ${location.destination.states}` : 'Destino';
        
        const existingIndex = this.packagesWithImages.findIndex(p => p.id === bundle.id);
        if (existingIndex !== -1) {
          this.packagesWithImages[existingIndex].origin = origin;
          this.packagesWithImages[existingIndex].destination = destination;
          
          // Atualizar também no array backup
          const backupIndex = this.allPackagesWithImages.findIndex(p => p.id === bundle.id);
          if (backupIndex !== -1) {
            this.allPackagesWithImages[backupIndex].origin = origin;
            this.allPackagesWithImages[backupIndex].destination = destination;
          }
          
          console.log(`Localização atualizada para bundle ${bundle.id}: ${origin} -> ${destination}`);
          console.log(`📍 Backup atualizado. Total no backup:`, this.allPackagesWithImages.length);
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(`Erro ao carregar localização do bundle ${bundle.id}:`, error);
        const existingIndex = this.packagesWithImages.findIndex(p => p.id === bundle.id);
        if (existingIndex !== -1) {
          this.packagesWithImages[existingIndex].origin = 'Local de origem';
          this.packagesWithImages[existingIndex].destination = 'Destino';
          
          // Atualizar também no array backup
          const backupIndex = this.allPackagesWithImages.findIndex(p => p.id === bundle.id);
          if (backupIndex !== -1) {
            this.allPackagesWithImages[backupIndex].origin = 'Local de origem';
            this.allPackagesWithImages[backupIndex].destination = 'Destino';
          }
        }
        this.cdr.detectChanges();
      }
    });
  }

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

  private processImageUrl(rawImageUrl: string): string {
    // Validação de entrada
    if (!rawImageUrl || typeof rawImageUrl !== 'string' || rawImageUrl.trim() === '') {
      console.warn('🖼️ URL de imagem inválida ou vazia, usando fallback');
      return 'assets/imgs/gramado.jpg';
    }
    
    const cleanUrl = rawImageUrl.trim();
    
    // Se a URL for relativa, adicionar a base URL do backend
    if (cleanUrl.startsWith('/')) {
      return `${this.BACKEND_BASE_URL}${cleanUrl}`;
    } 
    
    // Se já for uma URL completa, usar como está
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    } 
    
    // Se for um caminho sem barra inicial, adicionar barra e base URL
    return `${this.BACKEND_BASE_URL}/${cleanUrl}`;
  }

  // Método de avaliação consistente (mesmo usado no card)
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

  // Método para obter o texto da ordenação atual
  getSortingDisplayText(): string {
    switch (this.currentFilters.ordenacao) {
      case 'popular': return 'Mais Popular';
      case 'preco': return 'Menor Preço';
      case 'avaliacao': return 'Melhor Avaliação';
      default: return 'Mais Popular';
    }
  }

  // Método para normalizar strings de localização para comparação
  private normalizeLocation(location: string): string {
    if (!location) return '';
    return location.trim().toLowerCase()
      .replace(/\s+/g, ' ') // Múltiplos espaços para um espaço
      .replace(/,\s+/g, ', ') // Padronizar vírgula + espaço
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remover acentos
  }

  // Método para verificar se há filtros ativos
  private hasActiveFilters(): boolean {
    console.log('🔍 Verificando filtros ativos:');
    console.log('   - Tipo de Filtro:', this.currentFilters.tipoFiltro);
    console.log('   - Origem:', `"${this.currentFilters.origem}"`);
    console.log('   - Destino:', `"${this.currentFilters.destino}"`);
    console.log('   - Data Ida:', `"${this.currentFilters.dataIda}"`);
    console.log('   - Data Volta:', `"${this.currentFilters.dataVolta}"`);
    console.log('   - Preço Máximo:', this.currentFilters.precoMaximo);
    console.log('   - Viajantes:', this.currentFilters.viajantes);
    
    // Se não há tipo de filtro selecionado ou é 'none', não há filtros ativos
    if (!this.currentFilters.tipoFiltro || this.currentFilters.tipoFiltro === 'none') {
      console.log('🔍 Resultado hasActiveFilters: false (nenhum tipo selecionado)');
      return false;
    }
    
    // Verificar se o tipo selecionado tem valores preenchidos
    let hasActiveFilters = false;
    
    switch (this.currentFilters.tipoFiltro) {
      case 'localizacao':
        hasActiveFilters = !!(
          (this.currentFilters.origem && this.currentFilters.origem.trim() !== '') ||
          (this.currentFilters.destino && this.currentFilters.destino.trim() !== '')
        );
        break;
      case 'data':
        hasActiveFilters = !!(
          (this.currentFilters.dataIda && this.currentFilters.dataIda.trim() !== '') ||
          (this.currentFilters.dataVolta && this.currentFilters.dataVolta.trim() !== '')
        );
        break;
      case 'preco':
        hasActiveFilters = !!(this.currentFilters.precoMaximo && this.currentFilters.precoMaximo > 0);
        break;
      case 'viajantes':
        hasActiveFilters = !!(this.currentFilters.viajantes && this.currentFilters.viajantes > 1);
        break;
    }
    
    console.log('🔍 Resultado hasActiveFilters:', hasActiveFilters);
    return hasActiveFilters;
  }

  private calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  onFilterChange(filters: FilterCriteria) {
    console.log('🔄 Filtros recebidos no Bundle component:', filters);
    console.log('📦 Pacotes antes da filtragem:', this.packagesWithImages.length);
    console.log('📦 Array backup disponível:', this.allPackagesWithImages.length);
    
    // Debug: mostrar alguns pacotes de exemplo
    if (this.allPackagesWithImages.length > 0) {
      console.log('🔍 Exemplo de pacotes disponíveis:');
      this.allPackagesWithImages.slice(0, 3).forEach((pkg, index) => {
        console.log(`  ${index + 1}. ${pkg.bundleTitle} | Origem: "${pkg.origin}" | Destino: "${pkg.destination}"`);
      });
    }
    
    // Atualizar filtros
    this.currentFilters = filters;
    this.currentSort = filters.ordenacao;
    
    // Verificar se há filtros ativos
    const hasActiveFilters = this.hasActiveFilters();
    
    if (!hasActiveFilters) {
      // Se não há filtros ativos, mostrar todos os pacotes
      console.log('📦 Nenhum filtro ativo, mostrando todos os pacotes');
      this.packagesWithImages = [...this.allPackagesWithImages];
    } else {
      // Se há filtros ativos, aplicar filtragem
      console.log('📦 Filtros ativos detectados, aplicando filtragem');
      this.applyFilters();
    }
    
    // Aplicar ordenação
    this.applySorting(filters.ordenacao);
    
    // Reset para primeira página
    this.currentPage = 1;
    
    console.log('📦 Pacotes após processamento:', this.packagesWithImages.length);
    this.cdr.detectChanges();
  }

  onSortChange(sortBy: string) {
    console.log('🔄 Alteração apenas de ordenação:', sortBy);
    console.log('📦 Estado antes da ordenação:');
    console.log('   - packagesWithImages.length:', this.packagesWithImages.length);
    console.log('   - allPackagesWithImages.length:', this.allPackagesWithImages.length);
    
    this.currentFilters.ordenacao = sortBy;
    this.currentSort = sortBy;
    
    // Verificar se o backup está correto e completo
    if (this.allPackagesWithImages.length !== this.allPackages.length) {
      console.warn('⚠️ Backup incompleto durante ordenação! Reconstruindo...');
      this.rebuildPackagesWithImages();
    }
    
    // Verificar se há filtros ativos
    const hasActiveFilters = this.hasActiveFilters();
    
    if (!hasActiveFilters) {
      // Se não há filtros ativos, usar todos os pacotes disponíveis
      console.log('📦 Nenhum filtro ativo, usando todos os pacotes');
      this.packagesWithImages = [...this.allPackagesWithImages];
    } else {
      // Se há filtros ativos, reaplicar filtros primeiro
      console.log('📦 Filtros ativos detectados, reaplicando filtros');
      this.applyFilters();
    }
    
    // Aplicar ordenação
    this.applySorting(sortBy);
    
    console.log('📦 Estado após ordenação:');
    console.log('   - packagesWithImages.length:', this.packagesWithImages.length);
    this.cdr.detectChanges();
  }

  private applyFilters() {
    console.log('🔄 Aplicando filtros...');
    console.log('📦 Total de pacotes disponíveis:', this.allPackagesWithImages.length);
    console.log('🎯 Filtros aplicados:', this.currentFilters);
    
    // Log dos pacotes disponíveis para debug
    if (this.allPackagesWithImages.length > 0) {
      console.log('📍 Origens disponíveis:', this.allPackagesWithImages.map(p => p.origin).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i));
      console.log('📍 Destinos disponíveis:', this.allPackagesWithImages.map(p => p.destination).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i));
    }
    
    // Verificar se há dados para filtrar
    if (!this.allPackagesWithImages || this.allPackagesWithImages.length === 0) {
      console.warn('⚠️ Array allPackagesWithImages está vazio, não é possível aplicar filtros');
      this.packagesWithImages = [];
      return;
    }
    
    // Sempre filtrar a partir do array completo backup
    this.packagesWithImages = this.allPackagesWithImages.filter(pkg => {
      console.log(`🔍 Analisando pacote: ${pkg.bundleTitle}`);
      console.log(`📍 Origem do pacote: "${pkg.origin}"`);
      console.log(`📍 Destino do pacote: "${pkg.destination}"`);
      
      // Aplicar apenas o tipo de filtro selecionado
      switch (this.currentFilters.tipoFiltro) {
        case 'localizacao':
          return this.applyLocationFilter(pkg);
        case 'preco':
          return this.applyPriceFilter(pkg);
        case 'viajantes':
          return this.applyTravelersFilter(pkg);
        case 'data':
          return this.applyDateFilter(pkg);
        case 'none':
        default:
          // Sem filtros, aprovar todos os pacotes
          console.log(`✅ Pacote APROVADO (sem filtros): ${pkg.bundleTitle}`);
          return true;
      }
    });

    console.log('✅ Pacotes após filtragem:', this.packagesWithImages.length);
    
    if (this.packagesWithImages.length === 0) {
      console.log('⚠️ NENHUM PACOTE ENCONTRADO!');
      console.log('💡 Dicas para encontrar pacotes:');
      
      if (this.currentFilters.origem) {
        console.log(`📍 Você filtrou por ORIGEM: "${this.currentFilters.origem}"`);
        console.log('📍 Origens disponíveis nos pacotes:', 
          this.allPackagesWithImages.map(p => p.origin).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i));
      }
      
      if (this.currentFilters.destino) {
        console.log(`🎯 Você filtrou por DESTINO: "${this.currentFilters.destino}"`);
        console.log('🎯 Destinos disponíveis nos pacotes:', 
          this.allPackagesWithImages.map(p => p.destination).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i));
      }
    }
    
    console.log('📋 Pacotes aprovados:', this.packagesWithImages.map(p => ({
      titulo: p.bundleTitle,
      origem: p.origin,
      destino: p.destination
    })));
    // Remover a chamada duplicada do applySorting aqui
  }

  // Métodos específicos para cada tipo de filtro
  private applyLocationFilter(pkg: any): boolean {
    // Filtro de origem (só aplicar se não estiver vazio)
    if (this.currentFilters.origem && this.currentFilters.origem.trim() !== '') {
      const origemSelecionada = this.normalizeLocation(this.currentFilters.origem);
      const origemPacote = this.normalizeLocation(pkg.origin || '');
      
      console.log(`🔍 Comparando origem normalizada: "${origemSelecionada}" com "${origemPacote}"`);
      
      const matchExato = origemPacote === origemSelecionada;
      const cidadeSelecionada = origemSelecionada.split(',')[0].trim();
      const cidadePacote = origemPacote.split(',')[0].trim();
      const matchCidade = cidadePacote === cidadeSelecionada;
      const match = matchExato || matchCidade;
      
      if (!match) {
        console.log(`🚫 Filtrado por origem: ${pkg.bundleTitle}`);
        return false;
      }
    }

    // Filtro de destino (só aplicar se não estiver vazio)
    if (this.currentFilters.destino && this.currentFilters.destino.trim() !== '') {
      const destinoSelecionado = this.normalizeLocation(this.currentFilters.destino);
      const destinoPacote = this.normalizeLocation(pkg.destination || '');
      
      console.log(`🔍 Comparando destino normalizado: "${destinoSelecionado}" com "${destinoPacote}"`);
      
      const matchExato = destinoPacote === destinoSelecionado;
      const cidadeSelecionada = destinoSelecionado.split(',')[0].trim();
      const cidadePacote = destinoPacote.split(',')[0].trim();
      const matchCidade = cidadePacote === cidadeSelecionada;
      const match = matchExato || matchCidade;
      
      if (!match) {
        console.log(`🚫 Filtrado por destino: ${pkg.bundleTitle}`);
        return false;
      }
    }

    console.log(`✅ Pacote APROVADO (localização): ${pkg.bundleTitle}`);
    return true;
  }

  private applyPriceFilter(pkg: any): boolean {
    if (this.currentFilters.precoMaximo && this.currentFilters.precoMaximo > 0 && pkg.initialPrice > this.currentFilters.precoMaximo) {
      console.log(`🚫 Filtrado por preço: ${pkg.bundleTitle} (R$${pkg.initialPrice} > R$${this.currentFilters.precoMaximo})`);
      return false;
    }
    console.log(`✅ Pacote APROVADO (preço): ${pkg.bundleTitle}`);
    return true;
  }

  private applyTravelersFilter(pkg: any): boolean {
    if (this.currentFilters.viajantes && this.currentFilters.viajantes > 1 && pkg.travelersNumber < this.currentFilters.viajantes) {
      console.log(`🚫 Filtrado por viajantes: ${pkg.bundleTitle} (${pkg.travelersNumber} < ${this.currentFilters.viajantes})`);
      return false;
    }
    console.log(`✅ Pacote APROVADO (viajantes): ${pkg.bundleTitle}`);
    return true;
  }

  private applyDateFilter(pkg: any): boolean {
    // Filtro de data de ida
    if (this.currentFilters.dataIda && this.currentFilters.dataIda.trim() !== '' && pkg.initialDate) {
      const dataIda = new Date(this.currentFilters.dataIda);
      const dataInicioPkg = new Date(pkg.initialDate);
      if (dataInicioPkg < dataIda) {
        console.log(`🚫 Filtrado por data ida: ${pkg.bundleTitle}`);
        return false;
      }
    }

    // Filtro de data de volta
    if (this.currentFilters.dataVolta && this.currentFilters.dataVolta.trim() !== '' && pkg.finalDate) {
      const dataVolta = new Date(this.currentFilters.dataVolta);
      const dataFimPkg = new Date(pkg.finalDate);
      if (dataFimPkg > dataVolta) {
        console.log(`🚫 Filtrado por data volta: ${pkg.bundleTitle}`);
        return false;
      }
    }

    console.log(`✅ Pacote APROVADO (data): ${pkg.bundleTitle}`);
    return true;
  }

  private applySorting(sortBy: string) {
    console.log(`🔄 Aplicando ordenação: ${sortBy}`);
    
    switch (sortBy) {
      case 'popular':
        // Ordenar por avaliação (do maior para menor) usando a mesma lógica do card
        // FUTURO: Implementar ordenação por popularidade real (número de reservas)
        this.packagesWithImages.sort((a, b) => {
          const ratingA = this.getRatingFromRankConsistent(a.bundleRank, a.id);
          const ratingB = this.getRatingFromRankConsistent(b.bundleRank, b.id);
          return ratingB - ratingA;
        });
        console.log('📊 Ordenação aplicada: Mais Popular (melhores avaliações)');
        break;
        
      case 'preco':
        // Ordenar por preço (do menor para maior)
        this.packagesWithImages.sort((a, b) => a.initialPrice - b.initialPrice);
        console.log('💰 Ordenação aplicada: Menor Preço');
        break;
        
      case 'avaliacao':
        // Ordenar por avaliação (do maior para menor)
        this.packagesWithImages.sort((a, b) => {
          const ratingA = this.getRatingFromRankConsistent(a.bundleRank, a.id);
          const ratingB = this.getRatingFromRankConsistent(b.bundleRank, b.id);
          return ratingB - ratingA;
        });
        console.log('⭐ Ordenação aplicada: Melhor Avaliação');
        break;
        
      default:
        // Padrão: ordenar por avaliação
        this.packagesWithImages.sort((a, b) => {
          const ratingA = this.getRatingFromRankConsistent(a.bundleRank, a.id);
          const ratingB = this.getRatingFromRankConsistent(b.bundleRank, b.id);
          return ratingB - ratingA;
        });
        console.log('⚠️ Ordenação padrão aplicada');
        break;
    }
    
    console.log('✅ Ordenação concluída. Total de pacotes:', this.packagesWithImages.length);
  }

  // Métodos de paginação
  getTotalPages(): number {
    return Math.ceil(this.packagesWithImages.length / this.pageSize);
  }

  getPaginatedPackages(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.packagesWithImages.slice(startIndex, endIndex);
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
      // Mostrar todas as páginas se houver 7 ou menos
      for (let i = 1; i <= totalPages; i++) {
        visible.push(i);
      }
    } else {
      // Lógica mais complexa para muitas páginas
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
    return Math.min(this.currentPage * this.pageSize, this.packagesWithImages.length);
  }

  onPageSizeChange() {
    const previousPageSize = this.pageSize;
    this.pageSize = Number(this.pageSize);

    // Garantir que o pageSize não ultrapasse 24
    if (this.pageSize > 24) {
      this.pageSize = 24;
    }

    // Calcular o índice do primeiro item da página atual
    const currentFirstItem = (this.currentPage - 1) * previousPageSize;

    // Recalcular a página baseada no novo tamanho
    this.currentPage = Math.floor(currentFirstItem / this.pageSize) + 1;

    // Garantir que a página esteja dentro dos limites válidos
    const totalPages = this.getTotalPages();
    this.currentPage = Math.max(1, Math.min(this.currentPage, totalPages));
  }

  // Método para reconstruir o array de pacotes com imagens
  private rebuildPackagesWithImages() {
    console.log('🔧 Reconstruindo array packagesWithImages...');
    
    if (!this.allPackages || this.allPackages.length === 0) {
      console.warn('⚠️ Array allPackages está vazio, não é possível reconstruir');
      return;
    }
    
    // Recriar o array a partir dos dados originais da API
    this.packagesWithImages = this.allPackages.map(bundle => {
      // Procurar se já existe dados processados para este bundle
      const existingPackage = this.allPackagesWithImages.find(p => p.id === bundle.id);
      
      return {
        ...bundle,
        image: existingPackage?.image || 'assets/imgs/gramado.jpg',
        origin: existingPackage?.origin || 'Local de origem',
        destination: existingPackage?.destination || 'Destino',
        evaluation: this.getRatingFromRankConsistent(bundle.bundleRank, bundle.id),
        duration: this.calculateDuration(bundle.initialDate, bundle.finalDate)
      };
    });
    
    // Atualizar o backup
    this.allPackagesWithImages = [...this.packagesWithImages];
    
    console.log('🔧 Array reconstruído com', this.packagesWithImages.length, 'pacotes');
  }

  clearAllFilters() {
    console.log('🧹 Limpando todos os filtros');
    console.log('📊 Estado antes da limpeza:');
    console.log('   - packagesWithImages.length:', this.packagesWithImages.length);
    console.log('   - allPackagesWithImages.length:', this.allPackagesWithImages.length);
    console.log('   - allPackages.length:', this.allPackages.length);
    
    // Reset filters using correct interface
    this.currentFilters = {
      tipoFiltro: 'none',
      origem: '',
      destino: '',
      dataIda: '',
      dataVolta: '',
      precoMaximo: 2000,
      viajantes: 2,
      ordenacao: 'popular'
    };
    
    // Reset sorting
    this.currentSort = 'popular';
    
    // Reset pagination
    this.currentPage = 1;
    
    // Reset filter component if available
    if (this.filterComponent) {
      this.filterComponent.resetFilters();
    }
    
    // Verificar se o backup está correto e completo
    if (this.allPackagesWithImages.length !== this.allPackages.length) {
      console.warn('⚠️ Backup incompleto! Reconstruindo...');
      this.rebuildPackagesWithImages();
    }
    
    // Verificar se há filtros ativos após reset
    const hasActiveFilters = this.hasActiveFilters();
    console.log('🔍 Após reset - Filtros ativos?', hasActiveFilters);
    
    // Restaurar todos os pacotes do backup (sem aplicar filtros)
    this.packagesWithImages = [...this.allPackagesWithImages];
    console.log('📦 Pacotes restaurados do backup:', this.packagesWithImages.length);
    
    // Aplicar apenas a ordenação padrão
    this.applySorting('popular');
    
    console.log('✅ Estado após limpeza:');
    console.log('   - packagesWithImages.length:', this.packagesWithImages.length);
    console.log('   - Pacotes exibidos:', this.packagesWithImages.map(p => ({ id: p.id, title: p.bundleTitle })));
    
    // Forçar detecção de mudanças
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
