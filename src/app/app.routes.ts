
import { Routes } from '@angular/router';
import { Home } from './features/client/pages/home/home';
import { AUTH_ROUTES } from './features/client/pages/auth/auth.routes';
import { MyBooking } from './features/client/pages/booking/my-booking/my-booking';

import { PackageManagementComponent } from './features/employee/pages/package-management/package-management';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'my-booking', component: MyBooking },
  { path: 'package-management', component: PackageManagementComponent },
  { path: 'auth', children: AUTH_ROUTES }
];
