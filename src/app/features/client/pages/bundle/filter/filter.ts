import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BundleService } from '../../../../../shared/services/bundle-service';
import { Location } from '../../../../../shared/models/location.interface';

export interface FilterCriteria {
  tipoFiltro: string; // 'none', 'localização', 'preco', 'viajantes', 'data'
  origem: string;
  destino: string;
  dataIda: string;
  dataVolta: string;
  precoMaximo: number;
  viajantes: number;
  ordenacao: string; // 'popular', 'preco', 'avaliacao'
}

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.html',
  styleUrl: './filter.css'
})
export class Filter implements OnInit {
  @Output() filterChange = new EventEmitter<FilterCriteria>();
  @Output() sortChange = new EventEmitter<string>();

  // Lista de locais da API
  locations: Location[] = [];

  filtros: FilterCriteria = {
    tipoFiltro: 'none',
    origem: '',
    destino: '',
    dataIda: '',
    dataVolta: '',
    precoMaximo: 0,
    viajantes: 1,
    ordenacao: 'popular'
  };

  // Opções de tipos de filtro
  tiposFiltro = [
    { value: 'none', label: 'Nenhum filtro' },
    { value: 'localizacao', label: 'Filtro por Localização' },
    { value: 'preco', label: 'Filtro por Preço' },
    { value: 'viajantes', label: 'Filtro por Número de Viajantes' },
    { value: 'data', label: 'Filtro por Data' }
  ];

  dataMinima: string;

  constructor(private bundleService: BundleService) {
    // Define data mínima como hoje
    const hoje = new Date();
    this.dataMinima = hoje.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.loadLocations();
  }

  loadLocations() {
    console.log('🌍 Carregando locais da API...');
    this.bundleService.getLocations().subscribe({
      next: (locations) => {
        console.log('🌍 Locais recebidos da API:', locations.length, locations);
        this.locations = locations;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar locais:', error);
        // Em caso de erro, manter lista vazia - o usuário verá apenas "Selecione..."
        this.locations = [];
      }
    });
  }

  onTipoFiltroChange() {
    console.log('🔄 Tipo de filtro alterado para:', this.filtros.tipoFiltro);
    
    // Limpar todos os filtros quando o tipo muda
    this.filtros.origem = '';
    this.filtros.destino = '';
    this.filtros.dataIda = '';
    this.filtros.dataVolta = '';
    this.filtros.precoMaximo = 0;
    this.filtros.viajantes = 1;
    
    // Aplicar imediatamente para limpar filtros anteriores
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    console.log('🔧 Filter component - Aplicando filtros...');
    console.log('🔧 Filtros sendo enviados:', this.filtros);
    console.log('🔧 Origem selecionada:', `"${this.filtros.origem}"`);
    console.log('🔧 Destino selecionado:', `"${this.filtros.destino}"`);
    this.filterChange.emit({ ...this.filtros });
  }

  aplicarOrdenacao() {
    this.sortChange.emit(this.filtros.ordenacao);
  }

  limparTodosFiltros() {
    this.filtros = {
      tipoFiltro: 'none',
      origem: '',
      destino: '',
      dataIda: '',
      dataVolta: '',
      precoMaximo: 0,
      viajantes: 1,
      ordenacao: 'popular'
    };
    this.aplicarFiltros();
  }

  definirPreco(preco: number) {
    this.filtros.precoMaximo = preco;
    this.aplicarFiltros();
  }

  alterarViajantes(delta: number) {
    const novoValor = this.filtros.viajantes + delta;
    if (novoValor >= 1 && novoValor <= 10) {
      this.filtros.viajantes = novoValor;
      this.aplicarFiltros();
    }
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR');
  }

  // Método para formatar localização para exibição
  formatLocation(location: Location): string {
    return `${location.city}, ${location.states}`;
  }

  // Método para obter o valor usado na comparação de filtros
  getLocationValue(location: Location): string {
    return `${location.city}, ${location.states}`;
  }

  // Método público para resetar filtros (chamado pelo componente pai)
  resetFilters() {
    console.log('🔄 Resetando filtros no componente Filter...');
    this.filtros = {
      tipoFiltro: 'none',
      origem: '',
      destino: '',
      dataIda: '',
      dataVolta: '',
      precoMaximo: 0,
      viajantes: 1,
      ordenacao: 'popular'
    };
    // Não emitir evento para evitar loop, o componente pai já aplicará os filtros
    console.log('✅ Filtros resetados no componente Filter');
  }
}
