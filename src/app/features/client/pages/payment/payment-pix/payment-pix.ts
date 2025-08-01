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
  pixForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.pixForm = this.fb.group({
      nomeCompleto: ['', Validators.required],
      endereco: ['', Validators.required],
      cidade: ['', Validators.required],
      codigoPostal: ['', Validators.required],
      pais: ['', Validators.required],
      cpf: ['', Validators.required]
    });

    // Emite o status de validação sempre que o formulário mudar
    this.pixForm.statusChanges.subscribe(status => {
      this.formValidation.emit(status === 'VALID');
    });
  }
}
