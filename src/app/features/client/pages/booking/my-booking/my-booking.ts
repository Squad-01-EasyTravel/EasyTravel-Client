import { Footer } from '@/app/shared/footer/footer';
import { BookedTrip } from '@/app/shared/models/booked-trip.interface';
import { Navbar } from '@/app/shared/navbar/navbar';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '@/app/shared/services/booking.service';
import { NotificationService } from '@/app/shared/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-booking',
  imports: [Navbar, Footer, CommonModule, FormsModule],
  templateUrl: './my-booking.html',
  styleUrl: './my-booking.css'
})
export class MyBooking implements OnInit, OnDestroy {
  // Dados que virão da API
  allBookedTrips: BookedTrip[] = [];
  isLoading: boolean = true;

  // Propriedades para filtros e paginação
  filteredTrips: BookedTrip[] = [];
  paginatedTrips: BookedTrip[] = [];
  selectedStatus: string = 'Todos';
  selectedDepartureDate: string = '';
  selectedReturnDate: string = '';

  // Modal de detalhes
  isModalOpen: boolean = false;
  selectedTrip: BookedTrip | null = null;
  selectedTripPaymentDetails: any = null;
  selectedTripTravelers: any[] = [];
  isLoadingDetails: boolean = false;

  // Modal de aviso
  isWarningModalOpen: boolean = false;
  warningTitle: string = '';
  warningMessage: string = '';
  warningIcon: string = '';

  // Modal de avaliação
  isRatingModalOpen: boolean = false;
  selectedTripForRating: BookedTrip | null = null;
  currentRating: number = 0;
  ratingComment: string = '';
  existingReview: any = null;
  originalReviewData: any = null; // ✅ Armazenar dados originais para comparação
  isLoadingReview: boolean = false;
  isSavingReview: boolean = false;
  travelHistoryId: number | null = null;
  allUserReviews: any[] = []; // Cache das avaliações do usuário

  // Paginação
  currentPage: number = 1;
  itemsPerPage: number = 3;
  totalPages: number = 0;

  constructor(
    private bookingService: BookingService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadMyReservations();
  }

  ngOnDestroy(): void {
    // Garantir que o scroll seja destravado ao sair da página
    this.unlockBodyScroll();
  }

  // Carregar reservas do usuário via API
  loadMyReservations(): void {
    this.isLoading = true;
    this.bookingService.getMyReservations().subscribe({
      next: (bookings) => {
        this.allBookedTrips = bookings;
        this.isLoading = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Erro ao carregar reservas:', error);
        this.isLoading = false;
        // Em caso de erro, pode exibir uma mensagem ou usar dados de fallback
        this.allBookedTrips = [];
        this.applyFilters();
      }
    });
  }

  // Aplicar filtros
  applyFilters(): void {
    this.filteredTrips = this.allBookedTrips.filter(trip => {
      let matchesStatus = this.selectedStatus === 'Todos' || trip.status === this.selectedStatus;
      let matchesDepartureDate = !this.selectedDepartureDate || trip.departureDate === this.selectedDepartureDate;
      let matchesReturnDate = !this.selectedReturnDate || trip.returnDate === this.selectedReturnDate;

      return matchesStatus && matchesDepartureDate && matchesReturnDate;
    });

    this.totalPages = Math.ceil(this.filteredTrips.length / this.itemsPerPage);
    this.currentPage = 1; // Reset para primeira página
    this.updatePaginatedTrips();
  }

  // Atualizar trips paginados
  updatePaginatedTrips(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTrips = this.filteredTrips.slice(startIndex, endIndex);
  }

  // Métodos de paginação
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedTrips();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedTrips();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedTrips();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Formatação de data
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  // Obter classe CSS para status
  getStatusClass(status: string): string {
    switch(status) {
      case 'Confirmado': return 'text-success';
      case 'Pendente': return 'text-warning';
      case 'Cancelado': return 'text-danger';
      default: return 'text-muted';
    }
  }

  // Obter classe CSS para badge de status
  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'Confirmado': return 'status-confirmado';
      case 'Pendente': return 'status-pendente';
      case 'Cancelado': return 'status-cancelado';
      default: return '';
    }
  }

  // Obter ícone para status
  getStatusIcon(status: string): string {
    switch(status) {
      case 'Confirmado': return 'fas fa-check-circle';
      case 'Pendente': return 'fas fa-clock';
      case 'Cancelado': return 'fas fa-times-circle';
      default: return 'fas fa-question-circle';
    }
  }

  // Obter texto de rodapé baseado no status
  getStatusFooterText(status: string): string {
    switch(status) {
      case 'Confirmado': return 'Para cancelar um pacote pago entre em contato com o Suporte';
      case 'Pendente': return 'Aguardando confirmação do pagamento';
      case 'Cancelado': return 'Pacote cancelado';
      default: return '';
    }
  }

  // Métodos para ações dos botões
  viewDetails(trip: BookedTrip) {
    if (trip.status === 'Cancelado') {
      // Mostrar modal de aviso para pacotes cancelados
      this.showWarningModal(
        'Pacote Cancelado',
        'Este pacote foi cancelado. Não é possível visualizar os detalhes completos de pacotes cancelados. Entre em contato com o suporte se precisar de mais informações.',
        'fas fa-times-circle'
      );
    } else if (trip.status === 'Confirmado') {
      this.selectedTrip = trip;
      this.isModalOpen = true;
      this.lockBodyScroll(); // Travar scroll da página
      this.loadTripDetails(Number(trip.id));
    } else if (trip.status === 'Pendente') {
      // Modal de aviso para pacotes pendentes
      this.showWarningModal(
        'Pagamento Pendente',
        'Este pacote está com pagamento pendente. Detalhes completos disponíveis apenas para pacotes confirmados. Confirme o pagamento para acessar todas as informações.',
        'fas fa-clock'
      );
    } else {
      this.showWarningModal(
        'Acesso Restrito',
        'Detalhes completos disponíveis apenas para pacotes confirmados.',
        'fas fa-info-circle'
      );
    }
  }

  // Mostrar modal de aviso
  showWarningModal(title: string, message: string, icon: string) {
    this.warningTitle = title;
    this.warningMessage = message;
    this.warningIcon = icon;
    this.isWarningModalOpen = true;
    this.lockBodyScroll(); // Travar scroll da página
  }

  // Fechar modal de aviso
  closeWarningModal() {
    this.isWarningModalOpen = false;
    this.warningTitle = '';
    this.warningMessage = '';
    this.warningIcon = '';
    this.unlockBodyScroll(); // Destravar scroll da página
  }

  // Tratar erro de carregamento de imagem
  onImageError(event: any): void {
    event.target.src = '/assets/imgs/fortaleza.jpg'; // Imagem padrão
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedTrip = null;
    this.selectedTripPaymentDetails = null;
    this.selectedTripTravelers = [];
    this.unlockBodyScroll(); // Destravar scroll da página
  }

  // Carregar detalhes da viagem (pagamento e viajantes)
  loadTripDetails(reservationId: number) {
    this.isLoadingDetails = true;
    console.log('🔄 Carregando detalhes para reserva ID:', reservationId);
    
    // Buscar detalhes do pagamento
    this.bookingService.getPaymentDetails(reservationId).subscribe({
      next: (paymentDetails) => {
        console.log('✅ Detalhes do pagamento recebidos:', paymentDetails);
        
        // A API retorna um array, então pegamos o primeiro elemento
        const paymentData = Array.isArray(paymentDetails) && paymentDetails.length > 0 
          ? paymentDetails[0] 
          : paymentDetails;
        
        console.log('💰 Dados do pagamento processados:', paymentData);
        console.log('💰 Valor totPrice original:', paymentData?.totPrice);
        console.log('💰 Tipo do totPrice:', typeof paymentData?.totPrice);
        
        this.selectedTripPaymentDetails = paymentData;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar detalhes do pagamento:', error);
        this.selectedTripPaymentDetails = null;
      }
    });

    // Buscar viajantes da reserva
    this.bookingService.getTravelersByReservation(reservationId).subscribe({
      next: (travelers) => {
        console.log('✅ Viajantes da reserva recebidos:', travelers);
        this.selectedTripTravelers = travelers;
        this.isLoadingDetails = false;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar viajantes:', error);
        this.selectedTripTravelers = [];
        this.isLoadingDetails = false;
      }
    });
  }

  rateTrip(trip: BookedTrip) {
    console.log('🌟 Iniciando avaliação do pacote:', trip);
    this.selectedTripForRating = trip;
    this.isRatingModalOpen = true;
    this.lockBodyScroll(); // Travar scroll da página
    this.resetRatingForm();
    this.loadTravelHistoryAndReview(trip);
  }

  // Resetar formulário de avaliação
  resetRatingForm() {
    console.log('🔄 Resetando formulário de avaliação, isSavingReview antes:', this.isSavingReview);
    this.currentRating = 0;
    this.ratingComment = '';
    this.existingReview = null;
    this.originalReviewData = null; // ✅ Limpar dados originais
    this.travelHistoryId = null;
    this.isSavingReview = false; // ✅ Resetar estado de salvamento
    this.isLoadingReview = false; // ✅ Resetar estado de carregamento
    console.log('✅ Formulário resetado, isSavingReview depois:', this.isSavingReview);
    // Não limpar allUserReviews para manter cache
  }

  // Carregar histórico de viagem e avaliação existente
  loadTravelHistoryAndReview(trip: BookedTrip) {
    this.isLoadingReview = true;
    
    // Primeiro, obter o travelHistoryId através do paymentId
    // Precisamos buscar os detalhes do pagamento primeiro para obter o paymentId
    this.bookingService.getPaymentDetails(Number(trip.id)).subscribe({
      next: (paymentDetails) => {
        console.log('💰 Detalhes do pagamento para avaliação:', paymentDetails);
        
        const paymentData = Array.isArray(paymentDetails) && paymentDetails.length > 0 
          ? paymentDetails[0] 
          : paymentDetails;
        
        if (paymentData?.id) {
          // Agora buscar o travel history usando o paymentId
          this.getTravelHistoryByPayment(paymentData.id);
        } else {
          console.error('❌ PaymentId não encontrado');
          this.isLoadingReview = false;
        }
      },
      error: (error) => {
        console.error('❌ Erro ao carregar detalhes do pagamento para avaliação:', error);
        this.isLoadingReview = false;
      }
    });
  }

  // Buscar travel history pelo paymentId
  getTravelHistoryByPayment(paymentId: number) {
    this.bookingService.getTravelHistoryByPayment(paymentId).subscribe({
      next: (travelHistories) => {
        console.log('📋 Travel histories recebidos:', travelHistories);
        
        if (Array.isArray(travelHistories) && travelHistories.length > 0) {
          const travelHistory = travelHistories[0];
          this.travelHistoryId = travelHistory.id;
          console.log('🆔 TravelHistoryId encontrado:', this.travelHistoryId);
          
          // Agora verificar se já existe uma avaliação
          this.checkExistingReview();
        } else {
          console.error('❌ Travel history não encontrado');
          this.isLoadingReview = false;
        }
      },
      error: (error) => {
        console.error('❌ Erro ao buscar travel history:', error);
        this.isLoadingReview = false;
      }
    });
  }

  // Verificar se já existe avaliação para esta reserva específica
  checkExistingReview() {
    console.log('🔍 Verificando avaliação existente...');
    console.log('🆔 TravelHistoryId:', this.travelHistoryId);
    console.log('📦 BundleId:', this.selectedTripForRating?.bundleId);
    
    // Se ainda não carregamos as avaliações do usuário, carregá-las
    if (this.allUserReviews.length === 0) {
      this.bookingService.getMyReviews().subscribe({
        next: (reviews) => {
          console.log('✅ Todas as avaliações do usuário:', reviews);
          this.allUserReviews = reviews;
          this.findReviewForCurrentTrip();
        },
        error: (error) => {
          console.error('❌ Erro ao carregar avaliações do usuário:', error);
          this.existingReview = null;
          this.isLoadingReview = false;
        }
      });
    } else {
      // Se já temos as avaliações em cache, usá-las
      this.findReviewForCurrentTrip();
    }
  }

  // Encontrar avaliação específica para a viagem atual
  findReviewForCurrentTrip() {
    if (!this.selectedTripForRating || !this.travelHistoryId) {
      console.log('⚠️ Dados insuficientes para buscar avaliação');
      this.existingReview = null;
      this.isLoadingReview = false;
      return;
    }

    // Buscar avaliação que corresponda ao travelHistoryId E bundleId
    const matchingReview = this.allUserReviews.find(review => 
      review.travelHistoryId === this.travelHistoryId && 
      review.bundleId === Number(this.selectedTripForRating?.bundleId)
    );

    if (matchingReview) {
      console.log('✅ Avaliação existente encontrada:', matchingReview);
      this.existingReview = matchingReview;
      
      // Preencher o formulário com os dados existentes
      this.currentRating = this.convertRatingEnumToNumber(matchingReview.rating);
      this.ratingComment = matchingReview.comment || '';
      
      // ✅ Armazenar dados originais para comparação
      this.originalReviewData = {
        rating: this.currentRating,
        comment: this.ratingComment.trim()
      };
      
      console.log('📋 Dados originais armazenados:', this.originalReviewData);
    } else {
      console.log('ℹ️ Nenhuma avaliação encontrada para esta viagem');
      this.existingReview = null;
      this.originalReviewData = null;
    }

    this.isLoadingReview = false;
  }

  // Converter enum de rating para número
  convertRatingEnumToNumber(ratingEnum: string): number {
    switch (ratingEnum) {
      case 'ONE_STAR': return 1;
      case 'TWO_STARS': return 2;
      case 'THREE_STARS': return 3;
      case 'FOUR_STARS': return 4;
      case 'FIVE_STARS': return 5;
      default: return 0;
    }
  }

  // Fechar modal de avaliação
  closeRatingModal() {
    console.log('❌ Fechando modal de avaliação, isSavingReview antes:', this.isSavingReview);
    this.isRatingModalOpen = false;
    this.selectedTripForRating = null;
    this.unlockBodyScroll(); // Destravar scroll da página
    this.resetRatingForm();
    console.log('✅ Modal fechado, isSavingReview depois:', this.isSavingReview);
  }

  // Definir rating (1-5 estrelas)
  setRating(rating: number) {
    this.currentRating = rating;
  }

  // Converter rating numérico para enum da API
  getRatingEnum(rating: number): string {
    switch (rating) {
      case 1: return 'ONE_STAR';
      case 2: return 'TWO_STARS';
      case 3: return 'THREE_STARS';
      case 4: return 'FOUR_STARS';
      case 5: return 'FIVE_STARS';
      default: return 'ONE_STAR';
    }
  }

  // Salvar ou atualizar avaliação
  saveReview() {
    // ✅ Prevenir múltiplas submissões
    if (this.isSavingReview) {
      console.log('⚠️ Já existe uma operação de salvamento em andamento');
      return;
    }

    if (!this.selectedTripForRating || !this.travelHistoryId || this.currentRating === 0) {
      this.notificationService.showWarning(
        'Avaliação Obrigatória', 
        'Por favor, selecione uma avaliação de 1 a 5 estrelas antes de continuar. Sua opinião é muito importante para nós!'
      );
      return;
    }

    if (this.ratingComment.length > 100) {
      this.notificationService.showWarning(
        'Comentário muito longo',
        'Por favor, reduza para no máximo 100 caracteres. Seja objetivo e destaque os pontos mais importantes da sua experiência.'
      );
      return;
    }

    this.isSavingReview = true;
    console.log('🔄 Iniciando salvamento de avaliação, isSavingReview:', this.isSavingReview);

    const reviewData = {
      rating: this.getRatingEnum(this.currentRating),
      comment: this.ratingComment.trim(),
      avaliationDate: new Date().toISOString(),
      travelHistoryId: this.travelHistoryId,
      bundleId: Number(this.selectedTripForRating.bundleId)
    };

    console.log('💾 Dados da avaliação:', reviewData);

    // Verificar se é atualização ou criação
    if (this.existingReview && this.existingReview.id) {
      // ATUALIZAÇÃO de avaliação existente
      console.log('🔄 Atualizando avaliação existente, ID:', this.existingReview.id);
      
      // ✅ Verificar se houve alteração nos dados
      const currentData = {
        rating: this.currentRating,
        comment: this.ratingComment.trim()
      };
      
      // Normalizar dados originais para comparação (tratar comentários vazios/null)
      const originalComment = (this.originalReviewData?.comment || '').trim();
      
      // Validação robusta para verificar alterações
      const hasChanges = !this.originalReviewData || (
        currentData.rating !== this.originalReviewData.rating ||
        currentData.comment !== originalComment
      );
      
      console.log('📊 Dados atuais:', currentData);
      console.log('📊 Dados originais:', { 
        rating: this.originalReviewData?.rating, 
        comment: originalComment 
      });
      console.log('🔄 Houve alterações:', hasChanges);
      
      if (this.originalReviewData && !hasChanges) {
        this.isSavingReview = false; // Resetar estado
        this.notificationService.showInfo(
          'Nenhuma Alteração Detectada',
          'Você não fez nenhuma alteração na sua avaliação. Faça alguma mudança no comentário ou na nota antes de salvar.'
        );
        return;
      }
      
      this.bookingService.updateReview(this.existingReview.id, reviewData).subscribe({
        next: (response) => {
          console.log('✅ Avaliação atualizada com sucesso:', response);
          
          // Limpar cache de avaliações para forçar recarga na próxima vez
          this.allUserReviews = [];
          
          this.notificationService.showSuccess(
            'Avaliação Atualizada!',
            'Sua avaliação foi atualizada com sucesso! Obrigado por compartilhar sua experiência atualizada conosco.'
          );
          this.closeRatingModal();
        },
        error: (error) => {
          console.error('❌ Erro ao atualizar avaliação:', error);
          
          let errorTitle = 'Erro ao Atualizar Avaliação';
          let errorMessage = '';
          
          if (error.status === 403 || error.status === 401) {
            errorMessage = 'Você não tem permissão para atualizar esta avaliação. Verifique se você está logado corretamente.';
          } else if (error.status === 404) {
            errorMessage = 'Avaliação não encontrada. Talvez ela já tenha sido removida.';
          } else if (error.status === 422) {
            errorMessage = 'Dados inválidos fornecidos. Verifique se todos os campos estão preenchidos corretamente.';
          } else if (error.status === 500) {
            errorMessage = 'Erro interno do servidor. Tente novamente em alguns instantes.';
          } else {
            errorMessage = 'Problema de conexão ou erro inesperado. Verifique sua internet e tente novamente.';
          }
          
          this.notificationService.showError(errorTitle, errorMessage);
          this.isSavingReview = false;
        }
      });
    } else {
      // CRIAÇÃO de nova avaliação
      console.log('➕ Criando nova avaliação');
      
      this.bookingService.createReview(reviewData).subscribe({
        next: (response) => {
          console.log('✅ Avaliação criada com sucesso:', response);
          
          // Limpar cache de avaliações para forçar recarga na próxima vez
          this.allUserReviews = [];
          
          this.notificationService.showSuccess(
            'Avaliação Cadastrada!',
            'Sua avaliação foi cadastrada com sucesso! Obrigado por avaliar sua viagem. Sua opinião ajuda outros viajantes a escolherem as melhores experiências.'
          );
          this.closeRatingModal();
        },
        error: (error) => {
          console.error('❌ Erro ao criar avaliação:', error);
          
          let errorTitle = 'Erro ao Criar Avaliação';
          let errorMessage = '';
          
          if (error.status === 403 || error.status === 401) {
            errorMessage = 'Você precisa estar logado para avaliar. Faça login e tente novamente.';
          } else if (error.status === 409) {
            errorMessage = 'Você já avaliou esta viagem. Tente atualizar sua avaliação existente.';
          } else if (error.status === 422) {
            errorMessage = 'Dados inválidos fornecidos. Verifique se a avaliação está entre 1 e 5 estrelas e o comentário não ultrapassa 100 caracteres.';
          } else if (error.status === 500) {
            errorMessage = 'Erro interno do servidor. Tente novamente em alguns instantes.';
          } else {
            errorMessage = 'Problema de conexão ou erro inesperado. Verifique sua internet e tente novamente.';
          }
          
          this.notificationService.showError(errorTitle, errorMessage);
          this.isSavingReview = false;
        }
      });
    }
  }

  // Travar scroll da página
  private lockBodyScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = this.getScrollbarWidth() + 'px';
  }

  // Destravar scroll da página
  private unlockBodyScroll() {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  // Calcular largura da scrollbar para evitar "jump" do layout
  private getScrollbarWidth(): number {
    const scrollDiv = document.createElement('div');
    scrollDiv.style.width = '100px';
    scrollDiv.style.height = '100px';
    scrollDiv.style.overflow = 'scroll';
    scrollDiv.style.position = 'absolute';
    scrollDiv.style.top = '-9999px';
    document.body.appendChild(scrollDiv);
    
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    
    return scrollbarWidth;
  }

  // Converter código do método de pagamento para texto
  getPaymentMethodText(method: string): string {
    switch (method) {
      case 'CREDIT': return 'Cartão de Crédito';
      case 'DEBIT': return 'Cartão de Débito';
      case 'PIX': return 'PIX';
      case 'BOLETO': return 'Boleto';
      default: return method;
    }
  }

  // Formatar valor do pagamento de forma segura
  formatPaymentValue(totPrice: any): string {
    console.log('🔢 Formatando valor:', totPrice, 'Tipo:', typeof totPrice);
    
    // Verificar se o valor é válido
    if (totPrice === null || totPrice === undefined || isNaN(totPrice)) {
      console.log('⚠️ Valor inválido, retornando "Não disponível"');
      return 'Não disponível';
    }
    
    // Converter para número se for string
    const numericValue = typeof totPrice === 'string' ? parseFloat(totPrice) : totPrice;
    
    if (isNaN(numericValue)) {
      console.log('⚠️ Não foi possível converter para número');
      return 'Não disponível';
    }
    
    // O valor já vem em reais (número inteiro), não precisa dividir por 100
    console.log('💰 Valor em reais:', numericValue);
    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  }

  // Método para renderizar estrelas da avaliação
  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  confirmPayment(trip: BookedTrip) {
    console.log('🔄 Redirecionando para página de pagamento com dados da reserva:', trip);
    
    // Navegar para a página booking com os dados da reserva
    this.router.navigate(['/booking'], {
      state: {
        reservationData: {
          id: trip.id,
          bundleId: trip.bundleId,
          title: `${trip.origin} - ${trip.destination}`,
          imageUrl: trip.imageUrl,
          startDate: trip.departureDate,
          endDate: trip.returnDate,
          travelers: 1, // Pode ser ajustado conforme necessário
          duration: trip.duration,
          description: trip.description,
          price: trip.price,
          orderId: trip.orderId,
          status: trip.status
        }
      }
    });
  }

  cancelTrip(trip: BookedTrip) {
    if (confirm('Tem certeza que deseja cancelar este pacote?')) {
      console.log('🚫 Iniciando cancelamento do pacote:', trip);
      
      this.bookingService.cancelBooking(trip.id).subscribe({
        next: (response) => {
          console.log('✅ Reserva cancelada com sucesso:', response);
          
          // Atualizar o status local imediatamente
          const tripIndex = this.allBookedTrips.findIndex(t => t.id === trip.id);
          if (tripIndex !== -1) {
            this.allBookedTrips[tripIndex].status = 'Cancelado';
            this.applyFilters();
          }
          
          // Mostrar mensagem de sucesso
          this.notificationService.showSuccess(
            'Reserva Cancelada!',
            'Sua reserva foi cancelada com sucesso. Você pode fazer uma nova reserva a qualquer momento.'
          );
        },
        error: (error) => {
          console.error('❌ Erro ao cancelar pacote:', error);
          
          let errorTitle = 'Erro ao Cancelar Reserva';
          let errorMessage = '';
          
          if (error.status === 403) {
            errorMessage = 'Você não tem permissão para cancelar esta reserva.';
          } else if (error.status === 401) {
            errorMessage = 'Sua sessão expirou. Faça login novamente para continuar.';
          } else if (error.status === 404) {
            errorMessage = 'Reserva não encontrada. Talvez ela já tenha sido cancelada.';
          } else if (error.status === 400) {
            errorMessage = 'Esta reserva não pode ser cancelada no momento.';
          } else {
            errorMessage = 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.';
          }
          
          this.notificationService.showError(errorTitle, errorMessage);
        }
      });
    }
  }

}
