
import { Routes } from '@angular/router';
import { Home } from './features/client/pages/home/home';
import { Bundle } from './features/client/pages/bundle/bundle';
import { AUTH_ROUTES } from './features/client/pages/auth/auth.routes';
import { MyBooking } from './features/client/pages/booking/my-booking/my-booking';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'user', children: USER_ROUTES }
];
