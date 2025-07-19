import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, catchError, switchMap } from 'rxjs/operators';
import { LoginServiceService } from '../services/login-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private loginService: LoginServiceService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Permite acesso à página de login
    if (state.url.startsWith('/login') || state.url === '/') {
      return of(true);
    }

    return this.loginService.isAuthenticated().pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          console.info('🚨 AuthGuard: Usuário não autenticado, vai tentar extender');
          // Tenta estender a sessão
          return this.loginService.extendSession().pipe(
            map(newToken => {
              if (newToken) {
                console.info('🚨 AuthGuard: Sessão estendida com sucesso');
                // Se um novo token for recebido, armazena-o e permite o acesso
                this.loginService.setAuthToken(newToken);
                return true; // Permite o acesso
              } else {
                console.warn('🚨 AuthGuard: Não foi possível estender a sessão');
                // Se não for possível estender a sessão, redireciona para login
                this.loginService.clear();
                this.router.navigate(['/'], {
                  queryParams: { sessionExpired: 'true' },
                  replaceUrl: true
                });
                console.log('🚨 AuthGuard: Sessão não estendida, redirecionando para login');
                return false; // Bloqueia o acesso
              }
            }),
            catchError(() => {
              // Se ocorrer um erro ao tentar estender a sessão, redireciona para login
              console.error('🚨 AuthGuard: Erro ao estender a sessão, redirecionando para login');
              this.loginService.clear();
              this.router.navigate(['/'], {
                queryParams: { sessionExpired: 'true' },
                replaceUrl: true
              });
              return of(false); // Bloqueia o acesso
            })
          );
        }
        console.info('🚨 AuthGuard: Usuário autenticado, permitindo acesso.');
        return of(true); // Permite o acesso se o token for válido
      }),
      catchError(() => {
        // Se ocorrer um erro ao verificar a autenticação, redireciona para login
        this.loginService.clear();
         console.error('🚨 AuthGuard: Erro ao verificar autenticação 1, redirecionando para login'); 
        this.router.navigate(['/'], {
          queryParams: { sessionExpired: 'true' },
          replaceUrl: true
        });
        return of(false); // Bloqueia o acesso
      })
    );
  }
}
