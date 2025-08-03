import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class Card implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

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

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  hasPartialStar(rating: number): boolean {
    return rating % 1 !== 0;
  }

  showDetails(): void {
    this.router.navigate(['/bundles/', this.pacote.id]);
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
}
