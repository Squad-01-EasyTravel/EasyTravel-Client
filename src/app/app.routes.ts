
import { Routes } from '@angular/router';
import { Home } from './features/client/pages/home/home';
import { AUTH_ROUTES } from './features/client/pages/auth/auth.routes';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'auth', children: AUTH_ROUTES }
];
