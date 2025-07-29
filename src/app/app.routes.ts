
import { Routes } from '@angular/router';
import { USER_ROUTES } from './features/client/pages/user/user.routes';
import { Home } from './features/client/pages/home/home';
import { Bundle } from './features/client/pages/bundle/bundle';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'bundles', component: Bundle },
  { path: 'user', children: USER_ROUTES }
];