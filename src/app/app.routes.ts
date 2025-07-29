import { Routes } from '@angular/router';
import { Home } from './features/client/pages/home/home';
import { AUTH_ROUTES } from './features/client/pages/auth/auth.routes';
import { MyBooking } from './features/client/pages/booking/my-booking/my-booking';

import { EmployeeLayoutComponent } from './features/employee/employee-layout';
import { PackageManagementComponent } from './features/employee/pages/package-management/package-management';
import { ReviewManagement } from './features/employee/pages/review-management/review-management';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'my-booking', component: MyBooking },
  {
    path: 'employee',
    component: EmployeeLayoutComponent,
    children: [
      { path: 'package-management', component: PackageManagementComponent },
      { path: 'review-management', component: ReviewManagement }
    ]
  },
  { path: 'auth', children: AUTH_ROUTES }
];
