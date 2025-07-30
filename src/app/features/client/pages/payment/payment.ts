import { Component } from '@angular/core';
import { PaymentCard } from './payment-card/payment-card';
import { PaymentCredit } from './payment-credit/payment-credit';
import { PaymentButton } from './payment-button/payment-button';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [PaymentCard, PaymentCredit, PaymentButton],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class Payment {

}