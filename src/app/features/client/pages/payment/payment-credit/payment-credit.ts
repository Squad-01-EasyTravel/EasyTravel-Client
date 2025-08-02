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
      formaPagamento: ['', Validators.required]
    });

    // Emite o status de validação sempre que o formulário mudar
    this.creditForm.statusChanges.subscribe(status => {
      this.formValidation.emit(status === 'VALID');
    });
  }
}
