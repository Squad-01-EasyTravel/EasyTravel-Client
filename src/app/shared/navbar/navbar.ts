import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  // Simular estado de login - Adicionar Autentição Posteriormente apenas teste
  isLoggedIn: boolean = false;
  userImage: string = '../../../assets/imgs/et_mascote.png';
  userName: string = 'João Silva';

  currentRoute: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.currentRoute = this.router.url;
    console.log('Rota inicial detectada:', this.currentRoute);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
      console.log('Mudança de rota detectada:', this.currentRoute);
    });
  }

  isRouteActive(route: string): boolean {
    if (route === '/home' && (this.currentRoute === '/' || this.currentRoute === '/home')) {
      console.log(`Rota ${route} está ativa (home)`, true);
      return true;
    }

    const isActive = this.currentRoute === route || this.currentRoute.startsWith(route + '/');
    console.log(`Verificando ${route} contra ${this.currentRoute}:`, isActive);
    return isActive;
  }

  logout() {
    this.isLoggedIn = false;
    console.log('Usuário deslogado');
  }

  login() {
    this.isLoggedIn = true;
  }

  toggleLoginState() {
    this.isLoggedIn = !this.isLoggedIn;
  }
}
