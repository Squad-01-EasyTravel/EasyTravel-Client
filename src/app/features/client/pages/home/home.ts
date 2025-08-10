import { Component, OnInit, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { Footer } from '../../../../shared/footer/footer';
import { Navbar } from '../../../../shared/navbar/navbar';
import { TripCarousel } from '../../../../shared/trip-carousel/trip-carousel';
import { PopularPackages } from '../../../../shared/popular-packages/popular-packages';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BundleService } from '../../../../shared/services/bundle-service';
import { ReviewService, ReviewWithUser } from '../../../../shared/services/review.service';
import { Location } from '../../../../shared/models/location.interface';

declare var bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Footer, Navbar, TripCarousel, PopularPackages, FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, AfterViewInit {
  origemSelecionada: string = '';
  destinoSelecionada: string = '';
  
  // Lista de locais da API
  locations: Location[] = [];
  
  // Lista de reviews da API
  reviews: ReviewWithUser[] = [];
  groupedReviews: ReviewWithUser[][] = [];
  private currentCardsPerSlide = 3;

  constructor(
    private router: Router,
    private bundleService: BundleService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setCardsPerSlide();
    this.loadLocations();
    this.loadReviews();
  }

  ngAfterViewInit(): void {
    // Inicializar o carousel Bootstrap após a view ser criada e dados carregados
    setTimeout(() => {
      this.initializeReviewsCarousel();
    }, 500);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    const newCardsPerSlide = this.getCardsPerSlide();
    if (newCardsPerSlide !== this.currentCardsPerSlide) {
      this.currentCardsPerSlide = newCardsPerSlide;
      if (this.reviews.length > 0) {
        this.groupedReviews = this.groupReviews(this.reviews, this.currentCardsPerSlide);
        this.cdr.detectChanges();
        setTimeout(() => {
          this.initializeReviewsCarousel();
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
    return 3;                         // Desktop: 3 cards
  }

  private initializeReviewsCarousel(): void {
    const carouselElement = document.getElementById('reviewsCarousel');
    if (carouselElement && typeof bootstrap !== 'undefined' && this.groupedReviews.length > 0) {
      new bootstrap.Carousel(carouselElement, {
        interval: 4000,
        ride: 'carousel',
        wrap: true,
        keyboard: true,
        pause: 'hover'
      });
    }
  }

  loadLocations() {
    console.log('🌍 Home - Carregando locais da API...');
    this.bundleService.getLocations().subscribe({
      next: (locations) => {
        console.log('🌍 Home - Locais recebidos da API:', locations.length, locations);
        this.locations = locations;
      },
      error: (error) => {
        console.error('❌ Home - Erro ao carregar locais:', error);
        // Em caso de erro, manter lista vazia
        this.locations = [];
      }
    });
  }

  loadReviews() {
    console.log('⭐ Home - Carregando reviews da API...');
    this.reviewService.getReviewsWithUserNames().subscribe({
      next: (reviews) => {
        console.log('⭐ Home - Reviews recebidas da API:', reviews.length, reviews);
        this.reviews = reviews;
        this.groupedReviews = this.groupReviews(this.reviews, this.currentCardsPerSlide);
        this.cdr.detectChanges();
        setTimeout(() => {
          this.initializeReviewsCarousel();
        }, 100);
      },
      error: (error) => {
        console.error('❌ Home - Erro ao carregar reviews:', error);
        // Em caso de erro, manter lista vazia - não usar mock
        this.reviews = [];
        this.groupedReviews = [];
      }
    });
  }

  // Método para agrupar reviews
  private groupReviews(reviews: ReviewWithUser[], size: number): ReviewWithUser[][] {
    const groups: ReviewWithUser[][] = [];
    for (let i = 0; i < reviews.length; i += size) {
      groups.push(reviews.slice(i, i + size));
    }
    return groups;
  }

  // Método para formatar localização para exibição
  formatLocation(location: Location): string {
    return `${location.city}, ${location.states}`;
  }

  // Método para obter o valor usado na comparação
  getLocationValue(location: Location): string {
    return `${location.city}, ${location.states}`;
  }

  buscarViagens() {
    if (!this.origemSelecionada || !this.destinoSelecionada) {
      alert('Selecione a origem e o destino!');
      return;
    }
    localStorage.setItem('origem', this.origemSelecionada);
    localStorage.setItem('destino', this.destinoSelecionada);
    this.router.navigate(['/bundles']);
  }

  // Método para navegar para detalhes do pacote
  verDetalhes(packageId: number) {
    console.log('🔗 Navegando para detalhes do pacote ID:', packageId);
    this.router.navigate(['/bundles/details-bundle', packageId]).then(() => {
      // Garantir que a página comece do topo
      window.scrollTo(0, 0);
    });
  }

  // Métodos para trabalhar com reviews
  getStarsArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];
    
    // Adicionar estrelas cheias
    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }
    
    // Adicionar meia estrela se necessário
    if (hasHalfStar) {
      stars.push(0.5);
    }
    
    // Completar com estrelas vazias até 5
    while (stars.length < 5) {
      stars.push(0);
    }
    
    return stars;
  }

  getReviewGroups(): ReviewWithUser[][] {
    return this.groupedReviews;
  }

  // Método para verificar se o carrossel deve ser exibido
  hasReviews(): boolean {
    return this.reviews && this.reviews.length > 0;
  }

  // Método para obter o número total de slides
  getTotalSlides(): number {
    return this.groupedReviews.length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }



}
