
import { Routes } from '@angular/router';
import { Home } from './features/client/pages/home/home';
import { Profile } from './features/client/pages/user/profile/profile';
import { PayInfo } from './features/client/pages/user/pay-info/pay-info';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'profile', component: Profile},
  { path: 'profile/paymentinformation', component: PayInfo},
];
