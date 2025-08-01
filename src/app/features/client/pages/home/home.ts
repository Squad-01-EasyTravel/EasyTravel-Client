import { Component, OnInit } from '@angular/core';
import { Footer } from '../../../../shared/footer/footer';
import { Navbar } from '../../../../shared/navbar/navbar';
import { TripCarousel } from '../../../../shared/trip-carousel/trip-carousel';
import { PopularPackages } from '../../../../shared/popular-packages/popular-packages';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Footer, Navbar, TripCarousel, PopularPackages, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  origemSelecionada: string = '';
  destinoSelecionada: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {}

  buscarViagens() {
    if (!this.origemSelecionada || !this.destinoSelecionada) {
      alert('Selecione a origem e o destino!');
      return;
    }
    localStorage.setItem('origem', this.origemSelecionada);
    localStorage.setItem('destino', this.destinoSelecionada);
    this.router.navigate(['/bundles']);
  }



}
