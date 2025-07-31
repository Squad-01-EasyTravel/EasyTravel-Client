import { Routes } from '@angular/router';
import { Home } from './features/client/pages/home/home';
import { Bundle } from './features/client/pages/bundle/bundle';
import { AUTH_ROUTES } from './features/client/pages/auth/auth.routes';
import { MyBooking } from './features/client/pages/booking/my-booking/my-booking';
import { DetailsBundle } from './features/client/pages/bundle/details-bundle/details-bundle';
import { EmployeeLayoutComponent } from './features/employee/employee-layout';
import { PackageManagementComponent } from './features/employee/pages/package-management/package-management';
import { ReviewManagement } from './features/employee/pages/review-management/review-management';
import { Profile } from './features/client/pages/user/profile/profile';
import { PayInfo } from './features/client/pages/user/pay-info/pay-info';
import { Booking } from './features/client/pages/booking/booking';
import { TravelHistory } from './features/client/pages/user/travel-history/travel-history';
import { Payment } from './features/client/pages/payment/payment';


export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'bundles', component: Bundle },
  { path: 'booking', component: Booking },
  { path: 'my-booking', component: MyBooking },
  { path: 'details-bundle', component: DetailsBundle },
  { path: 'payment', component: Payment },
  { path: 'auth', children: AUTH_ROUTES },
  { path: 'profile', component: Profile},
  { path: 'profile/paymentinformation', component: PayInfo},
  { path: 'profile/travelhistory', component: TravelHistory},
  {
    path: 'employee',
    component: EmployeeLayoutComponent,
    children: [
      { path: 'package-management', component: PackageManagementComponent },
      { path: 'review-management', component: ReviewManagement }
    ]
  },
];
