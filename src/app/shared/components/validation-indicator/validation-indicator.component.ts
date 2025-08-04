import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

interface ValidationRule {
  key: string;
  label: string;
  isValid: boolean;
  validator: (value: string) => boolean;
}

@Component({
  selector: 'app-validation-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validation-indicator.component.html',
  styleUrls: ['./validation-indicator.component.css']
})
export class ValidationIndicatorComponent implements OnInit, OnDestroy {
  @Input() control!: AbstractControl;
  @Input() type: 'password' | 'email' | 'cpf' | 'phone' | 'name' = 'password';
  @Input() showOnFocus: boolean = true;
  @Input() alwaysShow: boolean = false;
  @Input() position: 'right' | 'left' = 'right';

  private destroy$ = new Subject<void>();

  rules: ValidationRule[] = [];
  isFieldFocused = false;
  shouldShowValidation = false;

  ngOnInit() {
    this.setupRules();
    this.setupValidationLogic();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupValidationLogic() {
    // Mostrar validação quando campo tem valor ou está em foco
    this.control.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((value: any) => {
      this.validateRules(value || '');
      this.updateVisibility(value);
    });
  }

  private updateVisibility(value: string) {
    if (this.alwaysShow) {
      this.shouldShowValidation = true;
    } else if (this.showOnFocus) {
      // Mostra apenas quando o campo está em foco (sendo usado)
      this.shouldShowValidation = this.isFieldFocused;
    } else {
      this.shouldShowValidation = !!(value && value.length > 0);
    }
  }

  onFocus() {
    this.isFieldFocused = true;
    this.updateVisibility(this.control.value);
  }

  onBlur() {
    this.isFieldFocused = false;
    this.updateVisibility(this.control.value);
  }

  private setupRules() {
    switch (this.type) {
      case 'password':
        this.rules = [
          {
            key: 'required',
            label: 'Campo obrigatório',
            isValid: false,
            validator: (value: string) => !!(value && value.trim().length > 0)
          },
          {
            key: 'minLength',
            label: 'Mínimo 8 caracteres',
            isValid: false,
            validator: (value: string) => value.length >= 8
          },
          {
            key: 'uppercase',
            label: 'Pelo menos 1 letra maiúscula (A-Z)',
            isValid: false,
            validator: (value: string) => /[A-Z]/.test(value)
          },
          {
            key: 'lowercase',
            label: 'Pelo menos 1 letra minúscula (a-z)',
            isValid: false,
            validator: (value: string) => /[a-z]/.test(value)
          },
          {
            key: 'number',
            label: 'Pelo menos 1 número (0-9)',
            isValid: false,
            validator: (value: string) => /\d/.test(value)
          },
          {
            key: 'special',
            label: 'Pelo menos 1 caractere especial (!@#$%)',
            isValid: false,
            validator: (value: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
          }
        ];
        break;

      case 'email':
        this.rules = [
          {
            key: 'required',
            label: 'Campo obrigatório',
            isValid: false,
            validator: (value: string) => !!(value && value.trim().length > 0)
          },
          {
            key: 'format',
            label: 'Formato de e-mail válido (exemplo@dominio.com)',
            isValid: false,
            validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          },
          {
            key: 'noSpaces',
            label: 'Sem espaços em branco',
            isValid: false,
            validator: (value: string) => !/\s/.test(value)
          },
          {
            key: 'minLength',
            label: 'Mínimo 5 caracteres',
            isValid: false,
            validator: (value: string) => value.length >= 5
          }
        ];
        break;

      case 'cpf':
        this.rules = [
          {
            key: 'required',
            label: 'Campo obrigatório',
            isValid: false,
            validator: (value: string) => !!(value && value.trim().length > 0)
          },
          {
            key: 'format',
            label: 'Formato correto: XXX.XXX.XXX-XX',
            isValid: false,
            validator: (value: string) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)
          },
          {
            key: 'valid',
            label: 'CPF válido',
            isValid: false,
            validator: (value: string) => this.validateCPF(value)
          }
        ];
        break;

      case 'phone':
        this.rules = [
          {
            key: 'required',
            label: 'Campo obrigatório',
            isValid: false,
            validator: (value: string) => !!(value && value.trim().length > 0)
          },
          {
            key: 'format',
            label: 'Formato: (XX) XXXXX-XXXX',
            isValid: false,
            validator: (value: string) => /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)
          },
          {
            key: 'minLength',
            label: 'Mínimo 10 dígitos',
            isValid: false,
            validator: (value: string) => value.replace(/\D/g, '').length >= 10
          }
        ];
        break;

      case 'name':
        this.rules = [
          {
            key: 'required',
            label: 'Campo obrigatório',
            isValid: false,
            validator: (value: string) => !!(value && value.trim().length > 0)
          },
          {
            key: 'minLength',
            label: 'Mínimo 2 caracteres',
            isValid: false,
            validator: (value: string) => value.trim().length >= 2
          },
          {
            key: 'onlyLetters',
            label: 'Apenas letras e espaços',
            isValid: false,
            validator: (value: string) => /^[a-zA-ZÀ-ÿ\s]+$/.test(value)
          },
          {
            key: 'noExtraSpaces',
            label: 'Sem espaços extras',
            isValid: false,
            validator: (value: string) => !value.includes('  ') && value.trim() === value
          }
        ];
        break;
    }
  }

  private validateRules(value: string) {
    this.rules.forEach(rule => {
      rule.isValid = rule.validator(value);
    });
  }

  private validateCPF(cpf: string): boolean {
    // Remove pontos e traços
    cpf = cpf.replace(/[^\d]/g, '');

    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  get allValid(): boolean {
    return this.rules.every(rule => rule.isValid);
  }

  get hasAnyValid(): boolean {
    return this.rules.some(rule => rule.isValid);
  }

  get validCount(): number {
    return this.rules.filter(rule => rule.isValid).length;
  }

  get progressPercentage(): number {
    return this.rules.length > 0 ? (this.validCount / this.rules.length) * 100 : 0;
  }
}
