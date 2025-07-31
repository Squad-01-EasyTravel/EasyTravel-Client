import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../../../shared/navbar/navbar';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface PaymentCard {
  id: number;
  brand: string;
  lastFourDigits: string;
  holderName: string;
  expiryDate: string;
  isDefault: boolean;
  addedDate: string;
}

@Component({
  selector: 'app-pay-info',
  imports: [Navbar, RouterLink, CommonModule, FormsModule],
  templateUrl: './pay-info.html',
  styleUrl: './pay-info.css'
})
export class PayInfo {
  isEditMode = false;
  currentCardId: number | null = null;

  cards: PaymentCard[] = [
    {
      id: 1,
      brand: 'Visa',
      lastFourDigits: '1234',
      holderName: 'João Silva',
      expiryDate: '12/26',
      isDefault: true,
      addedDate: '15/01/2025'
    },
    {
      id: 2,
      brand: 'Mastercard',
      lastFourDigits: '5678',
      holderName: 'João Silva',
      expiryDate: '08/27',
      isDefault: false,
      addedDate: '20/03/2025'
    }
  ];

  openAddCardModal() {
    this.isEditMode = false;
    this.currentCardId = null;
    // Abrir modal do Bootstrap
    const modalElement = document.getElementById('cardModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  editCard(cardId: number) {
    this.isEditMode = true;
    this.currentCardId = cardId;
    const card = this.cards.find(c => c.id === cardId);
    if (card) {
      // Preencher formulário com dados do cartão
      // Abrir modal do Bootstrap
      const modalElement = document.getElementById('cardModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  deleteCard(cardId: number) {
    if (confirm('Tem certeza que deseja remover este cartão?')) {
      this.cards = this.cards.filter(c => c.id !== cardId);
      console.log(`Cartão ${cardId} removido`);
    }
  }

  setAsDefault(cardId: number) {
    // Remove default de todos os cartões
    this.cards.forEach(card => card.isDefault = false);
    // Define o cartão selecionado como default
    const card = this.cards.find(c => c.id === cardId);
    if (card) {
      card.isDefault = true;
      console.log(`Cartão ${cardId} definido como principal`);
    }
  }

  saveCard() {
    if (this.isEditMode && this.currentCardId) {
      // Lógica para salvar alterações do cartão
      console.log('Salvando alterações do cartão:', this.currentCardId);
    } else {
      // Lógica para adicionar novo cartão
      const newCard: PaymentCard = {
        id: Math.max(...this.cards.map(c => c.id)) + 1,
        brand: 'Visa', // Detectar pela entrada
        lastFourDigits: '0000', // Pegar dos inputs
        holderName: 'Nome do Titular', // Pegar do input
        expiryDate: '12/30', // Pegar do input
        isDefault: false,
        addedDate: new Date().toLocaleDateString('pt-BR')
      };
      this.cards.push(newCard);
      console.log('Novo cartão adicionado:', newCard);
    }

    // Fechar modal
    const modalElement = document.getElementById('cardModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
}
