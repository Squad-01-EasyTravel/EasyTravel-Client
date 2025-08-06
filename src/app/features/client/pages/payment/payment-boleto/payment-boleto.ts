import { Component, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-boleto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-boleto.html',
  styleUrl: './payment-boleto.css'
})
export class PaymentBoleto {
  @Output() formValidation = new EventEmitter<boolean>();
  @Output() formData = new EventEmitter<any>();
  boletoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.boletoForm = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      endereco: ['', [Validators.required, Validators.minLength(5)]],
      numero: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      complemento: [''],
      bairro: ['', [Validators.required, Validators.minLength(2)]],
      cidade: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      estado: ['', [Validators.required, Validators.minLength(2)]],
      codigoPostal: ['', [Validators.required, this.cepValidator.bind(this)]],
      pais: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]]
    });

    // Emite o status de validação sempre que o formulário mudar
    this.boletoForm.statusChanges.subscribe(status => {
      this.formValidation.emit(status === 'VALID');
    });

    // Emite os dados do formulário sempre que mudar
    this.boletoForm.valueChanges.subscribe(formValue => {
      this.formData.emit(formValue);
    });

    // Emitir dados iniciais
    this.formData.emit(this.boletoForm.value);
  }

  // Validador de CEP
  private cepValidator(control: any) {
    if (!control.value) return null;
    const cep = control.value.replace(/\D/g, '');
    return cep.length === 8 ? null : { cepInvalid: true };
  }

  // Formatar CPF
  formatCPF(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    event.target.value = value;
  }

  // Formatar telefone
  formatPhone(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    event.target.value = value;
  }

  // Formatar CEP
  formatCEP(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    event.target.value = value;
  }

  // Apenas números
  onlyNumbers(event: any) {
    return /[0-9]/.test(event.key) || ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(event.key);
  }

  // Apenas letras
  onlyLetters(event: any) {
    return /[a-zA-ZÀ-ÿ\s]/.test(event.key) || ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(event.key);
  }
}
