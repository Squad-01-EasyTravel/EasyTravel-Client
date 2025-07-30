import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterClientDto } from '../../../../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  name = '';
  email = '';
  cpf = '';
  passport = '';
  password = '';
  telephone = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(event: Event) {
    event.preventDefault();
    const data: RegisterClientDto = {
      name: this.name,
      email: this.email,
      cpf: this.cpf,
      passport: this.passport || undefined,
      password: this.password,
      telephone: this.telephone
    };
    this.auth.registerClient(data).subscribe({
      next: (response) => {
        // O usuário já está logado automaticamente após o registro
        console.log('Registro realizado com sucesso:', response.user);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Erro no registro:', error);
        this.error = 'Erro ao registrar. Verifique os dados.';
      }
    });
  }
}