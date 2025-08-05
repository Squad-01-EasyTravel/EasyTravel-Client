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
      nome: ['', Validators.required],
      endereco: ['', Validators.required],
      cidade: ['', Validators.required],
      cep: ['', Validators.required],
      pais: ['', Validators.required],
      cpf: ['', Validators.required],
      titular: ['', Validators.required],
      numeroCartao: ['', Validators.required],
      mesValidade: ['', Validators.required],
      anoValidade: ['', Validators.required],
      cvc: ['', Validators.required],
      formaPagamento: ['credito', Validators.required], // Padrão crédito
      installments: [1] // Parcelas padrão
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
}
