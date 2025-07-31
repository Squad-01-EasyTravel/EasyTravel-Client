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
  boletoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.boletoForm = this.fb.group({
      nomeCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      endereco: ['', Validators.required],
      cidade: ['', Validators.required],
      codigoPostal: ['', Validators.required],
      pais: ['', Validators.required]
    });

    // Emite o status de validação sempre que o formulário mudar
    this.boletoForm.statusChanges.subscribe(status => {
      this.formValidation.emit(status === 'VALID');
    });
  }
}
