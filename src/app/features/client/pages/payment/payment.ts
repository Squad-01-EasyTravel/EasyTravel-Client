import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentCard } from './payment-card/payment-card';
import { PaymentCredit } from './payment-credit/payment-credit';
import { PaymentPix } from './payment-pix/payment-pix';
import { PaymentBoleto } from './payment-boleto/payment-boleto';
import { PaymentButton } from './payment-button/payment-button';
import { PaymentQrCode } from './payment-qr-code/payment-qr-code';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, PaymentCard, PaymentCredit, PaymentPix, PaymentBoleto, PaymentButton, PaymentQrCode],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class Payment {
  selectedPaymentMethod: string = 'credito';
  showQrCode: boolean = false;
  showSuccessModal: boolean = false;
  showBoletoModal: boolean = false;
  isPixFormValid: boolean = false;
  isCreditFormValid: boolean = false;
  isBoletoFormValid: boolean = false;

  constructor(private router: Router) {}

  onPaymentMethodSelected(method: string) {
    this.selectedPaymentMethod = method;
    this.showQrCode = false; // Reset QR code view quando muda método
  }

  onPixFormValidation(isValid: boolean) {
    this.isPixFormValid = isValid;
  }

  onCreditFormValidation(isValid: boolean) {
    this.isCreditFormValid = isValid;
  }

  onBoletoFormValidation(isValid: boolean) {
    this.isBoletoFormValid = isValid;
  }

  onGenerateQrCode() {
    if (this.selectedPaymentMethod === 'pix' && this.isPixFormValid) {
      this.showQrCode = true;
    } else if (this.selectedPaymentMethod === 'credito' && this.isCreditFormValid) {
      // Simula processamento de pagamento e mostra modal após 2 segundos
      setTimeout(() => {
        this.showSuccessModal = true;
      }, 2000);
    } else if (this.selectedPaymentMethod === 'boleto' && this.isBoletoFormValid) {
      // Simula geração de boleto e mostra modal específico após 2 segundos
      setTimeout(() => {
        this.showBoletoModal = true;
      }, 2000);
    } else {
      // Mostra mensagem de erro ou destaca campos obrigatórios
      alert('Por favor, preencha todos os campos obrigatórios antes de prosseguir.');
    }
  }

  onVoltarInicio() {
    this.router.navigate(['/home']);
  }

  closeModal() {
    this.showSuccessModal = false;
  }

  closeBoletoModal() {
    this.showBoletoModal = false;
  }
}