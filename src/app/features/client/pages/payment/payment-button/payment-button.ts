import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-button.html',
  styleUrl: './payment-button.css'
})
export class PaymentButton {
  @Input() paymentMethod: string = 'credito';
  @Input() isFormValid: boolean = false;
  @Input() isProcessing: boolean = false;
  @Output() buttonClicked = new EventEmitter<void>();

  getButtonText(): string {
    if (this.isProcessing) {
      return 'PROCESSANDO...';
    }
    
    switch (this.paymentMethod) {
      case 'pix':
        return 'GERAR QR CODE';
      case 'credito':
        return 'REALIZAR PAGAMENTO';
      case 'boleto':
        return 'GERAR BOLETO';
      default:
        return 'PROSSEGUIR';
    }
  }

  onButtonClick() {
    if (this.isFormValid && !this.isProcessing) {
      this.buttonClicked.emit();
    }
  }
}
