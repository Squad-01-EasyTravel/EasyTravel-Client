import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../../../shared/navbar/navbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-travel-history',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './travel-history.html',
  styleUrl: './travel-history.css'
})
export class TravelHistory {
  travels: any[] = [];

  formatCurrency(value: number): string {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }
}
