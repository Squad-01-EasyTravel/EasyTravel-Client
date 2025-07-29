import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  // Simular estado de login - Adicionar Autentição Posteriormente apenas teste
  isLoggedIn: boolean = false;
  userImage: string = '../../../assets/imgs/et_mascote.png';
  userName: string = 'João Silva';

  // Método para fazer logout (teste)
  logout() {
    this.isLoggedIn = false;
    console.log('Usuário deslogado');
  }

  // Método para simular login (teste)
  login() {
    this.isLoggedIn = true;
  }

  // Método para alternar estado (teste)
  toggleLoginState() {
    this.isLoggedIn = !this.isLoggedIn;
  }
}
