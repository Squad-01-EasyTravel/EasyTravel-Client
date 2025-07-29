import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../models/trip.interface';

@Component({
  selector: 'app-trip-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-carousel.html',
  styleUrls: ['./trip-carousel.css']
})
export class TripCarousel implements OnInit {
  trips: Trip[] = [
    {
    imageUrl: 'assets/imgs/gramado.jpg',
    origin: 'Brasília',
    destination: 'Recife',
    price: 389.00,
    departureDate: '10/08/2025',
    arrivalDate: '15/08/2025',
    rating: 4.6
  },
  {
    imageUrl: 'assets/imgs/fortaleza.jpg',
    origin: 'Belo Horizonte',
    destination: 'Campinas',
    price: 278.50,
    departureDate: '05/09/2025',
    arrivalDate: '11/09/2025',
    rating: 4.2
  },
  {
    imageUrl: 'assets/imgs/gramado.jpg',
    origin: 'Fortaleza',
    destination: 'Curitiba',
    price: 520.00,
    departureDate: '22/09/2025',
    arrivalDate: '28/09/2025',
    rating: 1.8
  },
  {
    imageUrl: 'assets/imgs/fortaleza.jpg',
    origin: 'Salvador',
    destination: 'Florianópolis',
    price: 470.00,
    departureDate: '15/10/2025',
    arrivalDate: '20/10/2025',
    rating: 3.9
  },
  {
    imageUrl: 'assets/imgs/gramado.jpg',
    origin: 'Manaus',
    destination: 'Natal',
    price: 415.00,
    departureDate: '04/11/2025',
    arrivalDate: '09/11/2025',
    rating: 2.5
  },
  {
    imageUrl: 'assets/imgs/fortaleza.jpg',
    origin: 'João Pessoa',
    destination: 'Porto Alegre',
    price: 490.00,
    departureDate: '20/11/2025',
    arrivalDate: '26/11/2025',
    rating: 4.7
  },
   {
    imageUrl: 'assets/imgs/gramado.jpg',
    origin: 'Fortaleza',
    destination: 'Curitiba',
    price: 520.00,
    departureDate: '22/09/2025',
    arrivalDate: '28/09/2025',
    rating: 4.8
  },
  {
    imageUrl: 'assets/imgs/fortaleza.jpg',
    origin: 'Salvador',
    destination: 'Florianópolis',
    price: 470.00,
    departureDate: '15/10/2025',
    arrivalDate: '20/10/2025',
    rating: 4.9
  },
  ];

  groupedTrips: Trip[][] = [];

  ngOnInit(): void {
  this.groupTripsByScreenSize();

  window.addEventListener('resize', () => {
    this.groupedTrips = [];
    this.groupTripsByScreenSize();
  });
}

  groupTripsByScreenSize(): void {
    const screenWidth = window.innerWidth;
    let groupSize = 1;

    if (screenWidth >= 1200) {
      groupSize = 4;
    } else if (screenWidth >= 992) {
      groupSize = 3;
    } else if (screenWidth >= 768) {
      groupSize = 2;
    }

    for (let i = 0; i < this.trips.length; i += groupSize) {
      this.groupedTrips.push(this.trips.slice(i, i + groupSize));
    }
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

}
