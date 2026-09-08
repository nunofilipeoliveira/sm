import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { LoginServiceService } from '../services/login-service.service';

/**
 * Guard de controlo de acesso por perfil.
 * Permite apenas utilizadores com perfil ADMIN ou TREINADOR
 * (mesma validação efetuada no backend, PerformanceWS.temPermissao).
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private loginService: LoginServiceService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const perfil = this.loginService.getLoginData().perfil;

    if (perfil === 'ADMIN' || perfil === 'TREINADOR') {
      return true; // Permite o acesso
    }

    console.warn('RoleGuard: Acesso negado a', state.url, '(perfil:', perfil + ')');
    this.router.navigate(['/dashboard']);
    return false; // Bloqueia o acesso
  }
}