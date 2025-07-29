import { Component } from '@angular/core';
import { Footer } from '../../../../shared/footer/footer';
import { Navbar } from '../../../../shared/navbar/navbar';
import { TripCarousel } from '../../../../shared/trip-carousel/trip-carousel';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Footer, Navbar, TripCarousel],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
