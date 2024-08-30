import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guard/auth.guard';
import { NovoUserComponent } from './novo-user/novo-user.component';

export const AppRoutes: Routes = [
  {
    path: '',
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: 'ativeuser',
    component: NovoUserComponent,
    pathMatch: 'full',
  },
   {
    path: '',
    component: AdminLayoutComponent,
    canActivate:[authGuard],
    children: [
        {
      path: '',
      loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(x => x.AdminLayoutModule),
      canActivate:[authGuard]
  }]},
  {
    path: '**',
    redirectTo: 'dashboard',
    canActivate:[authGuard]
  }
]
