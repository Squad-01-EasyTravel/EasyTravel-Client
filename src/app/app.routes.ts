
import { Routes } from '@angular/router';
import { Home } from './features/client/pages/home/home';
import { Bundle } from './features/client/pages/bundle/bundle';
import { AUTH_ROUTES } from './features/client/pages/auth/auth.routes';
import { MyBooking } from './features/client/pages/booking/my-booking/my-booking';
import { DetailsBundle } from './features/client/pages/bundle/details-bundle/details-bundle';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'bundles', component: Bundle },
  { path: 'my-booking', component: MyBooking },
  { path: 'details-bundle', component: DetailsBundle },
  { path: 'auth', children: AUTH_ROUTES }
];
