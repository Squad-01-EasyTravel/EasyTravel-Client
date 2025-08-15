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
  selector: 'app-popular-packages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popular-packages.html',
  styleUrl: './popular-packages.css'
})
export class PopularPackages implements OnInit, AfterViewInit {
  popularPackages: Trip[] = [];
  topBundles: BundleClass[] = []; // Top 5 bundles baseados em avaliação
  groupedPackages: Trip[][] = [];
  groupedBundles: BundleClass[][] = []; // Grupos de bundles
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
    this.loadTopRatedBundles(); // Carregar top 5 bundles baseados em avaliação
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
      if (this.topBundles.length > 0) {
        this.groupedBundles = this.groupBundles(this.topBundles, this.currentCardsPerSlide);
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
    const carouselElement = document.getElementById('popularPackagesCarousel');
    if (carouselElement && typeof bootstrap !== 'undefined' && this.groupedPackages.length > 0) {
      new bootstrap.Carousel(carouselElement, {
        interval: 4000,
        ride: 'carousel',
        wrap: true,
        keyboard: true,
        pause: 'hover'
      });
    }
  }

  loadPopularPackages(): void {
    this.packageService.getPopularPackages().subscribe({
      next: (packages) => {
        this.popularPackages = packages;
        this.groupedPackages = this.groupPackages(packages, this.currentCardsPerSlide);
        
        // Reinicializar carousel após carregar dados
        setTimeout(() => {
          this.initializeCarousel();
        }, 100);
      },
      error: (error) => {
        console.error('Erro ao carregar pacotes populares:', error);
      }
    });
  }

  private groupPackages(packages: Trip[], size: number): Trip[][] {
    const groups: Trip[][] = [];
    for (let i = 0; i < packages.length; i += size) {
      groups.push(packages.slice(i, i + size));
    }
    return groups;
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }

    if (hasHalfStar) {
      stars.push('half');
    }

    while (stars.length < 5) {
      stars.push('empty');
    }

    return stars;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  calculateDiscount(originalPrice?: number, currentPrice?: number): number {
    if (!originalPrice || !currentPrice) return 0;
    return originalPrice - currentPrice;
  }

  // Método para carregar os top 5 bundles baseados em avaliação
  loadTopRatedBundles(): void {
    this.bundleService.getAvailableBundles().subscribe({
      next: (bundles) => {
        // Pegar os primeiros 5 bundles disponíveis (o sorting será feito após carregar as reviews reais)
        this.topBundles = bundles.slice(0, 5);
        
        // Carregar reviews reais para cada bundle
        this.loadBundleReviews();
        
        // Buscar imagens e localizações para os top bundles
        this.loadBundleImagesAndLocations();
      },
      error: (error) => {
        console.error('Erro ao carregar top bundles:', error);
      }
    });
  }

  // Método para carregar reviews reais dos bundles
  private loadBundleReviews(): void {
    this.topBundles.forEach(bundle => {
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
              console.log(`📊 Bundle ${bundle.id}: ${reviews.length} reviews, média: ${averageRating.toFixed(1)}, badge: ${averageRating.toFixed(1)}, estrelas: ${Math.round(averageRating)}`);
            } else {
              // Se não há reviews, define como 0 (estrelas vazias)
              this.bundleAverageRatings.set(bundle.id, 0);
              this.bundleRatings.set(bundle.id, 0);
              console.log(`📊 Bundle ${bundle.id}: sem reviews, badge: 0, estrelas: 0`);
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

  // Método para carregar imagens e localizações dos top bundles
  private loadBundleImagesAndLocations(): void {
    let completedRequests = 0;
    const totalRequests = this.topBundles.length * 2; // 2 requisições por bundle
    
    this.topBundles.forEach((bundle) => {
      // Buscar imagem
      this.bundleService.getBundleImage(bundle.id).subscribe({
        next: (mediaResponse) => {
          let mediaData = Array.isArray(mediaResponse) ? mediaResponse[0] : mediaResponse;
          
          if (mediaData && mediaData.mediaUrl) {
            bundle.imageUrl = `http://localhost:8080${mediaData.mediaUrl}`;
          } else {
            bundle.imageUrl = '/assets/imgs/gramado.jpg';
          }
          
          completedRequests++;
          this.checkAllRequestsCompleted(completedRequests, totalRequests);
        },
        error: (error) => {
          bundle.imageUrl = '/assets/imgs/gramado.jpg';
          completedRequests++;
          this.checkAllRequestsCompleted(completedRequests, totalRequests);
        }
      });

      // Buscar localização
      this.bundleService.getBundleLocation(bundle.id).subscribe({
        next: (locationResponse) => {
          let locationData = Array.isArray(locationResponse) ? locationResponse[0] : locationResponse;
          
          if (locationData && locationData.destination && locationData.departure) {
            bundle.destinationCity = locationData.destination.city;
            bundle.destinationState = locationData.destination.states;
            bundle.departureCity = locationData.departure.city;
            bundle.departureState = locationData.departure.states;
          }
          
          completedRequests++;
          this.checkAllRequestsCompleted(completedRequests, totalRequests);
        },
        error: (error) => {
          completedRequests++;
          this.checkAllRequestsCompleted(completedRequests, totalRequests);
        }
      });
    });
  }

  private checkAllRequestsCompleted(completed: number, total: number): void {
    if (completed === total) {
      this.groupedBundles = this.groupBundles(this.topBundles, this.currentCardsPerSlide);
      this.cdr.detectChanges();
      
      setTimeout(() => {
        this.initializeCarousel();
      }, 100);
    }
  }

  // Método para agrupar bundles
  private groupBundles(bundles: BundleClass[], size: number): BundleClass[][] {
    const groups: BundleClass[][] = [];
    for (let i = 0; i < bundles.length; i += size) {
      groups.push(bundles.slice(i, i + size));
    }
    return groups;
  }

  // Métodos de avaliação
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

  getStarsArray(rating: number): boolean[] {
    const stars: boolean[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating);
    }
    return stars;
  }

  // Método específico para estrelas baseadas nas reviews reais
  getRealStarsArray(bundleId: number): boolean[] {
    const realRating = this.getRealRatingNumber(bundleId);
    return this.getStarsArray(realRating);
  }

  formatRoute(bundle: BundleClass): string {
    if (bundle.departureCity && bundle.departureState && bundle.destinationCity && bundle.destinationState) {
      return `${bundle.departureCity}/${bundle.departureState} → ${bundle.destinationCity}/${bundle.destinationState}`;
    }
    return 'Rota não disponível';
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = '/assets/imgs/gramado.jpg';
    }
  }

  getRankColor(rank: string): string {
    switch (rank.toUpperCase()) {
      case 'GOLD': return '#FFD700';
      case 'SILVER': return '#C0C0C0';
      case 'BRONZE': return '#CD7F32';
      case 'PLATINUM': return '#E5E4E2';
      case 'PLATINA': return '#E5E4E2';
      case 'OURO': return '#FFD700';
      case 'PRATA': return '#C0C0C0';
      default: return '#6c757d';
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

  // Método para navegar para detalhes do pacote
  verDetalhes(packageId: number) {
    console.log('🔗 PopularPackages - Navegando para detalhes do pacote ID:', packageId);
    this.router.navigate(['/bundles/details-bundle', packageId]).then(() => {
      // Garantir que a página comece do topo
      window.scrollTo(0, 0);
    });
  }

}
