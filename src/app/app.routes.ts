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
import { AdminDashboardContent } from './features/admin/pages/admin-dashboard-content/admin-dashboard-content';
import { AdminDashboard } from './features/admin/pages/admin-dashboard/admin-dashboard';
import { AuthGuard } from './shared/guards/auth.guard';
import { UserManagement } from './features/admin/pages/user-management/user-management';


export const routes: Routes = [
  // Rotas públicas (sem autenticação necessária)
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'bundles', component: Bundle }, // Rota pública para visualizar pacotes
  { path: 'auth', children: AUTH_ROUTES },

  // Rotas protegidas (autenticação necessária)
  { path: 'booking', component: Booking, canActivate: [AuthGuard] },
  { path: 'my-booking', component: MyBooking, canActivate: [AuthGuard] },
  { path: 'bundles/details-bundle/:id', component: DetailsBundle, canActivate: [AuthGuard] },
  { path: 'payment', component: Payment, canActivate: [AuthGuard] },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
  { path: 'profile/paymentinformation', component: PayInfo, canActivate: [AuthGuard] },
  { path: 'profile/travelhistory', component: TravelHistory, canActivate: [AuthGuard] },
  {
    path: 'employee',
    component: EmployeeLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'package-management', component: PackageManagementComponent },
      { path: 'review-management', component: ReviewManagement }
    ]
  },
  {
    path: 'admin',
    component: AdminDashboard, // layout com sidebar e router-outlet
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardContent },
      { path: 'user-management', component: UserManagement } // conteúdo do dashboard
    ]
  },
  // Rota catch-all: redireciona qualquer rota não encontrada para home
  { path: '**', redirectTo: '/home' }
];
