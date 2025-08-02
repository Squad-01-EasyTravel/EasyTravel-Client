import { Footer } from '@/app/shared/footer/footer';
import { BookedTrip } from '@/app/shared/models/booked-trip.interface';
import { Navbar } from '@/app/shared/navbar/navbar';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-booking',
  imports: [Navbar, Footer, CommonModule, FormsModule],
  templateUrl: './my-booking.html',
  styleUrl: './my-booking.css'
})
export class MyBooking implements OnInit {
  // Dados de exemplo que virão do back-end
  allBookedTrips: BookedTrip[] = [
    {
      id: '1',
      imageUrl: '/assets/imgs/fortaleza.jpg',
      origin: 'Recife',
      destination: 'São Paulo',
      departureDate: '2025-08-15',
      returnDate: '2025-08-22',
      status: 'Confirmado',
      orderId: '#123456',
      price: 2500,
      duration: 7,
      paymentMethod: 'Cartão de Crédito',
      rating: 4.5,
      description: 'Pacote completo incluindo hospedagem em hotel 4 estrelas, traslados e city tour.'
    },
    {
      id: '2',
      imageUrl: '/assets/imgs/gramado.jpg',
      origin: 'Rio de Janeiro',
      destination: 'Salvador',
      departureDate: '2025-09-10',
      returnDate: '2025-09-17',
      status: 'Confirmado',
      orderId: '#234567',
      price: 1800,
      duration: 7,
      paymentMethod: 'PIX',
      rating: 4.2,
      description: 'Viagem para Salvador com hospedagem na orla, passeios históricos e gastronômicos.'
    },
    {
      id: '3',
      imageUrl: '/assets/imgs/fortaleza.jpg',
      origin: 'São Paulo',
      destination: 'Fortaleza',
      departureDate: '2025-10-25',
      returnDate: '2025-11-01',
      status: 'Pendente',
      orderId: '#345678',
      price: 2200,
      duration: 7,
      description: 'Pacote para Fortaleza com hospedagem em resort all-inclusive.'
    },
    {
      id: '4',
      imageUrl: '/assets/imgs/gramado.jpg',
      origin: 'Brasília',
      destination: 'Recife',
      departureDate: '2025-12-05',
      returnDate: '2025-12-12',
      status: 'Cancelado',
      orderId: '#456789',
      price: 1950,
      duration: 7,
      description: 'Viagem para Recife com foco em praias e cultura local.'
    },
    {
      id: '5',
      imageUrl: '/assets/imgs/fortaleza.jpg',
      origin: 'Belo Horizonte',
      destination: 'Rio de Janeiro',
      departureDate: '2025-11-18',
      returnDate: '2025-11-25',
      status: 'Confirmado',
      orderId: '#567890',
      price: 1600,
      duration: 7,
      paymentMethod: 'Boleto Bancário',
      rating: 4.8,
      description: 'Pacote para Rio de Janeiro incluindo Cristo Redentor, Pão de Açúcar e praias.'
    }
  ];

  // Propriedades para filtros e paginação
  filteredTrips: BookedTrip[] = [];
  paginatedTrips: BookedTrip[] = [];
  selectedStatus: string = 'Todos';
  selectedDepartureDate: string = '';
  selectedReturnDate: string = '';

  // Modal de detalhes
  isModalOpen: boolean = false;
  selectedTrip: BookedTrip | null = null;

  // Paginação
  currentPage: number = 1;
  itemsPerPage: number = 3;
  totalPages: number = 0;

  ngOnInit(): void {
    this.applyFilters();
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
    if (trip.status === 'Confirmado') {
      this.selectedTrip = trip;
      this.isModalOpen = true;
    } else {
      console.log('Ver detalhes básicos do pacote:', trip);
      // Para status não confirmados, pode mostrar informações básicas ou uma mensagem
      alert('Detalhes completos disponíveis apenas para pacotes confirmados.');
    }
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
    console.log('Confirmar pagamento do pacote:', trip);
    // Simular atualização do status
    const tripIndex = this.allBookedTrips.findIndex(t => t.id === trip.id);
    if (tripIndex !== -1) {
      this.allBookedTrips[tripIndex].status = 'Confirmado';
      this.applyFilters();
    }
  }

  cancelTrip(trip: BookedTrip) {
    if (confirm('Tem certeza que deseja cancelar este pacote?')) {
      console.log('Cancelar pacote:', trip);
      // Simular atualização do status
      const tripIndex = this.allBookedTrips.findIndex(t => t.id === trip.id);
      if (tripIndex !== -1) {
        this.allBookedTrips[tripIndex].status = 'Cancelado';
        this.applyFilters();
      }
    }
  }

}
