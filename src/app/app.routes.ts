import { Routes } from '@angular/router';
import { USER_ROUTES } from './features/client/pages/user/user.routes';

export const routes: Routes = [
  { path: 'user',
    children: USER_ROUTES
  }
];
