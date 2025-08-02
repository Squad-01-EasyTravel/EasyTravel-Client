import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TravelPackage } from '../bundle';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class Card {


  constructor(private route: ActivatedRoute, private router: Router) {

  }


  @Input() pacote!: TravelPackage;

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

  showDetails():void {
    let id = this.route.snapshot.paramMap.get('id') as string;
    //buscar o pacote tomando como base o id

    //ou, se os detalhes do pacote estiverem em outro componente, chamar esse componente pela rota
    this.router.navigate(['/bundles/'])
  }
}
