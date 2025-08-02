import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
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
  userImage: string = 'assets/imgs/et_mascote.png';
  userName: string = 'João Silva';

  currentRoute: string = '';
  isMenuOpen: boolean = false;

  constructor(private router: Router, private elementRef: ElementRef) {}

  ngOnInit() {
    this.currentRoute = this.router.url;
    console.log('Rota inicial detectada:', this.currentRoute);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
      console.log('Mudança de rota detectada:', this.currentRoute);
      // Fechar menu quando navegar
      this.closeMenu();
    });

    // Listener para mudanças no tamanho da tela
    this.checkScreenSize();
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

  // Métodos para controlar o menu hamburger
  toggleMenu() {
    // Só funciona em mobile
    const isDesktop = window.innerWidth >= 992;
    if (isDesktop) {
      return;
    }

    this.isMenuOpen = !this.isMenuOpen;
    const navbarCollapse = document.getElementById('navbarNav');
    const toggler = document.querySelector('.navbar-toggler') as HTMLElement;
    
    if (navbarCollapse && toggler) {
      if (this.isMenuOpen) {
        navbarCollapse.classList.add('show');
        toggler.setAttribute('aria-expanded', 'true');
        toggler.classList.remove('collapsed');
      } else {
        navbarCollapse.classList.remove('show');
        toggler.setAttribute('aria-expanded', 'false');
        toggler.classList.add('collapsed');
      }
    }
  }

  closeMenu() {
    // Em desktop, não fazer nada
    const isDesktop = window.innerWidth >= 992;
    if (isDesktop) {
      this.isMenuOpen = false;
      return;
    }

    this.isMenuOpen = false;
    const navbarCollapse = document.getElementById('navbarNav');
    const toggler = document.querySelector('.navbar-toggler') as HTMLElement;
    
    if (navbarCollapse) {
      navbarCollapse.classList.remove('show');
    }
    
    if (toggler) {
      toggler.setAttribute('aria-expanded', 'false');
      toggler.classList.add('collapsed');
    }
  }

  onNavLinkClick() {
    this.closeMenu();
  }

  logout() {
    this.isLoggedIn = false;
    this.closeMenu();
    console.log('Usuário deslogado');
  }

  login() {
    this.isLoggedIn = true;
    this.closeMenu();
  }

  // Método para lidar com erro de carregamento de imagem
  onImageError(event: any) {
    event.target.src = 'assets/imgs/et_mascote.png';
    console.log('Erro ao carregar imagem, usando fallback');
  }

  toggleLoginState() {
    this.isLoggedIn = !this.isLoggedIn;
    this.closeMenu();
  }

  // Fechar menu quando clicar fora
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const navbar = this.elementRef.nativeElement.querySelector('.navbar-custom');
    
    // Se clicou fora do navbar e o menu está aberto, fecha o menu
    if (this.isMenuOpen && navbar && !navbar.contains(target)) {
      this.closeMenu();
    }
  }

  // Listener para mudanças no tamanho da tela
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    this.checkScreenSize();
  }

  // Verificar se estamos em desktop e resetar menu se necessário
  checkScreenSize() {
    const isDesktop = window.innerWidth >= 992; // lg breakpoint do Bootstrap
    
    if (isDesktop && this.isMenuOpen) {
      // Se estamos em desktop e o menu mobile está aberto, resetar
      this.resetMenuState();
    }
  }

  // Resetar completamente o estado do menu
  resetMenuState() {
    this.isMenuOpen = false;
    const navbarCollapse = document.getElementById('navbarNav');
    const toggler = document.querySelector('.navbar-toggler') as HTMLElement;
    
    if (navbarCollapse) {
      navbarCollapse.classList.remove('show');
      navbarCollapse.style.display = '';
    }
    
    if (toggler) {
      toggler.setAttribute('aria-expanded', 'false');
      toggler.classList.add('collapsed');
    }
  }
}
