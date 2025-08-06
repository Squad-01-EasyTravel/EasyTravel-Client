import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingService } from '@/app/shared/services/booking.service';
import { NotificationService } from '@/app/shared/services/notification.service';
import { CartConfirmationService } from '@/app/shared/services/cart-confirmation.service';
import { AuthService } from '@/app/shared/services/auth.service';

@Component({
  selector: 'app-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class Card implements OnInit {
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private bookingService: BookingService,
    private notificationService: NotificationService,
    private cartConfirmationService: CartConfirmationService,
    private authService: AuthService
  ) {}

  @Input() pacote!: any; // Aceita o objeto processado com dados da API

  ngOnInit() {
    console.log('🎴 Card inicializado com dados:', this.pacote);
    console.log('🎴 Imagem do pacote:', this.pacote?.image);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  showDetails(): void {
    this.router.navigate(['/bundles/details-bundle', this.pacote.id]).then(() => {
      // Garantir que a página comece do topo
      window.scrollTo(0, 0);
    });
  }

  // NOVO MÉTODO: Adicionar ao carrinho e criar reserva na API
  addToCart(): void {
    console.log('🛒 CARD: Adicionando pacote ao carrinho:', this.pacote);
    console.log('🛒 CARD: Bundle ID:', this.pacote.id);
    
    // 1. PRIMEIRO: Verificar se o usuário está logado
    if (!this.authService.isAuthenticated()) {
      console.log('🔐 CARD: Usuário não logado, redirecionando para login');
      this.notificationService.showWarning(
        'Login necessário',
        'Você precisa estar logado para adicionar pacotes ao carrinho'
      );
      
      // Redirecionar para a página de login
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url } // Salva a URL atual para retornar depois do login
      });
      return;
    }
    
    // 2. VERIFICAR se o usuário já possui este pacote
    this.bookingService.checkIfUserHasPackage(this.pacote.id).subscribe({
      next: (hasPackage: boolean) => {
        if (hasPackage) {
          // Usuário já possui o pacote
          this.notificationService.showWarning(
            'Pacote já adicionado!',
            'Você já possui esse pacote no seu carrinho'
          );
          console.log('⚠️ CARD: Usuário já possui este pacote');
          return;
        }
        
        // 3. USUÁRIO NÃO POSSUI: Criar reserva na API
        this.createNewReservation();
      },
      error: (error: any) => {
        console.error('❌ CARD: Erro ao verificar pacotes:', error);
        // Em caso de erro na verificação, tenta criar mesmo assim
        this.createNewReservation();
      }
    });
  }

  private createNewReservation(): void {
    this.bookingService.createReservation(this.pacote.id).subscribe({
      next: (reservationResponse: any) => {
        console.log('✅ CARD: Reserva criada com sucesso:', reservationResponse);
        
        // Buscar o título correto para exibir no modal
        const packageTitle = this.pacote.bundleTitle || 
                            this.pacote.title || 
                            this.pacote.locationName || 
                            this.pacote.bundleName || 
                            this.pacote.destination ||
                            'Pacote Selecionado';

        // Mostrar modal de confirmação ao invés de notificação simples
        this.cartConfirmationService.showConfirmationModal({
          title: 'Pacote Adicionado!',
          message: 'foi adicionado ao seu carrinho com sucesso. O que deseja fazer agora?',
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
        console.error('❌ CARD: Erro ao criar reserva:', error);
        
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
    const packageTitle = this.pacote.bundleTitle || 
                        this.pacote.title || 
                        this.pacote.locationName || 
                        this.pacote.bundleName || 
                        this.pacote.destination ||
                        'Pacote Selecionado';

    const reservationData = {
      id: this.pacote.id,
      bundleId: this.pacote.id, // ID do bundle para buscar dados reais da API
      title: packageTitle,
      imageUrl: this.pacote.image,
      startDate: this.formatDateForBooking(new Date()), // Data atual como padrão
      endDate: this.formatDateForBooking(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // +7 dias
      travelers: 1, // Padrão 1 viajante
      duration: this.pacote.duration || 7,
      description: this.pacote.description || this.pacote.bundleDescription || 'Pacote de viagem incrível',
      price: this.pacote.initialPrice || this.pacote.bundlePrice || 2000
    };

    console.log('🛒 CARD: Dados de reserva criados:', reservationData);
    console.log('🛒 CARD: Título definido como:', packageTitle);
    console.log('🚀 CARD: Redirecionando para /booking...');

    // Navegar para booking com os dados (igual ao my-booking)
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

  onImageError(event: any): void {
    console.log('🖼️ ❌ Erro ao carregar imagem do card:', event);
    console.log('🖼️ ❌ URL que falhou:', event.target.src);
    console.log('🖼️ ❌ Dados do pacote:', this.pacote);
    
    const currentSrc = event.target.src;
    
    // Se a imagem da API falhou, tentar com imagem local
    if (currentSrc.includes('localhost:8080') || currentSrc.includes('/uploads/')) {
      console.log('🖼️ 🔄 Imagem da API falhou, usando fallback local');
      event.target.src = 'assets/imgs/gramado.jpg';
      return;
    }
    
    // Se já estamos usando fallback local e ainda falhou, tentar outras opções
    const fallbackImages = [
      'assets/imgs/gramado.jpg',
      'assets/imgs/fortaleza.jpg',
      'assets/imgs/background-hero-section.png'
    ];
    
    const currentImageName = currentSrc.split('/').pop();
    const nextFallback = fallbackImages.find(img => !img.includes(currentImageName));
    
    if (nextFallback) {
      console.log(`🖼️ 🔄 Tentando próxima imagem fallback: ${nextFallback}`);
      event.target.src = nextFallback;
    } else {
      console.log('🖼️ ❌ Todas as imagens fallback falharam');
    }
  }

  onImageLoad(event: any): void {
    console.log('🖼️ ✅ Imagem carregada com sucesso:', event.target.src);
    console.log('🖼️ ✅ Para o pacote:', this.pacote?.bundleTitle);
  }

  getRankTranslation(rank: string): string {
    if (!rank) return 'BRONZE';
    
    switch (rank.toUpperCase().trim()) {
      case 'GOLD': return 'OURO';
      case 'SILVER': return 'PRATA';
      case 'BRONZE': return 'BRONZE';
      case 'PLATINUM': return 'PLATINA';
      // Casos já em português
      case 'OURO': return 'OURO';
      case 'PRATA': return 'PRATA';
      case 'PLATINA': return 'PLATINA';
      default: return rank.toUpperCase();
    }
  }

  getRankCssClass(rank: string): string {
    if (!rank) return 'rank-bronze';
    
    switch (rank.toUpperCase().trim()) {
      case 'GOLD':
      case 'OURO': 
        return 'rank-gold';
      case 'SILVER':
      case 'PRATA': 
        return 'rank-silver';
      case 'BRONZE': 
        return 'rank-bronze';
      case 'PLATINUM':
      case 'PLATINA': 
        return 'rank-platinum';
      default: 
        return 'rank-bronze';
    }
  }

  // Métodos de avaliação seguindo a mesma lógica da home
  getRatingFromRankConsistent(rank: string, bundleId: number): number {
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

  getStarsArray(rating: number): boolean[] {
    const stars: boolean[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }
}
