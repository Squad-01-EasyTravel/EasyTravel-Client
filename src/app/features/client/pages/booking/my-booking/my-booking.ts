import { Footer } from '@/app/shared/footer/footer';
import { BookedTrip } from '@/app/shared/models/booked-trip.interface';
import { Navbar } from '@/app/shared/navbar/navbar';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '@/app/shared/services/booking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-booking',
  imports: [Navbar, Footer, CommonModule, FormsModule],
  templateUrl: './my-booking.html',
  styleUrl: './my-booking.css'
})
export class MyBooking implements OnInit {
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

  // Modal de aviso
  isWarningModalOpen: boolean = false;
  warningTitle: string = '';
  warningMessage: string = '';
  warningIcon: string = '';

  // Paginação
  currentPage: number = 1;
  itemsPerPage: number = 3;
  totalPages: number = 0;

  constructor(private bookingService: BookingService, private router: Router) {}

  ngOnInit(): void {
    this.loadMyReservations();
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
  }

  // Fechar modal de aviso
  closeWarningModal() {
    this.isWarningModalOpen = false;
    this.warningTitle = '';
    this.warningMessage = '';
    this.warningIcon = '';
  }

  // Tratar erro de carregamento de imagem
  onImageError(event: any): void {
    event.target.src = '/assets/imgs/fortaleza.jpg'; // Imagem padrão
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedTrip = null;
  }

  downloadVoucher(trip: BookedTrip) {
    console.log('Baixar voucher do pacote:', trip);
  }

  rateTrip(trip: BookedTrip) {
    console.log('Avaliar pacote:', trip);
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
          alert('Pacote cancelado com sucesso!');
        },
        error: (error) => {
          console.error('❌ Erro ao cancelar pacote:', error);
          
          let errorMessage = 'Erro ao cancelar o pacote. Tente novamente.';
          
          if (error.status === 403) {
            errorMessage = 'Você não tem permissão para cancelar esta reserva.';
          } else if (error.status === 401) {
            errorMessage = 'Sua sessão expirou. Faça login novamente.';
          } else if (error.status === 404) {
            errorMessage = 'Reserva não encontrada.';
          } else if (error.status === 400) {
            errorMessage = 'Esta reserva não pode ser cancelada.';
          }
          
          alert(errorMessage);
        }
      });
    }
  }

}
