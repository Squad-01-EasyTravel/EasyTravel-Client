
import { Routes } from '@angular/router';
import { USER_ROUTES } from './features/client/pages/user/user.routes';
import { Home } from './features/client/pages/home/home';
import { Profile } from './features/client/pages/user/profile/profile';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'user', children: USER_ROUTES },
  { path: 'profile', component: Profile}
];