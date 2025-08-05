import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PaymentCard } from './payment-card/payment-card';
import { PaymentCredit } from './payment-credit/payment-credit';
import { PaymentPix } from './payment-pix/payment-pix';
import { PaymentBoleto } from './payment-boleto/payment-boleto';
import { PaymentButton } from './payment-button/payment-button';
import { PaymentQrCode } from './payment-qr-code/payment-qr-code';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, HttpClientModule, PaymentCard, PaymentCredit, PaymentPix, PaymentBoleto, PaymentButton, PaymentQrCode],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class Payment implements OnInit {
  selectedPaymentMethod: string = 'credito';
  showQrCode: boolean = false;
  showSuccessModal: boolean = false;
  showBoletoModal: boolean = false;
  isPixFormValid: boolean = false;
  isCreditFormValid: boolean = false;
  isBoletoFormValid: boolean = false;
  
  // Dados recebidos da página de booking
  bookingData: any = null;
  reservationId: number | null = null;
  totalAmount: string = '0,00'; // Valor formatado para exibição
  totalAmountNumeric: number = 0; // Valor numérico em reais para envio ao backend
  
  // Dados dos formulários
  creditFormData: any = {};
  pixFormData: any = {};
  boletoFormData: any = {};
  
  // Estados de processamento
  isProcessingPayment: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    // Recuperar dados da navegação vindos da página de booking
    const navigationState = this.router.getCurrentNavigation()?.extras?.state || history.state;
    if (navigationState && navigationState['bookingData']) {
      this.bookingData = navigationState['bookingData'];
      this.totalAmount = this.bookingData.totalPrice || '0,00'; // Valor formatado
      this.totalAmountNumeric = this.bookingData.totalPriceNumeric || 0; // Valor numérico
      
      // Extrair reservationId dos dados de booking
      if (this.bookingData.package && this.bookingData.package.id) {
        // Tentar diferentes fontes para o reservationId
        this.reservationId = this.bookingData.reservationId || 
                           this.bookingData.package.reservationId || 
                           parseInt(this.bookingData.package.id) || null;
      }
      
      console.log('💳 Dados de pagamento recebidos:', this.bookingData);
      console.log('💰 Valor total (formatado):', this.totalAmount);
      console.log('🔢 Valor total (numérico - reais):', this.totalAmountNumeric);
      console.log('🔢 ID da reserva:', this.reservationId);
    } else {
      console.warn('⚠️ Nenhum dado de booking foi recebido');
      // Redirecionar de volta se não há dados
      this.router.navigate(['/booking']);
    }
  }

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

  onCreditFormData(formData: any) {
    this.creditFormData = formData;
    console.log('💳 Dados do formulário de crédito recebidos:', formData);
  }

  onPixFormData(formData: any) {
    this.pixFormData = formData;
    console.log('📱 Dados do formulário PIX recebidos:', formData);
  }

  onBoletoFormData(formData: any) {
    this.boletoFormData = formData;
    console.log('🏦 Dados do formulário de boleto recebidos:', formData);
  }

  onBoletoFormValidation(isValid: boolean) {
    this.isBoletoFormValid = isValid;
  }

  onGenerateQrCode() {
    if (!this.reservationId) {
      alert('Erro: ID da reserva não encontrado. Retorne à página de booking.');
      return;
    }

    if (this.isProcessingPayment) {
      return; // Evitar cliques múltiplos
    }

    // Validar formulário baseado no método de pagamento
    const isFormValid = this.validateCurrentForm();
    if (!isFormValid) {
      alert('Por favor, preencha todos os campos obrigatórios antes de prosseguir.');
      return;
    }

    this.isProcessingPayment = true;

    // Processar pagamento baseado no método selecionado
    if (this.selectedPaymentMethod === 'pix') {
      this.processPixPayment();
    } else if (this.selectedPaymentMethod === 'credito') {
      this.processCreditPayment();
    } else if (this.selectedPaymentMethod === 'boleto') {
      this.processBoletoPayment();
    }
  }

  private validateCurrentForm(): boolean {
    switch (this.selectedPaymentMethod) {
      case 'pix':
        return this.isPixFormValid;
      case 'credito':
        return this.isCreditFormValid;
      case 'boleto':
        return this.isBoletoFormValid;
      default:
        return false;
    }
  }

  private processPixPayment(): void {
    const paymentData = {
      paymentDate: new Date().toISOString(),
      paymentMethod: 'PIX',
      totPrice: this.totalAmountNumeric, // Valor total em reais
      reservationId: this.reservationId
    };

    console.log('💳 Processando pagamento PIX:', paymentData);
    this.makePayment(paymentData);
  }

  private processCreditPayment(): void {
    // Para crédito, precisamos determinar se é crédito ou débito
    // e incluir as parcelas se for crédito
    const isCredit = this.creditFormData.formaPagamento === 'credito';
    const installments = isCredit ? (this.creditFormData.installments || 1) : undefined;

    const paymentData: any = {
      paymentDate: new Date().toISOString(),
      paymentMethod: isCredit ? 'CREDIT' : 'DEBIT',
      totPrice: this.totalAmountNumeric, // Valor total em reais
      reservationId: this.reservationId
    };

    // Adicionar parcelas apenas se for crédito
    if (isCredit) {
      paymentData.installments = installments;
    }

    console.log('💳 Processando pagamento cartão:', paymentData);
    this.makePayment(paymentData);
  }

  private processBoletoPayment(): void {
    const paymentData = {
      paymentDate: new Date().toISOString(),
      paymentMethod: 'BANK_SLIP',
      totPrice: this.totalAmountNumeric, // Valor total em reais
      reservationId: this.reservationId
    };

    console.log('💳 Processando pagamento boleto:', paymentData);
    this.makePayment(paymentData);
  }

  private makePayment(paymentData: any): void {
    this.http.post<any>('http://localhost:8080/api/payments', paymentData).subscribe({
      next: (paymentResponse) => {
        console.log('✅ Pagamento processado com sucesso:', paymentResponse);
        
        // Após o pagamento, criar travel history
        this.createTravelHistory(paymentResponse.id);
      },
      error: (error) => {
        console.error('❌ Erro ao processar pagamento:', error);
        this.isProcessingPayment = false;
        alert('Erro ao processar pagamento. Tente novamente.');
      }
    });
  }

  private createTravelHistory(paymentId: number): void {
    const travelHistoryData = {
      paymentId: paymentId
    };

    console.log('📋 Criando histórico de viagem:', travelHistoryData);

    this.http.post<any>('http://localhost:8080/api/travel-histories', travelHistoryData).subscribe({
      next: (travelHistoryResponse) => {
        console.log('✅ Histórico de viagem criado:', travelHistoryResponse);
        
        // Após criar travel history, confirmar a reserva
        this.confirmReservation();
      },
      error: (error) => {
        console.error('❌ Erro ao criar histórico de viagem:', error);
        this.isProcessingPayment = false;
        alert('Pagamento processado, mas erro ao criar histórico. Entre em contato com o suporte.');
      }
    });
  }

  private confirmReservation(): void {
    console.log('✅ Confirmando reserva ID:', this.reservationId);

    this.http.patch<any>(`http://localhost:8080/api/reservations/${this.reservationId}/confirm/my`, {}).subscribe({
      next: (confirmationResponse) => {
        console.log('✅ Reserva confirmada com sucesso:', confirmationResponse);
        this.isProcessingPayment = false;
        
        // Mostrar modal de sucesso baseado no método de pagamento
        this.showPaymentSuccessModal();
      },
      error: (error) => {
        console.error('❌ Erro ao confirmar reserva:', error);
        this.isProcessingPayment = false;
        alert('Pagamento processado, mas erro na confirmação. Entre em contato com o suporte.');
      }
    });
  }

  private showPaymentSuccessModal(): void {
    if (this.selectedPaymentMethod === 'pix') {
      this.showQrCode = true; // Mostrar QR Code para PIX
    } else if (this.selectedPaymentMethod === 'boleto') {
      this.showBoletoModal = true; // Mostrar modal de boleto
    } else {
      this.showSuccessModal = true; // Mostrar modal de sucesso para cartão
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