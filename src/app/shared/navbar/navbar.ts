import { Component, OnInit, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estados de autenticação
  isLoggedIn: boolean = false;
  currentUser: User | null = null;
  userImage: string = 'assets/imgs/et_mascote.png';
  userName: string = '';
  userRole: string | null = null;
  hasAdminAccess: boolean = false;
  isUserDropdownOpen: boolean = false;

  currentRoute: string = '';
  isMenuOpen: boolean = false;

  constructor(
    private router: Router,
    private elementRef: ElementRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentRoute = this.router.url;

    // Verificar estado inicial de autenticação
    this.checkAuthenticationStatus();

    // Observar mudanças no usuário atual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.updateUserInfo(user);
      });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
      // Fechar menu quando navegar
      this.closeMenu();
    });

    // Listener para mudanças no tamanho da tela
    this.checkScreenSize();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Verificar status de autenticação
  checkAuthenticationStatus() {
    // Força uma verificação completa do auth service
    this.authService.checkAuthStatus();

    this.isLoggedIn = this.authService.isAuthenticated();

    if (this.isLoggedIn) {
      const user = this.authService.getCurrentUser();
      this.updateUserInfo(user);
    } else {
      // Limpar dados quando não logado
      this.userRole = null;
      this.hasAdminAccess = false;
    }
  }  // Atualizar informações do usuário
  updateUserInfo(user: User | null) {
    if (user) {
      this.isLoggedIn = true;
      this.userName = user.name;
      this.userRole = this.authService.getUserRoleFromToken();
      this.hasAdminAccess = this.authService.hasAdminAccess();
      // Você pode adicionar lógica para definir a imagem do usuário aqui
      // Por exemplo, se houver um campo de avatar no usuário
      this.userImage = 'assets/imgs/et_mascote.png'; // padrão por enquanto
    } else {
      this.isLoggedIn = false;
      this.userName = '';
      this.userRole = null;
      this.hasAdminAccess = false;
      this.userImage = 'assets/imgs/et_mascote.png';
    }
  }

  isRouteActive(route: string): boolean {
    if (route === '/home' && (this.currentRoute === '/' || this.currentRoute === '/home')) {
      return true;
    }

    const isActive = this.currentRoute === route || this.currentRoute.startsWith(route + '/');
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
    this.authService.logout();
    this.isUserDropdownOpen = false;
    this.closeMenu();
  }

  // Métodos para controlar o dropdown do usuário
  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  onDropdownItemClick() {
    this.isUserDropdownOpen = false;
    this.closeMenu();
  }

  // Método para lidar com erro de carregamento de imagem
  onImageError(event: any) {
    event.target.src = 'assets/imgs/et_mascote.png';
  }

  // Fechar menu e dropdown quando clicar fora
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const navbar = this.elementRef.nativeElement.querySelector('.navbar-custom');
    const userDropdown = this.elementRef.nativeElement.querySelector('.user-dropdown');
    const userAvatar = this.elementRef.nativeElement.querySelector('.user-avatar-btn');

    // Se clicou fora do navbar e o menu está aberto, fecha o menu
    if (this.isMenuOpen && navbar && !navbar.contains(target)) {
      this.closeMenu();
    }

    // Se clicou fora do dropdown do usuário e não foi no avatar, fecha o dropdown
    if (this.isUserDropdownOpen && userDropdown && !userDropdown.contains(target) &&
        userAvatar && !userAvatar.contains(target)) {
      this.isUserDropdownOpen = false;
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
