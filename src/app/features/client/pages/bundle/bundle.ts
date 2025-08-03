import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from './card/card';
import { Filter, FilterCriteria } from './filter/filter';
import { Navbar } from '../../../../shared/navbar/navbar';
import { Footer } from '../../../../shared/footer/footer';
import { BundleService } from '../../../../shared/services/bundle-service';
import { BundleClass } from './class/bundle-class';
import { MediaResponse } from '../../../../shared/models/media-response.interface';

@Component({
  selector: 'app-bundle',
  imports: [CommonModule, FormsModule, Card, Navbar, Footer, Filter],
  templateUrl: './bundle.html',
  styleUrl: './bundle.css'
})
export class Bundle implements OnInit {
  // URL base do backend
  private readonly BACKEND_BASE_URL = 'http://localhost:8080';
  
  // Dados da API
  allPackages: BundleClass[] = [];
  filteredPackages: BundleClass[] = [];
  packagesWithImages: any[] = [];

  currentFilters: FilterCriteria = {
    origem: '',
    destino: '',
    dataIda: '',
    dataVolta: '',
    precoMaximo: 2000,
    viajantes: 2,
    ordenacao: 'popular'
  };

  // Paginação
  currentPage = 1;
  pageSize = 6;

  constructor(
    private bundleService: BundleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBundlesFromAPI();
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
          evaluation: this.getEvaluationByRank(bundle.bundleRank),
          duration: this.calculateDuration(bundle.initialDate, bundle.finalDate)
        }));
        
        console.log('🏗️ Array packagesWithImages inicializado:', this.packagesWithImages.length, this.packagesWithImages);
        
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
          console.log(`🖼️ Atualizando imagem do bundle ${bundle.id} - depois:`, this.packagesWithImages[existingIndex].image);
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
          console.log(`Localização atualizada para bundle ${bundle.id}: ${origin} -> ${destination}`);
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(`Erro ao carregar localização do bundle ${bundle.id}:`, error);
        const existingIndex = this.packagesWithImages.findIndex(p => p.id === bundle.id);
        if (existingIndex !== -1) {
          this.packagesWithImages[existingIndex].origin = 'Local de origem';
          this.packagesWithImages[existingIndex].destination = 'Destino';
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

  private calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  onFilterChange(filters: FilterCriteria) {
    this.currentFilters = filters;
    this.applyFilters();
    this.applySorting(filters.ordenacao);
    this.currentPage = 1; // Reset para primeira página
  }

  onSortChange(sortBy: string) {
    this.currentFilters.ordenacao = sortBy;
    this.applySorting(sortBy);
  }

  private applyFilters() {
    this.packagesWithImages = this.packagesWithImages.filter(pkg => {
      // Filtro de origem
      if (this.currentFilters.origem && pkg.origin !== this.currentFilters.origem) {
        return false;
      }

      // Filtro de destino
      if (this.currentFilters.destino && pkg.destination !== this.currentFilters.destino) {
        return false;
      }

      // Filtro de preço máximo
      if (this.currentFilters.precoMaximo && pkg.initialPrice > this.currentFilters.precoMaximo) {
        return false;
      }

      // Filtro de número de viajantes
      if (this.currentFilters.viajantes && pkg.travelersNumber < this.currentFilters.viajantes) {
        return false;
      }

      // Filtro de data de ida
      if (this.currentFilters.dataIda && pkg.initialDate) {
        const dataIda = new Date(this.currentFilters.dataIda);
        const dataInicioPkg = new Date(pkg.initialDate);
        if (dataInicioPkg < dataIda) {
          return false;
        }
      }

      // Filtro de data de volta
      if (this.currentFilters.dataVolta && pkg.finalDate) {
        const dataVolta = new Date(this.currentFilters.dataVolta);
        const dataFimPkg = new Date(pkg.finalDate);
        if (dataFimPkg > dataVolta) {
          return false;
        }
      }

      return true;
    });

    this.applySorting(this.currentFilters.ordenacao);
  }

  private applySorting(sortBy: string) {
    switch (sortBy) {
      case 'popular':
        this.packagesWithImages.sort((a, b) => b.evaluation - a.evaluation);
        break;
      case 'preco':
        this.packagesWithImages.sort((a, b) => a.initialPrice - b.initialPrice);
        break;
      case 'avaliacao':
        this.packagesWithImages.sort((a, b) => b.evaluation - a.evaluation);
        break;
      default:
        this.packagesWithImages.sort((a, b) => b.evaluation - a.evaluation);
        break;
    }
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

  clearAllFilters() {
    this.currentFilters = {
      origem: '',
      destino: '',
      dataIda: '',
      dataVolta: '',
      precoMaximo: 2000,
      viajantes: 2,
      ordenacao: 'popular'
    };
    this.loadBundlesFromAPI(); // Recarregar dados da API
    this.currentPage = 1;
  }
}
