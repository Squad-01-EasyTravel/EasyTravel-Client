
import { Routes } from '@angular/router';
import { Home } from './features/client/pages/home/home';
import { Profile } from './features/client/pages/user/profile/profile';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'profile', component: Profile}
];
