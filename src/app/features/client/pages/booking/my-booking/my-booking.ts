import { Component } from '@angular/core';
import { Navbar } from '../../../../../shared/navbar/navbar';
import { Footer } from '../../../../../shared/footer/footer';

@Component({
  selector: 'app-my-booking',
  imports: [Navbar, Footer],
  templateUrl: './my-booking.html',
  styleUrl: './my-booking.css'
})
export class MyBooking {

}
