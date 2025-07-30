import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../../../shared/navbar/navbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pay-info',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './pay-info.html',
  styleUrl: './pay-info.css'
})
export class PayInfo {
  cards = [
    {
      id: 'card1',
      type: 'Mastercard',
      lastDigits: '1234',
      expiry: '06/2026',
      isDefault: true
    },
    {
      id: 'card2',
      type: 'Mastercard',
      lastDigits: '1234',
      expiry: '06/2026',
      isDefault: false
    },
    {
      id: 'card3',
      type: 'Mastercard',
      lastDigits: '1234',
      expiry: '06/2026',
      isDefault: false
    },
    {
      id: 'card4',
      type: 'Mastercard',
      lastDigits: '1234',
      expiry: '06/2026',
      isDefault: false
    }
  ];

  setDefaultCard(selectedCardId: string) {
    // Desmarcar todos os cartões
    this.cards.forEach(card => {
      card.isDefault = false;
    });
    
    // Marcar apenas o cartão selecionado
    const selectedCard = this.cards.find(card => card.id === selectedCardId);
    if (selectedCard) {
      selectedCard.isDefault = true;
    }
  }

  editCard(cardId: string) {
    console.log('Editando cartão:', cardId);
    // Aqui você pode implementar a lógica de edição
  }

  addNewCard() {
    console.log('Adicionando novo cartão');
    // Aqui você pode implementar a lógica para adicionar novo cartão
  }
}
