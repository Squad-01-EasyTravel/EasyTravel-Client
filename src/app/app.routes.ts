
import { Routes } from '@angular/router';
import { Home } from './features/client/pages/home/home';
import { AUTH_ROUTES } from './features/client/pages/auth/auth.routes';
import { AUTH_ROUTES } from './features/client/pages/auth/user.routes';
import { MyBooking } from './features/client/pages/booking/my-booking/my-booking';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'my-booking', component: MyBooking },
  { path: 'auth', children: AUTH_ROUTES }
];
