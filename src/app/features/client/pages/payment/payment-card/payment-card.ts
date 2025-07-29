import { Component } from '@angular/core';

@Component({
  selector: 'app-payment-card',
  standalone: true,
  imports: [],
  templateUrl: './payment-card.html',
  styleUrl: './payment-card.css'
})
export class PaymentCard {
  selectedCard: string = '';
  
  selectCard(cardType: string) {
    this.selectedCard = cardType;
    
    // Remove seleção de todos os cards
    const allCards = document.querySelectorAll('.card-button-style');
    allCards.forEach(card => card.classList.remove('selecionado'));
    
    // Adiciona seleção ao card clicado
    const selectedCard = document.querySelector(`[data-card="${cardType}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selecionado');
    }
  }
}
