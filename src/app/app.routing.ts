import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guard/auth.guard'; // Certifique-se que o caminho está correto
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
    canActivate:[authGuard], // Protege o layout administrativo
    children: [
        {
      path: '',
      loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(x => x.AdminLayoutModule),
      canActivate:[authGuard] // Protege as rotas filhas do layout administrativo
  }]},
  {
    path: '**', // Rota wildcard para qualquer outra rota não definida
    redirectTo: 'dashboard', // Redireciona para dashboard (ou 'equipa' como no seu AdminLayoutRoutes)
    canActivate:[authGuard] // Protege também o redirecionamento
  }
]
