import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../models/trip.interface';
import { PackageService } from '../services/package.service';

declare var bootstrap: any;

@Component({
  selector: 'app-trip-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-carousel.html',
  styleUrls: ['./trip-carousel.css']
})
export class TripCarousel implements OnInit, AfterViewInit {
  trips: Trip[] = [];
  groupedTrips: Trip[][] = [];
  private currentCardsPerSlide = 4;

  constructor(private packageService: PackageService) {}

  ngOnInit(): void {
    this.setCardsPerSlide();
    this.loadCostBenefitPackages();
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
      if (this.trips.length > 0) {
        this.groupedTrips = this.groupTrips(this.trips, this.currentCardsPerSlide);
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
    if (carouselElement && typeof bootstrap !== 'undefined' && this.groupedTrips.length > 0) {
      new bootstrap.Carousel(carouselElement, {
        interval: 3000,
        ride: 'carousel',
        wrap: true,
        keyboard: true,
        pause: 'hover'
      });
    }
  }

  loadCostBenefitPackages(): void {
    this.packageService.getCostBenefitPackages().subscribe({
      next: (packages) => {
        this.trips = packages;
        this.groupedTrips = this.groupTrips(packages, this.currentCardsPerSlide);

        // Reinicializar carousel após carregar dados
        setTimeout(() => {
          this.initializeCarousel();
        }, 100);
      },
      error: (error) => {
        console.error('Erro ao carregar pacotes custo benefício:', error);
      }
    });
  }

  private groupTrips(trips: Trip[], size: number): Trip[][] {
    const groups: Trip[][] = [];
    for (let i = 0; i < trips.length; i += size) {
      groups.push(trips.slice(i, i + size));
    }
    return groups;
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const maxStars = 5;

    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }

    if (hasHalfStar) {
      stars.push('half');
    }

    while (stars.length < maxStars) {
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

}
