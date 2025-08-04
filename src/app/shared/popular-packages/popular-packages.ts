import { Component, OnInit, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../models/trip.interface';
import { PackageService } from '../services/package.service';
import { BundleService } from '../services/bundle-service';
import { BundleClass } from '@/app/features/client/pages/bundle/class/bundle-class';

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

  constructor(
    private packageService: PackageService,
    private bundleService: BundleService,
    private cdr: ChangeDetectorRef
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
        // Ordenar bundles por avaliação (do maior para o menor)
        const sortedBundles = bundles
          .map(bundle => ({
            ...bundle,
            rating: this.getRatingFromRankConsistent(bundle.bundleRank, bundle.id)
          }))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5); // Pegar apenas os top 5

        this.topBundles = sortedBundles;
        
        // Buscar imagens e localizações para os top bundles
        this.loadBundleImagesAndLocations();
      },
      error: (error) => {
        console.error('Erro ao carregar top bundles:', error);
      }
    });
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

  // Métodos de avaliação (copiados do trip-carousel)
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

}
