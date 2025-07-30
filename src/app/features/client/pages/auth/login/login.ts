import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginDto } from '../../../../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(event: Event) {
    event.preventDefault();
    const data: LoginDto = { email: this.email, password: this.password };
    this.auth.login(data).subscribe({
      next: res => {
        this.auth.setToken(res.token);
        this.router.navigate(['/']);
      },
      error: () => {
        this.error = 'Usuário ou senha inválidos.';
      }
    });
  }
}
