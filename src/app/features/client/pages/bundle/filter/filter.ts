import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterCriteria {
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
export class Filter {
  @Output() filterChange = new EventEmitter<FilterCriteria>();

  filtros: FilterCriteria = {
    origem: '',
    destino: '',
    dataIda: '',
    dataVolta: '',
    precoMaximo: 2000,
    viajantes: 2,
    ordenacao: 'popular'
  };

  dataMinima: string;

  constructor() {
    // Define data mínima como hoje
    const hoje = new Date();
    this.dataMinima = hoje.toISOString().split('T')[0];
  }

  aplicarFiltros() {
    this.filterChange.emit({ ...this.filtros });
  }

  limparTodosFiltros() {
    this.filtros = {
      origem: '',
      destino: '',
      dataIda: '',
      dataVolta: '',
      precoMaximo: 2000,
      viajantes: 2,
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
}
