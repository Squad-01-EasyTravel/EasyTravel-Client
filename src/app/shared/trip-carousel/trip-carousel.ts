import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../models/trip.interface';
import { SwiperModule } from 'swiper/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-trip-carousel',
  standalone: true,
  imports: [CommonModule, SwiperModule],
  templateUrl: './trip-carousel.html',
  styleUrls: ['./trip-carousel.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TripCarousel {
  trips: Trip[] = [
    {
      imageUrl: 'assets/imgs/fortaleza.jpg',
      origin: 'São Paulo',
      destination: 'Recife',
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
