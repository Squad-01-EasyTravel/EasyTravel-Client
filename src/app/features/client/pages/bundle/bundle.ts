import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from './card/card';
import { Filter, FilterCriteria } from './filter/filter';
import { Navbar } from '../../../../shared/navbar/navbar';
import { Footer } from '../../../../shared/footer/footer';

export interface TravelPackage {
  id: string;
  imagem: string;
  preco: number;
  dataInicio: string;
  dataFim: string;
  destino: string;
  localOrigem: string;
  localDestino: string;
  avaliacao: number;
  categoria: string;
  descricao: string;
  incluso: string[];
  maxViajantes: number;
  popularidade: number;
  relevancia: number;
  dataPublicacao: Date;
}

@Component({
  selector: 'app-bundle',
  imports: [CommonModule, FormsModule, Card, Navbar, Footer, Filter],
  templateUrl: './bundle.html',
  styleUrl: './bundle.css'
})
export class Bundle implements OnInit {
  // Dados de exemplo expandidos para demonstrar filtros e paginação
  allPackages: TravelPackage[] = [
    {
      id: '1',
      imagem: '/assets/imgs/fortaleza.jpg',
      preco: 2400,
      dataInicio: '2025-12-01',
      dataFim: '2025-12-07',
      destino: 'Recife',
      localOrigem: 'sao-paulo',
      localDestino: 'recife',
      avaliacao: 4.9,
      categoria: 'Praia',
      descricao: 'Pacote completo para Recife com hospedagem e passeios',
      incluso: ['Hospedagem', 'Café da manhã', 'City tour'],
      maxViajantes: 4,
      popularidade: 95,
      relevancia: 90,
      dataPublicacao: new Date('2025-01-15')
    },
    {
      id: '2',
      imagem: '/assets/imgs/gramado.jpg',
      preco: 3200,
      dataInicio: '2025-02-15',
      dataFim: '2025-02-22',
      destino: 'Rio de Janeiro',
      localOrigem: 'sao-paulo',
      localDestino: 'rio-janeiro',
      avaliacao: 4.7,
      categoria: 'Cidade',
      descricao: 'Explore o Rio de Janeiro com tudo incluído',
      incluso: ['Hospedagem', 'Todas as refeições', 'Passeios'],
      maxViajantes: 6,
      popularidade: 88,
      relevancia: 85,
      dataPublicacao: new Date('2025-01-10')
    },
    {
      id: '3',
      imagem: '/assets/imgs/gramado.jpg',
      preco: 2800,
      dataInicio: '2025-03-20',
      dataFim: '2025-03-27',
      destino: 'Fortaleza',
      localOrigem: 'sao-paulo',
      localDestino: 'fortaleza',
      avaliacao: 4.8,
      categoria: 'Praia',
      descricao: 'Fortaleza e suas belas praias',
      incluso: ['Hospedagem', 'Café da manhã', 'Transfer'],
      maxViajantes: 5,
      popularidade: 92,
      relevancia: 88,
      dataPublicacao: new Date('2025-01-20')
    },
    {
      id: '4',
      imagem: '/assets/imgs/fortaleza.jpg',
      preco: 4500,
      dataInicio: '2025-04-10',
      dataFim: '2025-04-17',
      destino: 'Salvador',
      localOrigem: 'rio-janeiro',
      localDestino: 'salvador',
      avaliacao: 4.6,
      categoria: 'Cultura',
      descricao: 'Salvador histórica e cultural',
      incluso: ['Hospedagem', 'Guia turístico', 'Ingressos'],
      maxViajantes: 8,
      popularidade: 85,
      relevancia: 92,
      dataPublicacao: new Date('2025-01-25')
    },
    {
      id: '5',
      imagem: '/assets/imgs/gramado.jpg',
      preco: 1800,
      dataInicio: '2025-05-05',
      dataFim: '2025-05-10',
      destino: 'Brasília',
      localOrigem: 'sao-paulo',
      localDestino: 'brasilia',
      avaliacao: 4.3,
      categoria: 'Negócios',
      descricao: 'Brasília para viagens de negócios',
      incluso: ['Hospedagem', 'Transfer', 'Wi-Fi'],
      maxViajantes: 2,
      popularidade: 70,
      relevancia: 75,
      dataPublicacao: new Date('2025-02-01')
    },
    {
      id: '6',
      imagem: '/assets/imgs/fortaleza.jpg',
      preco: 3800,
      dataInicio: '2025-06-15',
      dataFim: '2025-06-22',
      destino: 'Manaus',
      localOrigem: 'sao-paulo',
      localDestino: 'manaus',
      avaliacao: 4.9,
      categoria: 'Aventura',
      descricao: 'Aventura na Amazônia',
      incluso: ['Hospedagem', 'Todas as refeições', 'Guia especializado'],
      maxViajantes: 4,
      popularidade: 96,
      relevancia: 95,
      dataPublicacao: new Date('2025-02-05')
    },
    {
      id: '7',
      imagem: '/assets/imgs/gramado.jpg',
      preco: 2100,
      dataInicio: '2025-07-10',
      dataFim: '2025-07-15',
      destino: 'Natal',
      localOrigem: 'recife',
      localDestino: 'natal',
      avaliacao: 4.5,
      categoria: 'Praia',
      descricao: 'Natal e suas dunas encantadoras',
      incluso: ['Hospedagem', 'Café da manhã', 'Passeio de buggy'],
      maxViajantes: 6,
      popularidade: 82,
      relevancia: 80,
      dataPublicacao: new Date('2025-02-10')
    },
    {
      id: '8',
      imagem: '/assets/imgs/fortaleza.jpg',
      preco: 3500,
      dataInicio: '2025-08-20',
      dataFim: '2025-08-27',
      destino: 'Florianópolis',
      localOrigem: 'sao-paulo',
      localDestino: 'florianopolis',
      avaliacao: 4.8,
      categoria: 'Praia',
      descricao: 'Ilha da Magia com suas 42 praias',
      incluso: ['Hospedagem', 'Café da manhã', 'Transfer', 'Seguro viagem'],
      maxViajantes: 4,
      popularidade: 90,
      relevancia: 87,
      dataPublicacao: new Date('2025-02-15')
    },
    {
      id: '9',
      imagem: '/assets/imgs/gramado.jpg',
      preco: 2900,
      dataInicio: '2025-09-05',
      dataFim: '2025-09-12',
      destino: 'Porto Alegre',
      localOrigem: 'sao-paulo',
      localDestino: 'porto-alegre',
      avaliacao: 4.4,
      categoria: 'Cidade',
      descricao: 'Porto Alegre e a cultura gaúcha',
      incluso: ['Hospedagem', 'City tour', 'Degustação de vinhos'],
      maxViajantes: 5,
      popularidade: 78,
      relevancia: 82,
      dataPublicacao: new Date('2025-02-20')
    },
    {
      id: '10',
      imagem: '/assets/imgs/fortaleza.jpg',
      preco: 4200,
      dataInicio: '2025-10-15',
      dataFim: '2025-10-22',
      destino: 'Belo Horizonte',
      localOrigem: 'rio-janeiro',
      localDestino: 'belo-horizonte',
      avaliacao: 4.6,
      categoria: 'Cultura',
      descricao: 'BH e as cidades históricas mineiras',
      incluso: ['Hospedagem', 'Café da manhã', 'Passeios históricos', 'Guia'],
      maxViajantes: 6,
      popularidade: 86,
      relevancia: 89,
      dataPublicacao: new Date('2025-02-25')
    },
    {
      id: '11',
      imagem: '/assets/imgs/gramado.jpg',
      preco: 1950,
      dataInicio: '2025-11-08',
      dataFim: '2025-11-13',
      destino: 'Goiânia',
      localOrigem: 'brasilia',
      localDestino: 'goiania',
      avaliacao: 4.2,
      categoria: 'Negócios',
      descricao: 'Goiânia para eventos corporativos',
      incluso: ['Hospedagem', 'Transfer', 'Sala de reuniões'],
      maxViajantes: 3,
      popularidade: 65,
      relevancia: 70,
      dataPublicacao: new Date('2025-03-01')
    },
    {
      id: '12',
      imagem: '/assets/imgs/fortaleza.jpg',
      preco: 5200,
      dataInicio: '2025-12-15',
      dataFim: '2025-12-23',
      destino: 'Fernando de Noronha',
      localOrigem: 'recife',
      localDestino: 'fernando-noronha',
      avaliacao: 4.9,
      categoria: 'Praia',
      descricao: 'Paraíso ecológico de Fernando de Noronha',
      incluso: ['Hospedagem', 'Todas as refeições', 'Mergulho', 'Taxa ambiental'],
      maxViajantes: 2,
      popularidade: 98,
      relevancia: 97,
      dataPublicacao: new Date('2025-03-05')
    },
    {
      id: '13',
      imagem: '/assets/imgs/gramado.jpg',
      preco: 3300,
      dataInicio: '2025-08-10',
      dataFim: '2025-08-17',
      destino: 'Curitiba',
      localOrigem: 'sao-paulo',
      localDestino: 'curitiba',
      avaliacao: 4.5,
      categoria: 'Cidade',
      descricao: 'Curitiba e seus parques urbanos',
      incluso: ['Hospedagem', 'Café da manhã', 'City tour ecológico'],
      maxViajantes: 4,
      popularidade: 81,
      relevancia: 84,
      dataPublicacao: new Date('2025-03-10')
    },
    {
      id: '14',
      imagem: '/assets/imgs/fortaleza.jpg',
      preco: 2650,
      dataInicio: '2025-07-25',
      dataFim: '2025-07-30',
      destino: 'João Pessoa',
      localOrigem: 'natal',
      localDestino: 'joao-pessoa',
      avaliacao: 4.7,
      categoria: 'Praia',
      descricao: 'João Pessoa, onde o sol nasce primeiro',
      incluso: ['Hospedagem', 'Café da manhã', 'Passeio de catamarã'],
      maxViajantes: 5,
      popularidade: 87,
      relevancia: 85,
      dataPublicacao: new Date('2025-03-15')
    },
    {
      id: '15',
      imagem: '/assets/imgs/gramado.jpg',
      preco: 4800,
      dataInicio: '2025-06-20',
      dataFim: '2025-06-28',
      destino: 'Pantanal',
      localOrigem: 'brasilia',
      localDestino: 'pantanal',
      avaliacao: 4.8,
      categoria: 'Aventura',
      descricao: 'Safari fotográfico no Pantanal',
      incluso: ['Hospedagem', 'Todas as refeições', 'Guia especializado', 'Equipamentos'],
      maxViajantes: 6,
      popularidade: 93,
      relevancia: 91,
      dataPublicacao: new Date('2025-03-20')
    },
    {
      id: '16',
      imagem: '/assets/imgs/fortaleza.jpg',
      preco: 2300,
      dataInicio: '2025-09-18',
      dataFim: '2025-09-23',
      destino: 'Maceió',
      localOrigem: 'salvador',
      localDestino: 'maceio',
      avaliacao: 4.6,
      categoria: 'Praia',
      descricao: 'Maceió e suas águas cristalinas',
      incluso: ['Hospedagem', 'Café da manhã', 'Passeio de jangada'],
      maxViajantes: 4,
      popularidade: 89,
      relevancia: 86,
      dataPublicacao: new Date('2025-03-25')
    },
    {
      id: '17',
      imagem: '/assets/imgs/gramado.jpg',
      preco: 3700,
      dataInicio: '2025-10-05',
      dataFim: '2025-10-12',
      destino: 'Gramado',
      localOrigem: 'porto-alegre',
      localDestino: 'gramado',
      avaliacao: 4.8,
      categoria: 'Romântico',
      descricao: 'Gramado e Canela para casais',
      incluso: ['Hospedagem', 'Café da manhã', 'Fondue', 'Passeios românticos'],
      maxViajantes: 2,
      popularidade: 94,
      relevancia: 92,
      dataPublicacao: new Date('2025-03-30')
    },
    {
      id: '18',
      imagem: '/assets/imgs/fortaleza.jpg',
      preco: 2750,
      dataInicio: '2025-11-20',
      dataFim: '2025-11-25',
      destino: 'Vitória',
      localOrigem: 'belo-horizonte',
      localDestino: 'vitoria',
      avaliacao: 4.4,
      categoria: 'Cidade',
      descricao: 'Vitória e as montanhas capixabas',
      incluso: ['Hospedagem', 'Café da manhã', 'City tour'],
      maxViajantes: 5,
      popularidade: 76,
      relevancia: 78,
      dataPublicacao: new Date('2025-04-01')
    }
  ];

  filteredPackages: TravelPackage[] = [];
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

  ngOnInit() {
    // Adicionar pacotes extras para demonstrar paginação
    this.allPackages = [...this.allPackages, ...this.generateAdditionalPackages()];
    this.filteredPackages = [...this.allPackages];
    this.applySorting('popular');
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
    this.filteredPackages = this.allPackages.filter(pkg => {
      // Filtro de origem
      if (this.currentFilters.origem && pkg.localOrigem !== this.currentFilters.origem) {
        return false;
      }

      // Filtro de destino
      if (this.currentFilters.destino && pkg.localDestino !== this.currentFilters.destino) {
        return false;
      }

      // Filtro de preço máximo
      if (this.currentFilters.precoMaximo && pkg.preco > this.currentFilters.precoMaximo) {
        return false;
      }

      // Filtro de número de viajantes
      if (this.currentFilters.viajantes && pkg.maxViajantes < this.currentFilters.viajantes) {
        return false;
      }

      // Filtro de data de ida (se o pacote tem data início definida)
      if (this.currentFilters.dataIda && pkg.dataInicio) {
        const dataIda = new Date(this.currentFilters.dataIda);
        const dataInicioPkg = new Date(pkg.dataInicio);
        if (dataInicioPkg < dataIda) {
          return false;
        }
      }

      // Filtro de data de volta (se o pacote tem data fim definida)
      if (this.currentFilters.dataVolta && pkg.dataFim) {
        const dataVolta = new Date(this.currentFilters.dataVolta);
        const dataFimPkg = new Date(pkg.dataFim);
        if (dataFimPkg > dataVolta) {
          return false;
        }
      }

      // Filtro de data (exemplo simples)
      if (this.currentFilters.dataIda) {
        const filterDate = new Date(this.currentFilters.dataIda);
        const packageDate = new Date(pkg.dataInicio);
        if (packageDate < filterDate) {
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
        this.filteredPackages.sort((a, b) => b.popularidade - a.popularidade);
        break;
      case 'preco':
        this.filteredPackages.sort((a, b) => a.preco - b.preco);
        break;
      case 'avaliacao':
        this.filteredPackages.sort((a, b) => b.avaliacao - a.avaliacao);
        break;
      default:
        this.filteredPackages.sort((a, b) => b.popularidade - a.popularidade);
        break;
    }
  }

  // Métodos de paginação
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
    return Math.min(this.currentPage * this.pageSize, this.filteredPackages.length);
  }

  onPageSizeChange() {
    const previousPageSize = this.pageSize;
    this.pageSize = Number(this.pageSize);

    // Garantir que o pageSize não ultrapasse 24
    if (this.pageSize > 24) {
      this.pageSize = 24;
    }

    console.log(`Mudança de tamanho da página: ${previousPageSize} → ${this.pageSize}`);
    console.log(`Total de pacotes: ${this.filteredPackages.length}`);
    console.log(`Total de páginas antes: ${Math.ceil(this.filteredPackages.length / previousPageSize)}`);
    console.log(`Total de páginas depois: ${this.getTotalPages()}`);

    // Calcular o índice do primeiro item da página atual
    const currentFirstItem = (this.currentPage - 1) * previousPageSize;

    // Recalcular a página baseada no novo tamanho
    this.currentPage = Math.floor(currentFirstItem / this.pageSize) + 1;

    // Garantir que a página esteja dentro dos limites válidos
    const totalPages = this.getTotalPages();
    this.currentPage = Math.max(1, Math.min(this.currentPage, totalPages));

    console.log(`Página atual após mudança: ${this.currentPage}`);
  }

  // Método adicional para debug
  logPaginationState() {
    console.log('=== Estado da Paginação ===');
    console.log(`Total de pacotes: ${this.filteredPackages.length}`);
    console.log(`Itens por página: ${this.pageSize}`);
    console.log(`Página atual: ${this.currentPage}`);
    console.log(`Total de páginas: ${this.getTotalPages()}`);
    console.log(`Exibindo: ${this.getDisplayStart()}-${this.getDisplayEnd()}`);
    console.log('===========================');
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
    this.applyFilters();
    this.currentPage = 1;
  }

  // ===== MÉTODOS PREPARADOS PARA INTEGRAÇÃO COM BACKEND =====

  /**
   * Carrega pacotes do backend com filtros e paginação
   * @param filters Critérios de filtro
   * @param page Página atual
   * @param pageSize Itens por página
   */
  async loadPackagesFromAPI(filters: FilterCriteria, page: number, pageSize: number): Promise<void> {
    try {
      // TODO: Substituir por chamada real da API
      // const response = await this.packageService.getPackages(filters, page, pageSize);
      // this.allPackages = response.data;
      // this.filteredPackages = response.data;

      // Por enquanto, usando dados mockados
      console.log('Carregando pacotes da API com filtros:', filters);
      console.log('Página:', page, 'Tamanho da página:', pageSize);

    } catch (error) {
      console.error('Erro ao carregar pacotes da API:', error);
      // Fallback para dados mockados em caso de erro
      this.loadMockData();
    }
  }

  /**
   * Busca pacotes com base em critérios específicos
   * @param searchTerm Termo de busca
   * @param filters Filtros adicionais
   */
  async searchPackages(searchTerm: string, filters?: Partial<FilterCriteria>): Promise<void> {
    try {
      // TODO: Implementar busca na API
      // const response = await this.packageService.searchPackages(searchTerm, filters);
      // this.filteredPackages = response.data;

      // Simulação com dados mockados
      this.filteredPackages = this.allPackages.filter(pkg =>
        pkg.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );

      this.currentPage = 1;

    } catch (error) {
      console.error('Erro na busca de pacotes:', error);
    }
  }

  /**
   * Obtém estatísticas dos pacotes para analytics
   */
  async getPackageStats(): Promise<any> {
    try {
      // TODO: Implementar chamada para API de estatísticas
      // return await this.packageService.getStats();

      // Dados mockados para demonstração
      return {
        totalPackages: this.allPackages.length,
        averagePrice: this.allPackages.reduce((sum, pkg) => sum + pkg.preco, 0) / this.allPackages.length,
        topDestinations: this.getTopDestinations(),
        averageRating: this.allPackages.reduce((sum, pkg) => sum + pkg.avaliacao, 0) / this.allPackages.length
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return null;
    }
  }

  /**
   * Carrega dados mockados (fallback)
   */
  private loadMockData(): void {
    // Dados já estão carregados no array allPackages
    this.filteredPackages = [...this.allPackages];
    this.applySorting(this.currentFilters.ordenacao);
  }

  /**
   * Obtém os destinos mais populares
   */
  private getTopDestinations(): string[] {
    const destinationCounts = this.allPackages.reduce((acc, pkg) => {
      acc[pkg.destino] = (acc[pkg.destino] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([destination]) => destination);
  }

  /**
   * Atualiza um pacote específico (para uso futuro)
   * @param packageId ID do pacote
   * @param updatedData Dados atualizados
   */
  async updatePackage(packageId: string, updatedData: Partial<TravelPackage>): Promise<void> {
    try {
      // TODO: Implementar atualização na API
      // await this.packageService.updatePackage(packageId, updatedData);

      // Atualização local para demonstração
      const index = this.allPackages.findIndex(pkg => pkg.id === packageId);
      if (index !== -1) {
        this.allPackages[index] = { ...this.allPackages[index], ...updatedData };
        this.applyFilters(); // Reaplica filtros após atualização
      }

    } catch (error) {
      console.error('Erro ao atualizar pacote:', error);
    }
  }

  /**
   * Remove um pacote (para uso futuro)
   * @param packageId ID do pacote a ser removido
   */
  async deletePackage(packageId: string): Promise<void> {
    try {
      // TODO: Implementar remoção na API
      // await this.packageService.deletePackage(packageId);

      // Remoção local para demonstração
      this.allPackages = this.allPackages.filter(pkg => pkg.id !== packageId);
      this.applyFilters(); // Reaplica filtros após remoção

    } catch (error) {
      console.error('Erro ao remover pacote:', error);
    }
  }

  // Adicionar mais pacotes para teste
  private generateAdditionalPackages(): TravelPackage[] {
    const additionalPackages: TravelPackage[] = [];
    const baseDestinations = ['Campos do Jordão', 'Bonito', 'Jericoacoara', 'Arraial do Cabo', 'Paraty'];
    const baseCategories = ['Aventura', 'Romântico', 'Família', 'Ecoturismo', 'Gastronômico'];

    for (let i = 19; i <= 35; i++) {
      additionalPackages.push({
        id: i.toString(),
        imagem: i % 2 === 0 ? '/assets/imgs/fortaleza.jpg' : '/assets/imgs/gramado.jpg',
        preco: Math.floor(Math.random() * 3000) + 1500,
        dataInicio: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        dataFim: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        destino: baseDestinations[Math.floor(Math.random() * baseDestinations.length)],
        localOrigem: ['sao-paulo', 'rio-janeiro', 'brasilia'][Math.floor(Math.random() * 3)],
        localDestino: baseDestinations[Math.floor(Math.random() * baseDestinations.length)].toLowerCase().replace(/\s+/g, '-'),
        avaliacao: Math.round((Math.random() * 2 + 3) * 10) / 10,
        categoria: baseCategories[Math.floor(Math.random() * baseCategories.length)],
        descricao: `Pacote completo para ${baseDestinations[Math.floor(Math.random() * baseDestinations.length)]}`,
        incluso: ['Hospedagem', 'Café da manhã', 'Transfer'],
        maxViajantes: Math.floor(Math.random() * 6) + 2,
        popularidade: Math.floor(Math.random() * 40) + 60,
        relevancia: Math.floor(Math.random() * 30) + 70,
        dataPublicacao: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      });
    }

    return additionalPackages;
  }
}
