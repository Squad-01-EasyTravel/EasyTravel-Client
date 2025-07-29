
import { Routes } from '@angular/router';
import { Home } from './features/client/pages/home/home';
import { AUTH_ROUTES } from './features/client/pages/auth/auth.routes';
import { MyBooking } from './features/client/pages/booking/my-booking/my-booking';
import { Payment } from './features/client/pages/payment/payment';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'my-booking', component: MyBooking },
  { path: 'payment', component: Payment }, 
  { path: 'auth', children: AUTH_ROUTES }
];
