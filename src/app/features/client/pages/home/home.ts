import { Component } from '@angular/core';
import { Footer } from '../../../../shared/footer/footer';
import { Navbar } from '../../../../shared/navbar/navbar';
import { TripCarousel } from '../../../../shared/trip-carousel/trip-carousel';
import { Offer } from '../../../../shared/offer/offer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Footer, Navbar, TripCarousel, Offer],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
