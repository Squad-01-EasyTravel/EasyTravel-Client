
import { Routes } from '@angular/router';
import { Home } from './features/client/pages/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'user', children: USER_ROUTES }
];
