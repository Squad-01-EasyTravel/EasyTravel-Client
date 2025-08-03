import { Component, OnInit, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../models/trip.interface';
import { PackageService } from '../services/package.service';
import { BundleService } from '../services/bundle-service';
import { BundleClass } from '@/app/features/client/pages/bundle/class/bundle-class';

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

  constructor(
    private packageService: PackageService,
    private bundleService: BundleService,
    private cdr: ChangeDetectorRef
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
        // Buscar imagens para cada bundle
        this.loadBundleImages();
      },
      error: (error) => {
        console.error('Erro ao carregar pacotes disponíveis:', error);
      }
    });
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      // Se a imagem falhar, usar a imagem padrão
      imgElement.src = '/assets/imgs/gramado.jpg';
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
    const start = new Date(initialDate);
    const end = new Date(finalDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

}
