import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Navbar } from '../../../../../shared/navbar/navbar';
import { Footer } from '../../../../../shared/footer/footer';
import { CartConfirmationModal } from '../../../../../shared/cart-confirmation-modal/cart-confirmation-modal';
import { BundleService } from '@/app/shared/services/bundle-service';
import { BookingService } from '@/app/shared/services/booking.service';
import { NotificationService } from '@/app/shared/services/notification.service';
import { CartConfirmationService } from '@/app/shared/services/cart-confirmation.service';
import { AuthService } from '@/app/shared/services/auth.service';
import { ReviewService, ReviewWithUser } from '@/app/shared/services/review.service';
import { BundleClass } from '../class/bundle-class';
import { MediaResponse } from '../../../../../shared/models/media-response.interface';
import { BundleLocationResponse } from '../../../../../shared/models/bundle-location-response.interface';

// Interface para review do backend
interface ReviewResponse {
  id: number;
  rating: string; // 'FIVE_STARS', 'FOUR_STARS', etc.
  comment: string;
  avaliationDate: string;
  travelHistoryId: number;
  bundleId: number;
}

// Interface para tipagem do pacote
interface Pacote {
  id: number;
  titulo: string;
  imagemPrincipal: string;
  preco: number;
  avaliacao: number;
  totalAvaliacoes: number;
  dataIda: string;
  dataVolta: string;
  duracao: string;
  tipoViagem: string;
  incluso: string;
  categoria: string;
  localizacao: string;
  descricaoCompleta: string;
  destino: string;
  localPartida: string;
  localDestino: string;
  descricaoIncluso: string;
  avaliacoes: Avaliacao[];
}

interface Avaliacao {
  id: number;
  nomeUsuario: string;
  avatarUsuario: string;
  nota: number;
  comentario: string;
  dataAvaliacao: Date;
}

@Component({
  selector: 'app-details-bundle',
  imports: [CommonModule, FormsModule, HttpClientModule, Navbar, Footer, CartConfirmationModal],
  templateUrl: './details-bundle.html',
  styleUrl: './details-bundle.css'
})
export class DetailsBundle implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: BundleService,
    private bookingService: BookingService,
    private notificationService: NotificationService,
    private cartConfirmationService: CartConfirmationService,
    private authService: AuthService,
    private reviewService: ReviewService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  // Dados do pacote (virão do back-end)
  pacote: Pacote | null = null;
  numeroPassageiros: number = 1;
  
  // Reviews do backend
  reviews: ReviewResponse[] = [];
  reviewsWithUsers: ReviewWithUser[] = []; // Nova propriedade para reviews com nomes de usuários
  
  // Carrossel de reviews
  currentReviewIndex = 0;
  reviewsPerPage = 3;
  isLoadingReviews = false;

  // Paginação das avaliações (manter para compatibilidade)
  avaliacoesPaginadas: Avaliacao[] = [];
  paginaAtual: number = 1;
  itensPorPagina: number = 3;
  totalPaginas: number = 0;

  // Dados de exemplo para avaliações sumarizadas
  avaliacoesSumarizado = [
    { numero: 5, porcentagem: 85 },
    { numero: 4, porcentagem: 10 },
    { numero: 3, porcentagem: 3 },
    { numero: 2, porcentagem: 1 },
    { numero: 1, porcentagem: 1 }
  ];

  // Avaliações de exemplo (remover quando integrar com back-end)
  avaliacoesExemplo: Avaliacao[] = [
    {
      id: 1,
      nomeUsuario: 'Allan Reymond',
      avatarUsuario: '/assets/imgs/fortaleza.jpg',
      nota: 4,
      comentario: '"Minha viagem de Recife para São Paulo foi incrível! O voo foi tranquilo e a chegada no Aeroporto de Guarulhos foi bem organizada. Fiquei hospedado em um hotel na região da Avenida Paulista — localização excelente, perto de metrô, restaurantes e pontos turísticos. O quarto era confortável, limpo e com um bom café da manhã incluso."',
      dataAvaliacao: new Date('2024-01-15')
    },
    {
      id: 2,
      nomeUsuario: 'Maria Silva',
      avatarUsuario: '/assets/imgs/fortaleza.jpg',
      nota: 5,
      comentario: '"Experiência fantástica! A organização do pacote foi impecável e o atendimento superou minhas expectativas. Recomendo para quem quer conhecer São Paulo com tranquilidade."',
      dataAvaliacao: new Date('2024-01-10')
    },
    {
      id: 3,
      nomeUsuario: 'João Santos',
      avatarUsuario: '/assets/imgs/fortaleza.jpg',
      nota: 5,
      comentario: '"Viagem maravilhosa! O hotel era excelente e os passeios inclusos foram muito bem planejados. A equipe foi super prestativa em todos os momentos."',
      dataAvaliacao: new Date('2024-01-08')
    },
    {
      id: 4,
      nomeUsuario: 'Ana Paula',
      avatarUsuario: '/assets/imgs/fortaleza.jpg',
      nota: 4,
      comentario: '"Ótima experiência! São Paulo é uma cidade incrível e o pacote cobriu os principais pontos turísticos. O único ponto a melhorar seria o tempo livre para explorar por conta própria."',
      dataAvaliacao: new Date('2024-01-05')
    },
    {
      id: 5,
      nomeUsuario: 'Carlos Oliveira',
      avatarUsuario: '/assets/imgs/fortaleza.jpg',
      nota: 5,
      comentario: '"Perfeito do início ao fim! A hospedagem era de primeira qualidade e as refeições incluídas estavam deliciosas. Já estou planejando a próxima viagem com vocês."',
      dataAvaliacao: new Date('2024-01-03')
    },
    {
      id: 6,
      nomeUsuario: 'Fernanda Costa',
      avatarUsuario: '/assets/imgs/fortaleza.jpg',
      nota: 4,
      comentario: '"Adorei a viagem! O roteiro foi bem elaborado e conseguimos conhecer os principais pontos turísticos. O transporte foi pontual e confortável."',
      dataAvaliacao: new Date('2024-01-01')
    },
    {
      id: 7,
      nomeUsuario: 'Roberto Lima',
      avatarUsuario: '/assets/imgs/fortaleza.jpg',
      nota: 5,
      comentario: '"Superou todas as minhas expectativas! A cidade de São Paulo é fascinante e o pacote permitiu conhecê-la de forma completa e organizada."',
      dataAvaliacao: new Date('2023-12-28')
    }
  ];

  id!: string;
  bundleClass: BundleClass = new BundleClass();
  bundleImageUrl: string = '';
  
  // Propriedades para localização
  departureLocation: string = '';
  destinationLocation: string = '';
  
  // Propriedades para Google Maps
  googleMapsEmbedUrl: string = '';
  safeGoogleMapsUrl: SafeResourceUrl | null = null;
  private readonly googleMapsApiKey: string = 'AIzaSyDpBEGEaO3fAaNOWHt4voCheJDGmQwRBLs';
  
  // Propriedades para datas formatadas
  formattedDepartureDate: string = '';
  formattedReturnDate: string = '';
  
  // Propriedade para duração calculada
  calculatedDuration: string = '';
  
  // Propriedade para avaliação calculada (mockada - será substituída pela real)
  calculatedRating: number = 5;
  
  // Propriedades para avaliação real baseada nas reviews
  realAverageRating: number = 0; // Média exata para exibição
  realStarsRating: number = 0;   // Média arredondada para estrelas
  reviewsLoaded: boolean = false; // Flag para controlar quando reviews foram carregadas

  ngOnInit():void {
    this.id = this.route.snapshot.paramMap.get('id') as string;
    this.service.getBundleById(this.id)
    .subscribe(res => {
      this.bundleClass = res;
      this.loadBundleImage();
      this.loadBundleLocation();
      this.formatDates();
      this.calculateBundleDuration();
      this.calculateBundleRating();
      this.loadBundleReviews(); // Carregar reviews do backend
    });
  }

  loadBundleImage(): void {
    if (this.id) {
      console.log(`🖼️ Iniciando carregamento de imagem para bundle ${this.id}...`);
      console.log(`🖼️ URL do endpoint: http://localhost:8080/api/medias/images/bundle/${this.id}`);
      
      this.service.getBundleImage(parseInt(this.id)).subscribe({
        next: (imageResponse: MediaResponse[]) => {
          console.log(`🖼️ Resposta da API de imagem para bundle ${this.id}:`, imageResponse);
          console.log(`🖼️ Tipo da resposta:`, typeof imageResponse, Array.isArray(imageResponse));
          
          if (imageResponse && Array.isArray(imageResponse) && imageResponse.length > 0) {
            const rawImageUrl = imageResponse[0].mediaUrl;
            this.bundleImageUrl = this.processImageUrl(rawImageUrl);
            console.log(`🖼️ URL original da API: ${rawImageUrl}`);
            console.log(`🖼️ URL processada: ${this.bundleImageUrl}`);
          } else {
            console.log(`🖼️ Resposta inválida ou vazia, usando imagem padrão`);
            this.bundleImageUrl = 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=400&fit=crop';
          }
        },
        error: (error) => {
          console.error(`❌ Erro ao carregar imagem para bundle ${this.id}:`, error);
          this.bundleImageUrl = 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=400&fit=crop';
        }
      });
    }
  }

  private processImageUrl(rawUrl: string): string {
    console.log(`🔄 Processando URL da imagem: ${rawUrl}`);
    
    if (!rawUrl) {
      console.log(`❌ URL vazia, retornando imagem padrão`);
      return 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=400&fit=crop';
    }

    // Se já for uma URL completa (http/https), retorna como está
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      console.log(`✅ URL já é completa: ${rawUrl}`);
      return rawUrl;
    }

    // Se começar com /, remove a barra inicial
    const cleanUrl = rawUrl.startsWith('/') ? rawUrl.substring(1) : rawUrl;
    const processedUrl = `http://localhost:8080/${cleanUrl}`;
    
    console.log(`🔄 URL processada: ${processedUrl}`);
    return processedUrl;
  }

  onImageError(): void {
    console.log('❌ Erro ao carregar imagem no HTML, aplicando fallback');
    this.bundleImageUrl = 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=400&fit=crop';
  }

  loadBundleLocation(): void {
    if (this.id) {
      console.log(`🗺️ Iniciando carregamento de localização para bundle ${this.id}...`);
      
      this.service.getBundleLocation(parseInt(this.id)).subscribe({
        next: (locationResponse: BundleLocationResponse[]) => {
          console.log(`🗺️ Resposta da API de localização para bundle ${this.id}:`, locationResponse);
          
          if (locationResponse && Array.isArray(locationResponse) && locationResponse.length > 0) {
            const location = locationResponse[0];
            
            // Formatar local de partida
            if (location.departure) {
              this.departureLocation = `${location.departure.city}, ${location.departure.states} - ${location.departure.country.trim()}`;
              console.log(`🛫 Local de partida: ${this.departureLocation}`);
            }
            
            // Formatar local de destino
            if (location.destination) {
              this.destinationLocation = `${location.destination.city}, ${location.destination.states} - ${location.destination.country.trim()}`;
              console.log(`🛬 Local de destino: ${this.destinationLocation}`);
            }
            
            // Gerar URL do Google Maps após carregar as localizações
            this.generateGoogleMapsUrl(location);
          } else {
            console.log(`🗺️ Resposta de localização inválida ou vazia`);
            this.departureLocation = 'Local de partida não informado';
            this.destinationLocation = 'Local de destino não informado';
          }
        },
        error: (error) => {
          console.error(`❌ Erro ao carregar localização para bundle ${this.id}:`, error);
          this.departureLocation = 'Erro ao carregar local de partida';
          this.destinationLocation = 'Erro ao carregar local de destino';
        }
      });
    }
  }

  formatDates(): void {
    console.log(`📅 Formatando datas do bundle...`);
    
    // Formatar data de partida
    if (this.bundleClass.initialDate) {
      this.formattedDepartureDate = this.formatDate(this.bundleClass.initialDate);
      console.log(`📅 Data de partida formatada: ${this.formattedDepartureDate}`);
    }
    
    // Formatar data de retorno
    if (this.bundleClass.finalDate) {
      this.formattedReturnDate = this.formatDate(this.bundleClass.finalDate);
      console.log(`📅 Data de retorno formatada: ${this.formattedReturnDate}`);
    }
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString; // Retorna a data original se houver erro
    }
  }

  calculateBundleDuration(): void {
    console.log(`⏱️ Calculando duração do bundle...`);
    
    if (this.bundleClass.initialDate && this.bundleClass.finalDate) {
      const duration = this.calculateDuration(this.bundleClass.initialDate, this.bundleClass.finalDate);
      this.calculatedDuration = `${duration} ${duration === 1 ? 'dia' : 'dias'}`;
      console.log(`⏱️ Duração calculada: ${this.calculatedDuration}`);
    } else {
      console.log(`⏱️ Datas não disponíveis para cálculo de duração`);
      this.calculatedDuration = 'Duração não informada';
    }
  }

  private calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  calculateBundleRating(): void {
    console.log(`⭐ Calculando avaliação do bundle...`);
    
    if (this.bundleClass.bundleRank && this.bundleClass.id) {
      this.calculatedRating = this.getRatingFromRankConsistent(this.bundleClass.bundleRank, this.bundleClass.id);
      console.log(`⭐ Rank do bundle: ${this.bundleClass.bundleRank}`);
      console.log(`⭐ Avaliação calculada: ${this.calculatedRating} estrelas`);
    } else {
      console.log(`⭐ Dados de rank não disponíveis, usando avaliação padrão`);
      this.calculatedRating = 5; // Valor padrão
    }
  }

  // Método de avaliação consistente (mesmo usado na página bundle)
  private getRatingFromRankConsistent(rank: string, bundleId: number): number {
    switch (rank.toUpperCase()) {
      case 'BRONZE': return 1;
      case 'SILVER': 
      case 'PRATA': return 2;
      case 'GOLD': 
      case 'OURO': return 3;
      case 'PLATINUM': 
      case 'PLATINA': 
        return (bundleId % 2 === 0) ? 4 : 5;
      default: return 3;
    }
  }

  // Método para gerar URL do Google Maps Embed API
  private generateGoogleMapsUrl(location: BundleLocationResponse): void {
    console.log(`🗺️ Gerando URL do Google Maps...`);
    
    if (!location.departure || !location.destination) {
      console.log(`❌ Dados de localização insuficientes para gerar mapa`);
      this.googleMapsEmbedUrl = '';
      this.safeGoogleMapsUrl = null;
      return;
    }

    // Formatar origem e destino para a API do Google Maps
    const origin = this.formatLocationForMaps(location.departure.city, location.departure.states, location.departure.country);
    const destination = this.formatLocationForMaps(location.destination.city, location.destination.states, location.destination.country);
    
    // Construir URL da API do Google Maps Embed
    const baseUrl = 'https://www.google.com/maps/embed/v1/directions';
    const params = new URLSearchParams({
      key: this.googleMapsApiKey,
      origin: origin,
      destination: destination,
      mode: 'flying',
      units: 'metric',
      language: 'pt-BR',
      region: 'BR'
    });

    this.googleMapsEmbedUrl = `${baseUrl}?${params.toString()}`;
    
    // Sanitizar a URL para uso no iframe
    this.safeGoogleMapsUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.googleMapsEmbedUrl);
    
    console.log(`🗺️ Origem: ${origin}`);
    console.log(`🗺️ Destino: ${destination}`);
    console.log(`🗺️ URL do Google Maps gerada: ${this.googleMapsEmbedUrl}`);
  }

  // Método auxiliar para formatar localização para a API do Google Maps
  private formatLocationForMaps(city: string, state: string, country: string): string {
    // Remove espaços extras do país e formata para o padrão da API
    const cleanCountry = country.trim();
    const countryName = cleanCountry === 'BR' ? 'Brazil' : cleanCountry;
    
    // Formato: "Cidade, Estado, País" com caracteres especiais codificados para URL
    return `${city}, ${state}, ${countryName}`;
  }

  // Métodos de paginação
  configurarPaginacao() {
    const avaliacoes = this.pacote?.avaliacoes || this.avaliacoesExemplo;
    this.totalPaginas = Math.ceil(avaliacoes.length / this.itensPorPagina);
    this.atualizarAvaliacoesPaginadas();
  }

  atualizarAvaliacoesPaginadas() {
    const avaliacoes = this.pacote?.avaliacoes || this.avaliacoesExemplo;
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.avaliacoesPaginadas = avaliacoes.slice(inicio, fim);
  }

  irParaPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      this.atualizarAvaliacoesPaginadas();
    }
  }

  paginaAnterior() {
    this.irParaPagina(this.paginaAtual - 1);
  }

  proximaPagina() {
    this.irParaPagina(this.paginaAtual + 1);
  }

  getPaginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // Método para carregar dados do pacote (substituir por serviço HTTP)
  carregarPacote(id: string) {
    // Dados de exemplo - substituir por chamada para o back-end
    this.pacote = {
      id: 1,
      titulo: 'Recife - São Paulo',
      imagemPrincipal: '/assets/imgs/fortaleza.jpg',
      preco: 2400, // Ajustado para corresponder ao hero
      avaliacao: 5.0,
      totalAvaliacoes: 50,
      dataIda: '12/01/2025',
      dataVolta: '12/01/2025',
      duracao: '7 dias',
      tipoViagem: 'Aéreo + Hospedagem',
      incluso: 'Café da manhã, transfer',
      categoria: 'Pacote Completo',
      localizacao: 'Recife - São Paulo',
      descricaoCompleta: 'Descubra as maravilhas de Recife e São Paulo em uma viagem inesquecível. Este pacote oferece uma experiência completa com hospedagem de qualidade, transfers inclusos e as principais atrações de ambas as cidades. Explore a rica cultura nordestina em Recife e a vibrante metrópole paulista, com guias especializados e roteiros personalizados.',
      destino: 'Recife - São Paulo',
      localPartida: 'Aeroporto Internacional do Recife / Guararapes',
      localDestino: 'Aeroporto Internacional de Guarulhos (GRU)',
      descricaoIncluso: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      avaliacoes: this.avaliacoesExemplo
    };

    // Configurar paginação após carregar os dados
    this.configurarPaginacao();
  }

  // Método para gerar array de estrelas
  getStarsArray(rating?: number): number[] {
    const finalRating = rating !== undefined ? rating : this.calculatedRating;
    return Array(Math.floor(finalRating)).fill(0);
  }

  // === MÉTODOS PARA AVALIAÇÕES REAIS (BASEADAS EM REVIEWS) ===

  // Obter avaliação real formatada para exibição
  getRealRatingFormatted(): string {
    if (!this.reviewsLoaded || this.realAverageRating === 0) {
      return '0.0';
    }
    return this.realAverageRating.toFixed(1);
  }

  // Obter número de estrelas baseado nas reviews reais
  getRealStarsRating(): number {
    return this.reviewsLoaded ? this.realStarsRating : 0;
  }

  // Gerar array de estrelas baseado nas reviews reais
  getRealStarsArray(): number[] {
    const rating = this.getRealStarsRating();
    return Array(rating).fill(0);
  }

  // Verificar se deve mostrar avaliação real (quando reviews estão carregadas)
  shouldShowRealRating(): boolean {
    return this.reviewsLoaded;
  }

  // Método para calcular valor total
  calcularValorTotal(): string {
    if (!this.pacote) return '0';
    const total = this.pacote.preco * this.numeroPassageiros;
    return total.toLocaleString('pt-BR');
  }

  // Método para realizar reserva - Criar reserva na API e redirecionar para booking
  realizarReserva() {
    if (!this.bundleClass) {
      console.error('❌ Não há dados do bundle para reservar');
      return;
    }

    console.log('🛒 DETAILS: Realizando reserva do bundle:', this.bundleClass);
    
    // 1. PRIMEIRO: Verificar se o usuário está logado
    if (!this.authService.isAuthenticated()) {
      console.log('🔐 DETAILS: Usuário não logado, redirecionando para login');
      this.notificationService.showWarning(
        'Login necessário',
        'Você precisa estar logado para fazer reservas'
      );
      
      // Redirecionar para a página de login
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url } // Salva a URL atual para retornar depois do login
      });
      return;
    }
    
    // 2. VERIFICAR se o usuário já possui este pacote
    this.bookingService.checkIfUserHasPackage(this.bundleClass.id).subscribe({
      next: (hasPackage: boolean) => {
        if (hasPackage) {
          // Usuário já possui o pacote
          this.notificationService.showWarning(
            'Pacote já adicionado!',
            'Você já possui esse pacote no seu carrinho'
          );
          console.log('⚠️ DETAILS: Usuário já possui este pacote');
          return;
        }
        
        // 3. USUÁRIO NÃO POSSUI: Criar reserva na API
        this.createNewReservation();
      },
      error: (error: any) => {
        console.error('❌ DETAILS: Erro ao verificar pacotes:', error);
        // Em caso de erro na verificação, tenta criar mesmo assim
        this.createNewReservation();
      }
    });
  }

  private createNewReservation(): void {
    this.bookingService.createReservation(this.bundleClass.id).subscribe({
      next: (reservationResponse: any) => {
        console.log('✅ DETAILS: Reserva criada com sucesso:', reservationResponse);
        
        // Buscar o título correto para exibir no modal
        const packageTitle = this.bundleClass.bundleTitle || 
                            this.destinationLocation || 
                            'Pacote Selecionado';

        // Mostrar modal de confirmação ao invés de notificação simples
        this.cartConfirmationService.showConfirmationModal({
          title: 'Reserva Confirmada!',
          message: 'foi reservado com sucesso. O que deseja fazer agora?',
          packageName: packageTitle,
          onGoToBookings: () => {
            // Redirecionar para my-booking (minhas reservas) ao invés de booking
            console.log('🛒 Redirecionando para minhas reservas...');
            this.router.navigate(['/my-booking']);
          },
          onContinueShopping: () => {
            // Não faz nada, apenas fecha o modal
            console.log('🛒 Usuario escolheu continuar comprando');
          }
        });
      },
      error: (error: any) => {
        console.error('❌ DETAILS: Erro ao criar reserva:', error);
        
        // Verificar se é erro de autenticação
        if (error.status === 403) {
          this.notificationService.showError(
            'Acesso negado',
            'Você não tem permissão para criar reservas. Verifique sua autenticação.'
          );
          return;
        }
        
        if (error.status === 401) {
          this.notificationService.showError(
            'Não autorizado',
            'Sua sessão expirou. Faça login novamente.'
          );
          return;
        }
        
        // Outros erros
        this.notificationService.showError(
          'Erro ao criar reserva',
          `Erro ${error.status}: ${error.error?.message || error.message}. Tente novamente.`
        );
        
        // Em caso de erro, ainda redireciona para não travar o fluxo
        this.redirectToBooking();
      }
    });
  }

  // Método para redirecionar para booking com dados do pacote
  private redirectToBooking(): void {
    // Buscar o título correto de diferentes possibilidades
    const packageTitle = this.bundleClass.bundleTitle || 
                        this.destinationLocation || 
                        'Pacote Selecionado';

    const reservationData = {
      id: this.bundleClass.id,
      bundleId: this.bundleClass.id, // ID do bundle para buscar dados reais da API
      title: packageTitle,
      imageUrl: this.bundleImageUrl,
      startDate: this.formatDateForBooking(new Date()), // Data atual como padrão
      endDate: this.formatDateForBooking(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // +7 dias
      travelers: 1, // Padrão 1 viajante
      duration: 7, // Duração padrão
      description: this.bundleClass.bundleDescription || 'Pacote de viagem incrível com experiências únicas',
      price: this.bundleClass.initialPrice || 2000
    };

    console.log('🛒 DETAILS: Dados de reserva criados:', reservationData);
    console.log('🛒 DETAILS: Título definido como:', packageTitle);

    // Navegar para booking com os dados (igual ao my-booking e card)
    this.router.navigate(['/booking'], {
      state: {
        reservationData: reservationData
      }
    });
  }

  // Método auxiliar para formatar data para booking
  private formatDateForBooking(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Carregar reviews do backend com nomes de usuários
  loadBundleReviews(): void {
    if (!this.id) {
      console.warn('📝 loadBundleReviews: ID do bundle não está disponível');
      return;
    }
    
    this.isLoadingReviews = true;
    const bundleId = parseInt(this.id);
    console.log(`📝 loadBundleReviews: Iniciando carregamento para bundle ${bundleId}`);
    
    // Usar o ReviewService para buscar reviews com nomes de usuários
    this.reviewService.getReviewsWithUserNamesByBundle(bundleId)
      .subscribe({
        next: (reviewsWithUsers) => {
          console.log(`📝 loadBundleReviews: Recebidas ${reviewsWithUsers.length} reviews para bundle ${bundleId}`);
          
          this.reviewsWithUsers = reviewsWithUsers;
          
          // Manter compatibilidade com o código existente
          this.reviews = reviewsWithUsers.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            avaliationDate: review.avaliationDate,
            travelHistoryId: 0, // Não usado mais
            bundleId: bundleId
          }));
          
          this.isLoadingReviews = false;
          
          // Calcular avaliação real baseada nas reviews
          this.calculateRealRating();
          
          console.log('📝 Reviews com usuários carregadas:', reviewsWithUsers);
          console.log('⭐ Avaliação real calculada:', this.realAverageRating);
          console.log('🏁 loadBundleReviews: Carregamento finalizado com sucesso');
          
          // Garantir que reviewsLoaded seja true mesmo se não há reviews
          if (reviewsWithUsers.length === 0) {
            console.log('📝 Nenhuma review encontrada para este bundle');
          }
        },
        error: (error) => {
          console.error('❌ Erro ao carregar reviews com usuários:', error);
          console.error('❌ Detalhes do erro:', error.message || 'Erro desconhecido');
          
          this.reviews = [];
          this.reviewsWithUsers = [];
          this.isLoadingReviews = false;
          
          // Definir avaliação como 0 em caso de erro
          this.realAverageRating = 0;
          this.realStarsRating = 0;
          this.reviewsLoaded = true;
          
          console.log('🏁 loadBundleReviews: Carregamento finalizado com erro');
        }
      });
  }

  // Calcular avaliação real baseada nas reviews
  private calculateRealRating(): void {
    if (this.reviews && this.reviews.length > 0) {
      // Calcular a média das avaliações
      const totalRating = this.reviews.reduce((sum, review) => sum + this.getRatingNumber(review.rating), 0);
      const averageRating = totalRating / this.reviews.length;
      
      // Armazenar a média exata para exibição
      this.realAverageRating = averageRating;
      // Arredondar para o inteiro mais próximo para exibição das estrelas
      this.realStarsRating = Math.round(averageRating);
      
      console.log(`📊 DetailBundle: ${this.reviews.length} reviews, média: ${averageRating.toFixed(1)}, estrelas: ${this.realStarsRating}`);
    } else {
      // Se não há reviews, define como 0
      this.realAverageRating = 0;
      this.realStarsRating = 0;
      console.log('📊 DetailBundle: sem reviews, definindo avaliação como 0');
    }
    
    // Marcar que as reviews foram carregadas
    this.reviewsLoaded = true;
  }

  // Métodos do carrossel de reviews
  get visibleReviews(): ReviewResponse[] {
    const start = this.currentReviewIndex;
    const end = start + this.reviewsPerPage;
    return this.reviews.slice(start, end);
  }

  get canGoPreviousReview(): boolean {
    return this.currentReviewIndex > 0;
  }

  get canGoNextReview(): boolean {
    return this.currentReviewIndex + this.reviewsPerPage < this.reviews.length;
  }

  previousReviews(): void {
    if (this.canGoPreviousReview) {
      this.currentReviewIndex = Math.max(0, this.currentReviewIndex - this.reviewsPerPage);
    }
  }

  nextReviews(): void {
    if (this.canGoNextReview) {
      this.currentReviewIndex = Math.min(
        this.reviews.length - this.reviewsPerPage,
        this.currentReviewIndex + this.reviewsPerPage
      );
    }
  }

  // Converter rating string para número
  getRatingNumber(rating: string): number {
    const ratingMap: { [key: string]: number } = {
      'ONE_STAR': 1,
      'TWO_STARS': 2,
      'THREE_STARS': 3,
      'FOUR_STARS': 4,
      'FIVE_STARS': 5
    };
    return ratingMap[rating] || 0;
  }

  // Gerar array de estrelas para exibição
  getStarsArrayForRating(rating: string): number[] {
    const ratingNumber = this.getRatingNumber(rating);
    return Array(ratingNumber).fill(0);
  }

  // Formatar data da review
  formatReviewDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Agrupar reviews para o carrossel (3 por slide)
  getReviewGroups(): ReviewResponse[][] {
    const groups: ReviewResponse[][] = [];
    for (let i = 0; i < this.reviews.length; i += this.reviewsPerPage) {
      groups.push(this.reviews.slice(i, i + this.reviewsPerPage));
    }
    return groups;
  }

  // Obter nome do usuário da review baseado no índice
  getReviewUserName(index: number): string {
    if (index >= 0 && index < this.reviewsWithUsers.length) {
      return this.reviewsWithUsers[index].userName || 'Viajante Anônimo';
    }
    return 'Viajante Anônimo';
  }
}
