import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-selected',
  imports: [FormsModule, CommonModule],
  templateUrl: './selected.html',
  styleUrl: './selected.css'
})
export class Selected {

  possuiViajantesExtras = false;
  quantidadeViajantesExtras = 0;
  viajantesExtras: any[] = [];

  atualizarQuantidade() {
    const quantidade = this.quantidadeViajantesExtras;
    this.viajantesExtras = Array.from({ length: quantidade }, () => ({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      passaporte: ''
    }));
  }
}
