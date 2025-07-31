import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-payment-button',
  standalone: true,
  imports: [],
  templateUrl: './payment-button.html',
  styleUrl: './payment-button.css'
})
export class PaymentButton {
  @Input() paymentMethod: string = 'credito';
  @Input() isFormValid: boolean = false;
  @Output() buttonClicked = new EventEmitter<void>();

  getButtonText(): string {
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
    if (this.isFormValid) {
      this.buttonClicked.emit();
    }
  }
}
