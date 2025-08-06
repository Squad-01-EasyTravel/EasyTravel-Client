import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  // Validadores customizados para formulários
  static passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const errors: ValidationErrors = {};

      if (value.length < 8) {
        errors['minLength'] = true;
      }

      if (!/[A-Z]/.test(value)) {
        errors['uppercase'] = true;
      }

      if (!/[a-z]/.test(value)) {
        errors['lowercase'] = true;
      }

      if (!/\d/.test(value)) {
        errors['number'] = true;
      }

      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        errors['special'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const errors: ValidationErrors = {};

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors['format'] = true;
      }

      if (/\s/.test(value)) {
        errors['noSpaces'] = true;
      }

      if (value.length < 5) {
        errors['minLength'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  static cpfValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const errors: ValidationErrors = {};

      if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)) {
        errors['format'] = true;
      }

      if (!ValidationService.validateCPF(value)) {
        errors['valid'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const errors: ValidationErrors = {};

      if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)) {
        errors['format'] = true;
      }

      if (value.replace(/\D/g, '').length < 10) {
        errors['minLength'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  static nameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const errors: ValidationErrors = {};

      if (value.trim().length < 2) {
        errors['minLength'] = true;
      }

      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
        errors['onlyLetters'] = true;
      }

      if (value.includes('  ') || value.trim() !== value) {
        errors['noExtraSpaces'] = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  // Métodos utilitários
  static validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, '');

    if (cpf.length !== 11) return false;

    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  // Máscaras para formatação
  static formatCPF(value: string): string {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  static formatPhone(value: string): string {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  }

  // Validação em tempo real para mostrar feedback visual
  static getFieldValidationState(control: AbstractControl, fieldType: string): 'pristine' | 'valid' | 'invalid' | 'pending' {
    if (!control.touched && !control.dirty) {
      return 'pristine';
    }

    if (control.pending) {
      return 'pending';
    }

    if (control.valid) {
      return 'valid';
    }

    return 'invalid';
  }

  // Mensagens de erro personalizadas
  static getErrorMessage(fieldName: string, errors: ValidationErrors): string {
    if (errors['required']) {
      return `${fieldName} é obrigatório`;
    }

    if (errors['email']) {
      return 'E-mail deve ter um formato válido';
    }

    if (errors['minLength']) {
      return `${fieldName} deve ter pelo menos ${errors['minLength'].requiredLength} caracteres`;
    }

    if (errors['format']) {
      return `${fieldName} deve ter um formato válido`;
    }

    if (errors['uppercase']) {
      return 'Senha deve conter pelo menos uma letra maiúscula';
    }

    if (errors['lowercase']) {
      return 'Senha deve conter pelo menos uma letra minúscula';
    }

    if (errors['number']) {
      return 'Senha deve conter pelo menos um número';
    }

    if (errors['special']) {
      return 'Senha deve conter pelo menos um caractere especial';
    }

    return 'Campo inválido';
  }
}
