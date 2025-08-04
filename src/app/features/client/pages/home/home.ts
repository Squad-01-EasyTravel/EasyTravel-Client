import { Component, OnInit } from '@angular/core';
import { Footer } from '../../../../shared/footer/footer';
import { Navbar } from '../../../../shared/navbar/navbar';
import { TripCarousel } from '../../../../shared/trip-carousel/trip-carousel';
import { PopularPackages } from '../../../../shared/popular-packages/popular-packages';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BundleService } from '../../../../shared/services/bundle-service';
import { Location } from '../../../../shared/models/location.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Footer, Navbar, TripCarousel, PopularPackages, FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  origemSelecionada: string = '';
  destinoSelecionada: string = '';
  
  // Lista de locais da API
  locations: Location[] = [];

  constructor(
    private router: Router,
    private bundleService: BundleService
  ) {}

  ngOnInit(): void {
    this.loadLocations();
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



}
