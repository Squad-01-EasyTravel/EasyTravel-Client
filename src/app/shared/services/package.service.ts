import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Trip } from '../models/trip.interface';
import { AssetService } from './asset.service';

@Injectable({
  providedIn: 'root'
})
export class PackageService {

  // Mock data - futuramente será substituído por chamadas HTTP
  private mockTrips: Trip[] = [
    // Pacotes Custo Benefício
    {
      id: 1,
      imageUrl: 'assets/imgs/gramado.jpg',
      origin: 'São Paulo',
      destination: 'Gramado',
      price: 899,
      originalPrice: 999,
      departureDate: '2025-03-15',
      arrivalDate: '2025-03-17',
      rating: 3.0,
      duration: '3 dias / 2 noites',
      discount: 100,
      isBestValue: true,
      category: 'cost-benefit',
      description: 'Pacote completo para Gramado com hospedagem e café da manhã',
      inclusions: ['Hospedagem', 'Café da manhã', 'Transfer aeroporto'],
      highlights: ['Centro histórico', 'Lago Negro', 'Mini Mundo']
    },
    {
      id: 2,
      imageUrl: 'assets/imgs/fortaleza.jpg',
      origin: 'Rio de Janeiro',
      destination: 'Fortaleza',
      price: 1299,
      originalPrice: 1499,
      departureDate: '2025-04-10',
      arrivalDate: '2025-04-14',
      rating: 3.5,
      duration: '5 dias / 4 noites',
      discount: 200,
      isBestValue: true,
      category: 'cost-benefit',
      description: 'Descubra as praias paradisíacas do Ceará',
      inclusions: ['Voo ida e volta', 'Hospedagem', 'City tour'],
      highlights: ['Praia de Iracema', 'Centro Dragão do Mar', 'Beach Park']
    }
    /* 
    // Pacotes Custo-Benefício comentados temporariamente
    {
      id: 3,
      imageUrl: 'assets/imgs/gramado.jpg',
      origin: 'Brasília',
      destination: 'Campos do Jordão',
      price: 749,
      originalPrice: 899,
      departureDate: '2025-05-20',
      arrivalDate: '2025-05-22',
      rating: 4.3,
      duration: '3 dias / 2 noites',
      discount: 150,
      isBestValue: true,
      category: 'cost-benefit',
      description: 'Refúgio na montanha com clima europeu',
      inclusions: ['Hospedagem', 'Café da manhã', 'Passeio teleférico'],
      highlights: ['Capivari', 'Horto Florestal', 'Vila Inglesa']
    },
    {
      id: 4,
      imageUrl: 'assets/imgs/fortaleza.jpg',
      origin: 'Salvador',
      destination: 'Porto Seguro',
      price: 1199,
      originalPrice: 1399,
      departureDate: '2025-06-05',
      arrivalDate: '2025-06-09',
      rating: 4.6,
      duration: '5 dias / 4 noites',
      discount: 200,
      isBestValue: true,
      category: 'cost-benefit',
      description: 'História e praias na costa do descobrimento',
      inclusions: ['Voo ida e volta', 'Hospedagem', 'Passeio histórico'],
      highlights: ['Centro Histórico', 'Praia do Mutá', 'Arraial d\'Ajuda']
    },

    // Pacotes Populares comentados temporariamente
    {
      id: 5,
      imageUrl: 'assets/imgs/fortaleza.jpg',
      origin: 'São Paulo',
      destination: 'Rio de Janeiro',
      price: 1899,
      originalPrice: 2199,
      departureDate: '2025-07-15',
      arrivalDate: '2025-07-19',
      rating: 4.8,
      duration: '5 dias / 4 noites',
      discount: 300,
      isPopular: true,
      category: 'popular',
      description: 'Cidade Maravilhosa com o melhor do turismo carioca',
      inclusions: ['Voo ida e volta', 'Hospedagem 4*', 'City tour', 'Cristo Redentor'],
      highlights: ['Copacabana', 'Cristo Redentor', 'Pão de Açúcar', 'Santa Teresa']
    },
    {
      id: 6,
      imageUrl: 'assets/imgs/gramado.jpg',
      origin: 'Rio de Janeiro',
      destination: 'Fernando de Noronha',
      price: 3499,
      originalPrice: 3999,
      departureDate: '2025-08-01',
      arrivalDate: '2025-08-06',
      rating: 4.9,
      duration: '6 dias / 5 noites',
      discount: 500,
      isPopular: true,
      category: 'popular',
      description: 'Paraíso ecológico com as mais belas praias do Brasil',
      inclusions: ['Voo ida e volta', 'Hospedagem', 'Taxa ambiental', 'Mergulho'],
      highlights: ['Praia do Sancho', 'Baía dos Porcos', 'Projeto TAMAR', 'Trilhas ecológicas']
    },
    {
      id: 7,
      imageUrl: 'assets/imgs/fortaleza.jpg',
      origin: 'Brasília',
      destination: 'Maceió',
      price: 1799,
      originalPrice: 2099,
      departureDate: '2025-09-10',
      arrivalDate: '2025-09-14',
      rating: 4.7,
      duration: '5 dias / 4 noites',
      discount: 300,
      isPopular: true,
      category: 'popular',
      description: 'Paraíso tropical com praias de águas cristalinas',
      inclusions: ['Voo ida e volta', 'Hospedagem', 'Passeio de buggy', 'Praia de Galés'],
      highlights: ['Praia de Pajuçara', 'Piscinas naturais', 'São Miguel dos Milagres']
    },
    {
      id: 8,
      imageUrl: 'assets/imgs/gramado.jpg',
      origin: 'São Paulo',
      destination: 'Foz do Iguaçu',
      price: 1399,
      originalPrice: 1699,
      departureDate: '2025-10-20',
      arrivalDate: '2025-10-23',
      rating: 4.6,
      duration: '4 dias / 3 noites',
      discount: 300,
      isPopular: true,
      category: 'popular',
      description: 'Maravilha natural com as famosas Cataratas do Iguaçu',
      inclusions: ['Voo ida e volta', 'Hospedagem', 'Ingresso Cataratas', 'Parque das Aves'],
      highlights: ['Cataratas do Iguaçu', 'Parque das Aves', 'Marco das 3 Fronteiras', 'Usina de Itaipu']
    },

    // Mais pacotes Custo-Benefício comentados temporariamente
    {
      id: 9,
      imageUrl: 'assets/imgs/fortaleza.jpg',
      origin: 'Rio de Janeiro',
      destination: 'Natal',
      price: 899,
      originalPrice: 1199,
      departureDate: '2025-08-15',
      arrivalDate: '2025-08-18',
      rating: 4.3,
      duration: '4 dias / 3 noites',
      discount: 300,
      isBestValue: true,
      category: 'cost-benefit',
      description: 'Capital potiguar com dunas e praias paradisíacas',
      inclusions: ['Voo ida e volta', 'Hospedagem', 'Passeio de buggy'],
      highlights: ['Genipabu', 'Ponta Negra', 'Forte dos Reis Magos']
    },
    {
      id: 10,
      imageUrl: 'assets/imgs/gramado.jpg',
      origin: 'Belo Horizonte',
      destination: 'Ouro Preto',
      price: 599,
      originalPrice: 799,
      departureDate: '2025-09-05',
      arrivalDate: '2025-09-07',
      rating: 4.4,
      duration: '3 dias / 2 noites',
      discount: 200,
      isBestValue: true,
      category: 'cost-benefit',
      description: 'Cidade histórica patrimônio da humanidade',
      inclusions: ['Hospedagem', 'City tour', 'Visita às igrejas'],
      highlights: ['Centro Histórico', 'Igreja São Francisco', 'Mina da Passagem']
    },
    {
      id: 11,
      imageUrl: 'assets/imgs/fortaleza.jpg',
      origin: 'São Paulo',
      destination: 'Recife',
      price: 1099,
      originalPrice: 1399,
      departureDate: '2025-10-10',
      arrivalDate: '2025-10-14',
      rating: 4.5,
      duration: '5 dias / 4 noites',
      discount: 300,
      isBestValue: true,
      category: 'cost-benefit',
      description: 'Venice brasileira com história e cultura',
      inclusions: ['Voo ida e volta', 'Hospedagem', 'City tour'],
      highlights: ['Recife Antigo', 'Marco Zero', 'Instituto Ricardo Brennand']
    },
    {
      id: 12,
      imageUrl: 'assets/imgs/gramado.jpg',
      origin: 'Brasília',
      destination: 'Chapada dos Veadeiros',
      price: 799,
      originalPrice: 999,
      departureDate: '2025-11-20',
      arrivalDate: '2025-11-23',
      rating: 4.6,
      duration: '4 dias / 3 noites',
      discount: 200,
      isBestValue: true,
      category: 'cost-benefit',
      description: 'Paraíso ecológico com cachoeiras cristalinas',
      inclusions: ['Hospedagem', 'Guia especializado', 'Trilhas'],
      highlights: ['Cachoeira Santa Bárbara', 'Vale da Lua', 'Jardim de Maytrea']
    },

    // Mais pacotes Populares comentados temporariamente
    {
      id: 13,
      imageUrl: 'assets/imgs/fortaleza.jpg',
      origin: 'São Paulo',
      destination: 'Cancún',
      price: 4999,
      originalPrice: 5999,
      departureDate: '2025-12-15',
      arrivalDate: '2025-12-22',
      rating: 4.8,
      duration: '8 dias / 7 noites',
      discount: 1000,
      isPopular: true,
      category: 'popular',
      description: 'Paraíso caribenho com resorts all-inclusive',
      inclusions: ['Voo ida e volta', 'Resort All-Inclusive', 'Transfers'],
      highlights: ['Praias de areia branca', 'Chichen Itzá', 'Vida noturna']
    },
    {
      id: 14,
      imageUrl: 'assets/imgs/gramado.jpg',
      origin: 'Rio de Janeiro',
      destination: 'Buenos Aires',
      price: 2499,
      originalPrice: 2999,
      departureDate: '2025-07-25',
      arrivalDate: '2025-07-29',
      rating: 4.7,
      duration: '5 dias / 4 noites',
      discount: 500,
      isPopular: true,
      category: 'popular',
      description: 'Capital argentina com tango e gastronomia',
      inclusions: ['Voo ida e volta', 'Hospedagem', 'Show de tango'],
      highlights: ['Puerto Madero', 'La Boca', 'Recoleta', 'Palermo']
    },
    {
      id: 15,
      imageUrl: 'assets/imgs/fortaleza.jpg',
      origin: 'São Paulo',
      destination: 'Europa (Londres/Paris)',
      price: 8999,
      originalPrice: 10999,
      departureDate: '2025-06-01',
      arrivalDate: '2025-06-15',
      rating: 4.9,
      duration: '15 dias / 14 noites',
      discount: 2000,
      isPopular: true,
      category: 'popular',
      description: 'Duas capitais europeias em uma viagem inesquecível',
      inclusions: ['Voo ida e volta', 'Hospedagem', 'Trem Londres-Paris', 'City tours'],
      highlights: ['Big Ben', 'Torre Eiffel', 'Louvre', 'London Eye']
    },
    {
      id: 16,
      imageUrl: 'assets/imgs/gramado.jpg',
      origin: 'Brasília',
      destination: 'Dubai',
      price: 6999,
      originalPrice: 8499,
      departureDate: '2025-09-15',
      arrivalDate: '2025-09-22',
      rating: 4.8,
      duration: '8 dias / 7 noites',
      discount: 1500,
      isPopular: true,
      category: 'popular',
      description: 'Cidade futurística com luxo e modernidade',
      inclusions: ['Voo ida e volta', 'Hospedagem 5*', 'Desert Safari', 'Dubai Mall'],
      highlights: ['Burj Khalifa', 'Palm Jumeirah', 'Dubai Mall', 'Desert Safari']
    }
    */
  ];

  constructor(private assetService: AssetService) {
    // Inicializar os caminhos das imagens após a injeção do serviço
    this.updateImagePaths();
  }

  private updateImagePaths(): void {
    this.mockTrips.forEach(trip => {
      if (trip.imageUrl.includes('gramado.jpg')) {
        trip.imageUrl = this.assetService.getImagePath('imgs/gramado.jpg');
      } else if (trip.imageUrl.includes('fortaleza.jpg')) {
        trip.imageUrl = this.assetService.getImagePath('imgs/fortaleza.jpg');
      }
    });
  }

  // Método para buscar pacotes custo benefício
  getCostBenefitPackages(): Observable<Trip[]> {
    const costBenefitPackages = this.mockTrips.filter(trip => trip.category === 'cost-benefit');
    return of(costBenefitPackages);
  }

  // Método para buscar pacotes populares
  getPopularPackages(): Observable<Trip[]> {
    const popularPackages = this.mockTrips.filter(trip => trip.category === 'popular');
    return of(popularPackages);
  }

  // Método para buscar todos os pacotes
  getAllPackages(): Observable<Trip[]> {
    return of(this.mockTrips);
  }

  // Método para buscar pacote por ID
  getPackageById(id: number): Observable<Trip | undefined> {
    const trip = this.mockTrips.find(trip => trip.id === id);
    return of(trip);
  }

  // Método para buscar pacotes por categoria
  getPackagesByCategory(category: 'popular' | 'cost-benefit' | 'premium'): Observable<Trip[]> {
    const filteredTrips = this.mockTrips.filter(trip => trip.category === category);
    return of(filteredTrips);
  }

  // Método para buscar pacotes em destaque
  getFeaturedPackages(): Observable<Trip[]> {
    const featuredTrips = this.mockTrips.filter(trip => trip.isPopular || trip.isBestValue);
    return of(featuredTrips);
  }

  // Método para buscar pacotes por origem
  getPackagesByOrigin(origin: string): Observable<Trip[]> {
    const filteredTrips = this.mockTrips.filter(trip =>
      trip.origin.toLowerCase().includes(origin.toLowerCase())
    );
    return of(filteredTrips);
  }

  // Método para buscar pacotes por destino
  getPackagesByDestination(destination: string): Observable<Trip[]> {
    const filteredTrips = this.mockTrips.filter(trip =>
      trip.destination.toLowerCase().includes(destination.toLowerCase())
    );
    return of(filteredTrips);
  }

  // Método para buscar pacotes por faixa de preço
  getPackagesByPriceRange(minPrice: number, maxPrice: number): Observable<Trip[]> {
    const filteredTrips = this.mockTrips.filter(trip =>
      trip.price >= minPrice && trip.price <= maxPrice
    );
    return of(filteredTrips);
  }
}
