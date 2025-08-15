import { Component, OnInit, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Trip } from '../models/trip.interface';
import { PackageService } from '../services/package.service';
import { BundleService } from '../services/bundle-service';
import { BundleClass } from '@/app/features/client/pages/bundle/class/bundle-class';

// Interface para review do backend
interface ReviewResponse {
  id: number;
  rating: string; // 'FIVE_STARS', 'FOUR_STARS', etc.
  comment: string;
  avaliationDate: string;
  travelHistoryId: number;
  bundleId: number;
}

declare var bootstrap: any;

@Component({
  selector: 'app-trip-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-carousel.html',
  styleUrls: ['./trip-carousel.css']
})
export class TripCarousel implements OnInit, AfterViewInit {
  bundles: BundleClass[] = [];
  groupedBundles: BundleClass[][] = [];
  private currentCardsPerSlide = 4;

  // Mapa para armazenar as avaliações reais dos bundles
  bundleRatings: Map<number, number> = new Map();
  // Mapa para armazenar as médias exatas (com decimais) para o badge
  bundleAverageRatings: Map<number, number> = new Map();
  // Flag para controlar quando as reviews foram carregadas
  reviewsLoaded: Set<number> = new Set();

  constructor(
    private packageService: PackageService,
    private bundleService: BundleService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setCardsPerSlide();
    this.loadAvailableBundles();
  }

  ngAfterViewInit(): void {
    // Inicializar o carousel Bootstrap após a view ser criada e dados carregados
    setTimeout(() => {
      this.initializeCarousel();
    }, 500);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    const newCardsPerSlide = this.getCardsPerSlide();
    if (newCardsPerSlide !== this.currentCardsPerSlide) {
      this.currentCardsPerSlide = newCardsPerSlide;
      if (this.bundles.length > 0) {
        this.groupedBundles = this.groupBundles(this.bundles, this.currentCardsPerSlide);
        setTimeout(() => {
          this.initializeCarousel();
        }, 100);
      }
    }
  }

  private setCardsPerSlide(): void {
    this.currentCardsPerSlide = this.getCardsPerSlide();
  }

  private getCardsPerSlide(): number {
    const width = window.innerWidth;
    if (width < 576) return 1;        // Mobile: 1 card
    if (width < 768) return 2;        // Tablet: 2 cards
    if (width < 992) return 3;        // Desktop pequeno: 3 cards
    return 4;                         // Desktop grande: 4 cards
  }

  private initializeCarousel(): void {
    const carouselElement = document.getElementById('tripCarousel');
    if (carouselElement && typeof bootstrap !== 'undefined' && this.groupedBundles.length > 0) {
      new bootstrap.Carousel(carouselElement, {
        interval: 3000,
        ride: 'carousel',
        wrap: true,
        keyboard: true,
        pause: 'hover'
      });
    }
  }

  loadAvailableBundles(): void {
    this.bundleService.getAvailableBundles().subscribe({
      next: (bundles) => {
        this.bundles = bundles;
        
        // Carregar reviews reais para cada bundle
        this.loadBundleReviews();
        
        // Buscar imagens e localizações para cada bundle
        this.loadBundleImagesAndLocations();
      },
      error: (error) => {
        console.error('Erro ao carregar pacotes disponíveis:', error);
      }
    });
  }

  // Método para carregar reviews reais dos bundles
  private loadBundleReviews(): void {
    this.bundles.forEach(bundle => {
      this.http.get<ReviewResponse[]>(`http://localhost:8080/api/reviews/bundle/${bundle.id}`)
        .subscribe({
          next: (reviews: ReviewResponse[]) => {
            if (reviews && reviews.length > 0) {
              // Calcular a média das avaliações
              const totalRating = reviews.reduce((sum, review) => sum + this.getRatingNumber(review.rating), 0);
              const averageRating = totalRating / reviews.length;
              // Armazenar a média exata para o badge
              this.bundleAverageRatings.set(bundle.id, averageRating);
              // Arredondar para o inteiro mais próximo para exibição das estrelas
              this.bundleRatings.set(bundle.id, Math.round(averageRating));
              console.log(`📊 TripCarousel Bundle ${bundle.id}: ${reviews.length} reviews, média: ${averageRating.toFixed(1)}, badge: ${averageRating.toFixed(1)}, estrelas: ${Math.round(averageRating)}`);
            } else {
              // Se não há reviews, define como 0 (estrelas vazias)
              this.bundleAverageRatings.set(bundle.id, 0);
              this.bundleRatings.set(bundle.id, 0);
              console.log(`📊 TripCarousel Bundle ${bundle.id}: sem reviews, badge: 0, estrelas: 0`);
            }
            // Marcar como carregado
            this.reviewsLoaded.add(bundle.id);
            this.cdr.detectChanges();
          },
          error: (error: any) => {
            console.error(`❌ Erro ao carregar reviews do bundle ${bundle.id}:`, error);
            // Em caso de erro, define como 0 (estrelas vazias)
            this.bundleAverageRatings.set(bundle.id, 0);
            this.bundleRatings.set(bundle.id, 0);
            // Marcar como carregado mesmo com erro
            this.reviewsLoaded.add(bundle.id);
            this.cdr.detectChanges();
          }
        });
    });
  }

  // Converter rating string para número
  private getRatingNumber(rating: string): number {
    const ratingMap: { [key: string]: number } = {
      'ONE_STAR': 1,
      'TWO_STARS': 2,
      'THREE_STARS': 3,
      'FOUR_STARS': 4,
      'FIVE_STARS': 5
    };
    return ratingMap[rating] || 0;
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      // Se a imagem falhar, usar a imagem padrão
      imgElement.src = '/assets/imgs/gramado.jpg';
    }
  }

  private loadBundleImagesAndLocations(): void {
    let completedRequests = 0;
    const totalRequests = this.bundles.length * 2; // 2 requisições por bundle (imagem + localização)
    
    console.log(`🖼️🗺️ Iniciando carregamento de imagens e localizações para ${this.bundles.length} bundles`);
    
    this.bundles.forEach((bundle, index) => {
      console.log(`🔍 Buscando dados para bundle ID: ${bundle.id}, título: ${bundle.bundleTitle}`);
      
      // Buscar imagem
      this.bundleService.getBundleImage(bundle.id).subscribe({
        next: (mediaResponse) => {
          console.log(`📸 Resposta da API de imagem para bundle ${bundle.id}:`, mediaResponse);
          
          let mediaData = Array.isArray(mediaResponse) ? mediaResponse[0] : mediaResponse;
          
          if (mediaData && mediaData.mediaUrl) {
            let imageUrl = `http://localhost:8080${mediaData.mediaUrl}`;
            bundle.imageUrl = imageUrl;
            console.log(`✅ URL da imagem definida para bundle ${bundle.id}: ${bundle.imageUrl}`);
          } else {
            bundle.imageUrl = '/assets/imgs/gramado.jpg';
            console.log(`⚠️ Usando imagem padrão para bundle ${bundle.id}`);
          }
          
          completedRequests++;
          this.checkAllRequestsCompleted(completedRequests, totalRequests);
        },
        error: (error) => {
          console.error(`❌ Erro ao carregar imagem do bundle ${bundle.id}:`, error);
          bundle.imageUrl = '/assets/imgs/gramado.jpg';
          completedRequests++;
          this.checkAllRequestsCompleted(completedRequests, totalRequests);
        }
      });

      // Buscar localização
      this.bundleService.getBundleLocation(bundle.id).subscribe({
        next: (locationResponse) => {
          console.log(`🗺️ Resposta da API de localização para bundle ${bundle.id}:`, locationResponse);
          
          let locationData = Array.isArray(locationResponse) ? locationResponse[0] : locationResponse;
          
          if (locationData && locationData.destination && locationData.departure) {
            bundle.destinationCity = locationData.destination.city;
            bundle.destinationState = locationData.destination.states;
            bundle.departureCity = locationData.departure.city;
            bundle.departureState = locationData.departure.states;
            
            console.log(`✅ Rota definida para bundle ${bundle.id}: ${bundle.departureCity}/${bundle.departureState} → ${bundle.destinationCity}/${bundle.destinationState}`);
          } else {
            console.log(`⚠️ Dados de localização incompletos para bundle ${bundle.id}`);
          }
          
          completedRequests++;
          this.checkAllRequestsCompleted(completedRequests, totalRequests);
        },
        error: (error) => {
          console.error(`❌ Erro ao carregar localização do bundle ${bundle.id}:`, error);
          completedRequests++;
          this.checkAllRequestsCompleted(completedRequests, totalRequests);
        }
      });
    });
  }

  private checkAllRequestsCompleted(completed: number, total: number): void {
    console.log(`📊 Progresso: ${completed}/${total} requisições completadas`);
    
    if (completed === total) {
      console.log('🎨 Todas as imagens e localizações processadas, organizando carousel...');
      console.log('📋 Bundles finais:', this.bundles.map(b => ({ 
        id: b.id, 
        title: b.bundleTitle, 
        imageUrl: b.imageUrl,
        route: `${b.departureCity}/${b.departureState} → ${b.destinationCity}/${b.destinationState}`
      })));
      
      this.groupedBundles = this.groupBundles(this.bundles, this.currentCardsPerSlide);
      console.log('🎪 Carousel organizado:', this.groupedBundles);
      
      // Forçar detecção de mudanças
      this.cdr.detectChanges();
      console.log('🔄 Change detection executada');
      
      setTimeout(() => {
        this.initializeCarousel();
      }, 100);
    }
  }

  private loadBundleImages(): void {
    let completedRequests = 0;
    console.log(`🖼️ Iniciando carregamento de imagens para ${this.bundles.length} bundles`);
    
    this.bundles.forEach((bundle, index) => {
      console.log(`🔍 Buscando imagem para bundle ID: ${bundle.id}, título: ${bundle.bundleTitle}`);
      
      this.bundleService.getBundleImage(bundle.id).subscribe({
        next: (mediaResponse) => {
          console.log(`📸 Resposta da API para bundle ${bundle.id}:`, mediaResponse);
          console.log(`📝 Tipo da resposta:`, typeof mediaResponse, Array.isArray(mediaResponse) ? '(é Array)' : '(não é Array)');
          
          // Se a resposta for um array, pegar o primeiro item
          let mediaData = Array.isArray(mediaResponse) ? mediaResponse[0] : mediaResponse;
          console.log(`📋 Dados da mídia processados:`, mediaData);
          
          // Usar a mediaUrl do JSON retornado
          if (mediaData && mediaData.mediaUrl) {
            // Construir URL completa usando o backend
            let imageUrl = `http://localhost:8080${mediaData.mediaUrl}`;
            bundle.imageUrl = imageUrl;
            console.log(`✅ URL COMPLETA definida para bundle ${bundle.id}: ${bundle.imageUrl}`);
          } else {
            // Imagem padrão se não encontrar
            bundle.imageUrl = '/assets/imgs/gramado.jpg';
            console.log(`⚠️ Usando imagem padrão para bundle ${bundle.id}`);
          }
          
          completedRequests++;
          console.log(`📊 Progresso: ${completedRequests}/${this.bundles.length} imagens processadas`);
          
          // Quando todas as imagens forem processadas, organizar o carousel
          if (completedRequests === this.bundles.length) {
            console.log('🎨 Todas as imagens processadas, organizando carousel...');
            console.log('📋 Bundles finais:', this.bundles.map(b => ({ 
              id: b.id, 
              title: b.bundleTitle, 
              imageUrl: b.imageUrl 
            })));
            
            this.groupedBundles = this.groupBundles(this.bundles, this.currentCardsPerSlide);
            console.log('🎪 Carousel organizado:', this.groupedBundles);
            
            // Forçar detecção de mudanças
            this.cdr.detectChanges();
            console.log('🔄 Change detection executada');
            
            setTimeout(() => {
              this.initializeCarousel();
            }, 100);
          }
        },
        error: (error) => {
          console.error(`❌ Erro ao carregar imagem do bundle ${bundle.id}:`, error);
          // Usar imagem padrão em caso de erro
          bundle.imageUrl = '/assets/imgs/gramado.jpg';
          console.log(`⚠️ Imagem padrão definida para bundle ${bundle.id} devido ao erro`);
          
          completedRequests++;
          console.log(`📊 Progresso (com erro): ${completedRequests}/${this.bundles.length} imagens processadas`);
          
          // Continuar mesmo com erro
          if (completedRequests === this.bundles.length) {
            console.log('🎨 Processamento finalizado (com erros), organizando carousel...');
            this.groupedBundles = this.groupBundles(this.bundles, this.currentCardsPerSlide);
            
            // Forçar detecção de mudanças
            this.cdr.detectChanges();
            console.log('🔄 Change detection executada (com erros)');
            
            setTimeout(() => {
              this.initializeCarousel();
            }, 100);
          }
        }
      });
    });
  }

  private groupBundles(bundles: BundleClass[], size: number): BundleClass[][] {
    const groups: BundleClass[][] = [];
    for (let i = 0; i < bundles.length; i += size) {
      groups.push(bundles.slice(i, i + size));
    }
    return groups;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  getDurationInDays(initialDate: string, finalDate: string): number {
    if (!initialDate || !finalDate) {
      return 0;
    }
    
    const start = new Date(initialDate);
    const end = new Date(finalDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  getRankColor(rank: string): string {
    switch (rank.toUpperCase()) {
      case 'GOLD': return '#FFD700';      // Ouro - dourado vibrante
      case 'SILVER': return '#C0C0C0';    // Prata - prateado
      case 'BRONZE': return '#CD7F32';    // Bronze - marrom bronze
      case 'PLATINUM': return '#E5E4E2';  // Platina - cinza claro
      case 'PLATINA': return '#E5E4E2';   // Platina (caso venha em português)
      case 'OURO': return '#FFD700';      // Ouro (caso venha em português)
      case 'PRATA': return '#C0C0C0';     // Prata (caso venha em português)
      default: return '#6c757d';          // Cinza padrão
    }
  }

  getRankTranslation(rank: string): string {
    switch (rank.toUpperCase()) {
      case 'GOLD': return 'OURO';
      case 'SILVER': return 'PRATA';
      case 'BRONZE': return 'BRONZE';
      case 'PLATINUM': return 'PLATINA';
      default: return rank;
    }
  }

  getRankTextColor(rank: string): string {
    const upperRank = rank.toUpperCase();
    // Usar texto preto para cores claras (platina e prata)
    if (upperRank === 'PLATINUM' || upperRank === 'PLATINA' || upperRank === 'SILVER' || upperRank === 'PRATA') {
      return '#000';
    }
    // Usar texto branco para cores escuras (ouro e bronze)
    return '#fff';
  }

  getRankCssClass(rank: string): string {
    switch (rank.toUpperCase()) {
      case 'GOLD': return 'rank-gold';
      case 'SILVER': return 'rank-silver';
      case 'BRONZE': return 'rank-bronze';
      case 'PLATINUM': return 'rank-platinum';
      case 'PLATINA': return 'rank-platinum';
      case 'OURO': return 'rank-gold';
      case 'PRATA': return 'rank-silver';
      default: return '';
    }
  }

  // Método para formatar a rota
  formatRoute(bundle: BundleClass): string {
    if (bundle.departureCity && bundle.departureState && bundle.destinationCity && bundle.destinationState) {
      return `${bundle.departureCity}/${bundle.departureState} → ${bundle.destinationCity}/${bundle.destinationState}`;
    }
    return 'Rota não disponível';
  }

  // Método para gerar avaliação baseada no rank do pacote
  getMockedRating(bundleId: number): number {
    // Buscar o bundle pelo ID para pegar o rank
    const bundle = this.bundles.find(b => b.id === bundleId);
    if (bundle && bundle.bundleRank) {
      return this.getRatingFromRank(bundle.bundleRank);
    }
    // Fallback para ID se não encontrar o bundle
    return ((bundleId % 5) + 1);
  }

  // Método para mapear rank para avaliação
  getRatingFromRank(rank: string): number {
    switch (rank.toUpperCase()) {
      case 'BRONZE': return 1;        // 1 estrela
      case 'SILVER': 
      case 'PRATA': return 2;         // 2 estrelas
      case 'GOLD': 
      case 'OURO': return 3;          // 3 estrelas
      case 'PLATINUM': 
      case 'PLATINA': 
        // Para platina, alternar entre 4 e 5 estrelas baseado no ID
        return Math.random() > 0.5 ? 4 : 5;
      default: return 3;              // Default: 3 estrelas
    }
  }

  // Método alternativo para platina com base no ID (mais consistente)
  getRatingFromRankConsistent(rank: string, bundleId: number): number {
    switch (rank.toUpperCase()) {
      case 'BRONZE': return 1;        // 1 estrela
      case 'SILVER': 
      case 'PRATA': return 2;         // 2 estrelas
      case 'GOLD': 
      case 'OURO': return 3;          // 3 estrelas
      case 'PLATINUM': 
      case 'PLATINA': 
        // Para platina, alternar entre 4 e 5 estrelas baseado no ID
        return (bundleId % 2 === 0) ? 4 : 5;
      default: return 3;              // Default: 3 estrelas
    }
  }

  // Método para gerar número de avaliações mockadas
  getMockedReviewCount(bundleId: number): number {
    // Gerar um número de avaliações baseado no ID (entre 10 e 500)
    const count = ((bundleId * 17) % 491) + 10; // Resultado entre 10 e 500
    return count;
  }

  // Método para gerar array de estrelas para exibição
  getStarsArray(rating: number): boolean[] {
    const stars: boolean[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  // === MÉTODOS PARA AVALIAÇÕES REAIS (BASEADAS EM REVIEWS) ===

  // Método para verificar se as reviews de um bundle foram carregadas
  isReviewsLoaded(bundleId: number): boolean {
    return this.reviewsLoaded.has(bundleId);
  }

  // Método para obter a avaliação real do bundle (baseada nas reviews) - para o badge
  getRealRating(bundleId: number): string {
    const averageRating = this.bundleAverageRatings.get(bundleId);
    if (averageRating === undefined || averageRating === 0) {
      return '0';
    }
    // Se a média é um número inteiro, mostra sem casas decimais
    if (averageRating % 1 === 0) {
      return averageRating.toString();
    }
    // Senão, mostra com 1 casa decimal
    return averageRating.toFixed(1);
  }

  // Método para obter a avaliação real como número
  getRealRatingNumber(bundleId: number): number {
    const rating = this.bundleRatings.get(bundleId);
    return rating || 0;
  }

  // Método específico para estrelas baseadas nas reviews reais
  getRealStarsArray(bundleId: number): boolean[] {
    const realRating = this.getRealRatingNumber(bundleId);
    return this.getStarsArray(realRating);
  }

  // Método para navegar para detalhes do pacote
  verDetalhes(packageId: number) {
    console.log('🔗 TripCarousel - Navegando para detalhes do pacote ID:', packageId);
    this.router.navigate(['/bundles/details-bundle', packageId]).then(() => {
      // Garantir que a página comece do topo
      window.scrollTo(0, 0);
    });
  }

}
