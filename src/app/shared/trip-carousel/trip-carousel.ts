import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Importa os pipes comuns
import { Trip } from '../models/trip.interface';

@Component({
  selector: 'app-trip-carousel',
  standalone: true,
  imports: [CommonModule], // ✅ Adiciona o CommonModule aos imports
  templateUrl: './trip-carousel.html',
  styleUrls: ['./trip-carousel.css']
})
export class TripCarousel {
  trips: Trip[] = [
    {
      imageUrl: 'assets/imgs/fortaleza.jpg',
      origin: 'São Paulo',
      destination: 'Fortaleza',
      price: 320.00,
      departureDate: '2025-08-10',
      arrivalDate: '2025-08-15',
      rating: 4.7
    },
    {
      imageUrl: 'assets/imgs/gramado.jpg',
      origin: 'Rio de Janeiro',
      destination: 'Gramado',
      price: 450.00,
      departureDate: '2025-09-05',
      arrivalDate: '2025-09-12',
      rating: 4.9
    },
     {
      imageUrl: 'assets/imgs/fortaleza.jpg',
      origin: 'São Paulo',
      destination: 'Fortaleza',
      price: 320.00,
      departureDate: '2025-08-10',
      arrivalDate: '2025-08-15',
      rating: 4.7
    },
    {
      imageUrl: 'assets/imgs/gramado.jpg',
      origin: 'Rio de Janeiro',
      destination: 'Gramado',
      price: 450.00,
      departureDate: '2025-09-05',
      arrivalDate: '2025-09-12',
      rating: 4.9
    },
     {
      imageUrl: 'assets/imgs/fortaleza.jpg',
      origin: 'São Paulo',
      destination: 'Fortaleza',
      price: 320.00,
      departureDate: '2025-08-10',
      arrivalDate: '2025-08-15',
      rating: 4.7
    },
    {
      imageUrl: 'assets/imgs/gramado.jpg',
      origin: 'Rio de Janeiro',
      destination: 'Gramado',
      price: 450.00,
      departureDate: '2025-09-05',
      arrivalDate: '2025-09-12',
      rating: 4.9
    },
     {
      imageUrl: 'assets/imgs/fortaleza.jpg',
      origin: 'São Paulo',
      destination: 'Fortaleza',
      price: 320.00,
      departureDate: '2025-08-10',
      arrivalDate: '2025-08-15',
      rating: 4.7
    },
    {
      imageUrl: 'assets/imgs/gramado.jpg',
      origin: 'Rio de Janeiro',
      destination: 'Gramado',
      price: 450.00,
      departureDate: '2025-09-05',
      arrivalDate: '2025-09-12',
      rating: 4.9
    }
  ];
}
