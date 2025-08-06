import { Component, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-pix',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-pix.html',
  styleUrl: './payment-pix.css'
})
export class PaymentPix {
  @Output() formValidation = new EventEmitter<boolean>();
  @Output() formData = new EventEmitter<any>();
  pixForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.pixForm = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      endereco: ['', [Validators.required, Validators.minLength(5)]],
      cidade: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      codigoPostal: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      pais: ['Brasil', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]]
    });

    // Emite o status de validação sempre que o formulário mudar
    this.pixForm.statusChanges.subscribe(status => {
      this.formValidation.emit(status === 'VALID');
    });

    // Emite os dados do formulário sempre que mudar
    this.pixForm.valueChanges.subscribe(formValue => {
      this.formData.emit(formValue);
    });

    // Emitir dados iniciais
    this.formData.emit(this.pixForm.value);
  }

  // Função para formatar CPF durante a digitação
  formatCPF(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    event.target.value = value;
    this.pixForm.patchValue({ cpf: value });
  }

  // Função para formatar CEP durante a digitação
  formatCEP(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    event.target.value = value;
    this.pixForm.patchValue({ codigoPostal: value });
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
