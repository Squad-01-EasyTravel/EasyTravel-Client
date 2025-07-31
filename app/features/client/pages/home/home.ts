import { Component } from '@angular/core';
import { Footer } from '../../../../shared/footer/footer';
import { Navbar } from '../../../../shared/navbar/navbar';
import { TripCarousel } from '../../../../shared/trip-carousel/trip-carousel';
import { PopularPackages } from '../../../../shared/popular-packages/popular-packages';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Footer, Navbar, TripCarousel, PopularPackages],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
