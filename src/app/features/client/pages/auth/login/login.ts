import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ValidationIndicatorComponent } from '../../../../../shared/components/validation-indicator/validation-indicator.component';
import { AuthService, LoginDto } from '../../../../../shared/services/auth.service';
import { ValidationService } from '../../../../../shared/services/validation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ValidationIndicatorComponent],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;
  error = '';
  isLoading = false;
  showErrorModal = false; // Nova propriedade para controlar o modal

  constructor(
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, ValidationService.emailValidator()]],
      password: ['', [Validators.required, ValidationService.passwordValidator()]]
    });
  }

  get emailControl() {
    return this.loginForm.get('email')!;
  }

  get passwordControl() {
    return this.loginForm.get('password')!;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.showErrorModal = false; // Ocultar modal se estiver visível

      const data: LoginDto = {
        email: this.emailControl.value,
        password: this.passwordControl.value
      };

      this.auth.login(data).subscribe({
        next: (response) => {
          console.log('Login realizado com sucesso:', response.user);
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Erro no login:', error);
          this.error = 'E-mail ou senha inválidos. Verifique seus dados e tente novamente.';
          this.showErrorModal = true; // Mostrar modal de erro
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.error = 'Por favor, corrija os erros antes de continuar.';
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Método para fechar o modal de erro
  closeErrorModal() {
    this.showErrorModal = false;
    this.error = '';
  }

  getFieldValidationClass(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (!control) return '';

    const state = ValidationService.getFieldValidationState(control, fieldName);
    return `field-${state}`;
  }

  shouldShowFieldError(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (control && control.errors) {
      return ValidationService.getErrorMessage(fieldName, control.errors);
    }
    return '';
  }
}
