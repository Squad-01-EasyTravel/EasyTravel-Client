import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-qr-code',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-qr-code.html',
  styleUrl: './payment-qr-code.css'
})
export class PaymentQrCode implements OnInit {
  generatedDateTime: string = '';
  showSuccessModal: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.setCurrentDateTime();
    this.showModalAfterDelay();
  }

  private setCurrentDateTime() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    this.generatedDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  private showModalAfterDelay() {
    setTimeout(() => {
      this.showSuccessModal = true;
    }, 3000); // 3 segundos
  }

  onVoltarInicio() {
    this.router.navigate(['/home']);
  }

  closeModal() {
    this.showSuccessModal = false;
  }
}
