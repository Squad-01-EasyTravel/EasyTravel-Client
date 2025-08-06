import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ValidationIndicatorComponent } from '../../../../../shared/components/validation-indicator/validation-indicator.component';
import { AuthService, RegisterClientDto } from '../../../../../shared/services/auth.service';
import { ValidationService } from '../../../../../shared/services/validation.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ValidationIndicatorComponent],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm: FormGroup;
  error = '';
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, ValidationService.nameValidator()]],
      email: ['', [Validators.required, ValidationService.emailValidator()]],
      password: ['', [Validators.required, ValidationService.passwordValidator()]],
      cpf: ['', [Validators.required, ValidationService.cpfValidator()]],
      telephone: ['', [Validators.required, ValidationService.phoneValidator()]],
      passport: [''] // opcional
    });
  }

  get nameControl() { return this.registerForm.get('name')!; }
  get emailControl() { return this.registerForm.get('email')!; }
  get passwordControl() { return this.registerForm.get('password')!; }
  get cpfControl() { return this.registerForm.get('cpf')!; }
  get telephoneControl() { return this.registerForm.get('telephone')!; }
  get passportControl() { return this.registerForm.get('passport')!; }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = '';

      const formValues = this.registerForm.value;
      const data: RegisterClientDto = {
        name: formValues.name,
        email: formValues.email,
        cpf: formValues.cpf,
        passport: formValues.passport || undefined,
        password: formValues.password,
        telephone: formValues.telephone
      };

      this.auth.registerClient(data).subscribe({
        next: (response) => {
          console.log('Registro realizado com sucesso:', response.user);
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Erro no registro:', error);
          this.error = 'Erro ao registrar. Verifique os dados e tente novamente.';
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.error = 'Por favor, corrija os erros antes de continuar.';
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldValidationClass(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
    if (!control) return '';

    const state = ValidationService.getFieldValidationState(control, fieldName);
    return `field-${state}`;
  }

  shouldShowFieldError(fieldName: string): boolean {
    const control = this.registerForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
    if (control && control.errors) {
      return ValidationService.getErrorMessage(fieldName, control.errors);
    }
    return '';
  }

  // Formatação automática dos campos
  onCpfInput(event: any) {
    const value = event.target.value;
    const formatted = ValidationService.formatCPF(value);
    this.cpfControl.setValue(formatted);
  }

  onPhoneInput(event: any) {
    const value = event.target.value;
    const formatted = ValidationService.formatPhone(value);
    this.telephoneControl.setValue(formatted);
  }
}
