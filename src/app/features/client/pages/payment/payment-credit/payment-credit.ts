import { Component, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-credit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-credit.html',
  styleUrl: './payment-credit.css'
})
export class PaymentCredit {
  @Output() formValidation = new EventEmitter<boolean>();
  @Output() formData = new EventEmitter<any>();
  creditForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.creditForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      endereco: ['', [Validators.required, Validators.minLength(5)]],
      cidade: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      pais: ['Brasil', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)]],
      titular: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      numeroCartao: ['', [Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]],
      mesValidade: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
      anoValidade: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      formaPagamento: ['credito', Validators.required],
      installments: [1, [Validators.required, Validators.min(1), Validators.max(12)]]
    });

    // Emite o status de validação sempre que o formulário mudar
    this.creditForm.statusChanges.subscribe(status => {
      this.formValidation.emit(status === 'VALID');
    });

    // Emite os dados do formulário sempre que mudar
    this.creditForm.valueChanges.subscribe(formValue => {
      this.formData.emit(formValue);
    });

    // Emitir dados iniciais
    this.formData.emit(this.creditForm.value);
  }

  // Função para formatar CPF durante a digitação
  formatCPF(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    event.target.value = value;
    this.creditForm.patchValue({ cpf: value });
  }

  // Função para formatar CEP durante a digitação
  formatCEP(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    event.target.value = value;
    this.creditForm.patchValue({ cep: value });
  }

  // Função para formatar número do cartão durante a digitação
  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(\d)/, '$1 $2');
    value = value.replace(/(\d{4})(\d)/, '$1 $2');
    value = value.replace(/(\d{4})(\d)/, '$1 $2');
    event.target.value = value;
    this.creditForm.patchValue({ numeroCartao: value });
  }

  // Função para permitir apenas números
  onlyNumbers(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight'];
    if (allowedKeys.includes(event.key) || (event.key >= '0' && event.key <= '9')) {
      return true;
    }
    event.preventDefault();
    return false;
  }

  // Função para permitir apenas letras e espaços
  onlyLetters(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight', ' '];
    const isLetter = /^[a-zA-ZÀ-ÿ]$/.test(event.key);
    if (allowedKeys.includes(event.key) || isLetter) {
      return true;
    }
    event.preventDefault();
    return false;
  }
}
