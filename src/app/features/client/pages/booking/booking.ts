import { Component } from '@angular/core';
import { Selected } from "./selected/selected";
import { PurchaseSummary } from "./purchase-summary/purchase-summary";
import { Navbar } from "../../../../shared/navbar/navbar";

@Component({
  selector: 'app-booking',
  imports: [Selected, PurchaseSummary, Navbar],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking {

}
