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
  showLoadingModal: boolean = false;
  loadingStep: number = 1;
  currentSteps: any[] = [];
  
  // Etapas específicas para cada método de pagamento
  pixSteps = [
    { step: 1, text: 'Confirmando dados da reserva', completed: false, active: false },
    { step: 2, text: 'Confirmando dados do usuário', completed: false, active: false },
    { step: 3, text: 'Gerando QR Code', completed: false, active: false }
  ];
  
  creditSteps = [
    { step: 1, text: 'Confirmando dados da reserva', completed: false, active: false },
    { step: 2, text: 'Confirmando dados do usuário', completed: false, active: false },
    { step: 3, text: 'Pagamento aprovado', completed: false, active: false }
  ];
  
  boletoSteps = [
    { step: 1, text: 'Confirmando dados da reserva', completed: false, active: false },
    { step: 2, text: 'Confirmando dados do usuário', completed: false, active: false },
    { step: 3, text: 'Boleto gerado e enviado para o email', completed: false, active: false }
  ];

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
    this.showLoadingModal = true;
    this.loadingStep = 1;
    
    // Definir etapas baseadas no método de pagamento
    this.setStepsForPaymentMethod();
    
    console.log('🔧 DEBUG - isProcessingPayment:', this.isProcessingPayment);
    console.log('🔧 DEBUG - showLoadingModal:', this.showLoadingModal);
    console.log('🔧 DEBUG - loadingStep:', this.loadingStep);
    console.log('🔧 DEBUG - currentSteps:', this.currentSteps);

    // Simular delay para mostrar o loading
    setTimeout(() => {
      // Processar pagamento baseado no método selecionado
      if (this.selectedPaymentMethod === 'pix') {
        this.processPixPayment();
      } else if (this.selectedPaymentMethod === 'credito') {
        this.processCreditPayment();
      } else if (this.selectedPaymentMethod === 'boleto') {
        this.processBoletoPayment();
      }
    }, 300); // Reduzido de 1500ms para 300ms
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

  private setStepsForPaymentMethod(): void {
    // Reset todas as etapas
    this.pixSteps.forEach(step => { step.completed = false; step.active = false; });
    this.creditSteps.forEach(step => { step.completed = false; step.active = false; });
    this.boletoSteps.forEach(step => { step.completed = false; step.active = false; });
    
    // Definir etapas baseadas no método de pagamento
    switch (this.selectedPaymentMethod) {
      case 'pix':
        this.currentSteps = [...this.pixSteps];
        break;
      case 'credito':
        this.currentSteps = [...this.creditSteps];
        break;
      case 'boleto':
        this.currentSteps = [...this.boletoSteps];
        break;
      default:
        this.currentSteps = [...this.pixSteps];
    }
    
    // Ativar primeira etapa
    this.updateStepStatus(1);
  }

  private updateStepStatus(stepNumber: number): void {
    this.currentSteps.forEach((step, index) => {
      if (step.step < stepNumber) {
        step.completed = true;
        step.active = false;
      } else if (step.step === stepNumber) {
        step.completed = false;
        step.active = true;
      } else {
        step.completed = false;
        step.active = false;
      }
    });
  }

  private processPixPayment(): void {
    // Etapa 2: Confirmando dados do usuário
    this.loadingStep = 2;
    this.updateStepStatus(2);
    
    const paymentData = {
      paymentDate: new Date().toISOString(),
      paymentMethod: 'PIX',
      totPrice: this.totalAmountNumeric, // Valor total em reais
      reservationId: this.reservationId
    };

    console.log('💳 Processando pagamento PIX:', paymentData);
    
    // Simular delay para confirmação de dados
    setTimeout(() => {
      // Etapa 3: Gerando QR Code
      this.loadingStep = 3;
      this.updateStepStatus(3);
      
      setTimeout(() => {
        this.makePayment(paymentData);
      }, 400); // Reduzido de 1500ms para 400ms
    }, 500); // Reduzido de 2000ms para 500ms
  }

  private processCreditPayment(): void {
    // Etapa 2: Confirmando dados do usuário
    this.loadingStep = 2;
    this.updateStepStatus(2);
    
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
    
    // Simular delay para confirmação de dados
    setTimeout(() => {
      // Etapa 3: Pagamento aprovado
      this.loadingStep = 3;
      this.updateStepStatus(3);
      
      setTimeout(() => {
        this.makePayment(paymentData);
      }, 400); // Reduzido de 1500ms para 400ms
    }, 500); // Reduzido de 2000ms para 500ms
  }

  private processBoletoPayment(): void {
    // Etapa 2: Confirmando dados do usuário
    this.loadingStep = 2;
    this.updateStepStatus(2);
    
    const paymentData = {
      paymentDate: new Date().toISOString(),
      paymentMethod: 'BANK_SLIP',
      totPrice: this.totalAmountNumeric, // Valor total em reais
      reservationId: this.reservationId
    };

    console.log('💳 Processando pagamento boleto:', paymentData);
    
    // Simular delay para confirmação de dados
    setTimeout(() => {
      // Etapa 3: Boleto gerado e enviado para o email
      this.loadingStep = 3;
      this.updateStepStatus(3);
      
      setTimeout(() => {
        this.makePayment(paymentData);
      }, 400); // Reduzido de 1500ms para 400ms
    }, 500); // Reduzido de 2000ms para 500ms
  }

  private makePayment(paymentData: any): void {
    this.http.post<any>('http://localhost:8080/api/payments', paymentData).subscribe({
      next: (paymentResponse) => {
        console.log('✅ Pagamento processado com sucesso:', paymentResponse);
        
        // Completar última etapa
        this.currentSteps.forEach(step => {
          if (step.step === this.loadingStep) {
            step.completed = true;
            step.active = false;
          }
        });
        
        // Após o pagamento, criar travel history
        setTimeout(() => {
          this.createTravelHistory(paymentResponse.id);
        }, 200); // Reduzido de 1000ms para 200ms
      },
      error: (error) => {
        console.error('❌ Erro ao processar pagamento:', error);
        this.isProcessingPayment = false;
        this.showLoadingModal = false;
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
        setTimeout(() => {
          this.confirmReservation();
        }, 200); // Reduzido de 1000ms para 200ms
      },
      error: (error) => {
        console.error('❌ Erro ao criar histórico de viagem:', error);
        this.isProcessingPayment = false;
        this.showLoadingModal = false;
        alert('Pagamento processado, mas erro ao criar histórico. Entre em contato com o suporte.');
      }
    });
  }

  private confirmReservation(): void {
    console.log('✅ Confirmando reserva ID:', this.reservationId);

    this.http.patch<any>(`http://localhost:8080/api/reservations/${this.reservationId}/confirm/my`, {}).subscribe({
      next: (confirmationResponse) => {
        console.log('✅ Reserva confirmada com sucesso:', confirmationResponse);
        
        // Finalizando processo
        setTimeout(() => {
          this.isProcessingPayment = false;
          this.showLoadingModal = false;
          
          // Mostrar modal de sucesso baseado no método de pagamento
          this.showPaymentSuccessModal();
        }, 500); // Reduzido de 1500ms para 500ms
      },
      error: (error) => {
        console.error('❌ Erro ao confirmar reserva:', error);
        this.isProcessingPayment = false;
        this.showLoadingModal = false;
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