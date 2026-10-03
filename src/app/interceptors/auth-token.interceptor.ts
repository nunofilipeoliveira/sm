import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Adiciona o token de sessão (JWT) a todos os pedidos feitos à API do SM.
 *
 * O token é o mesmo que o LoginService guarda no localStorage após o login
 * ('AuthToken'). O envio é feito no cabeçalho standard:
 *
 *   Authorization: Bearer <token>
 *
 * Notas:
 *  - o token só é enviado para pedidos cujo URL começa por environment.apiUrl,
 *    para nunca o expor a serviços externos;
 *  - os endpoints públicos (login, registo, ativação, sonda) ignoram o cabeçalho,
 *    por isso é seguro enviá-lo sempre que exista.
 */
@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  private readonly AUTH_TOKEN_KEY = 'AuthToken';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.startsWith(environment.apiUrl)) {
      return next.handle(req);
    }

    const token = localStorage.getItem(this.AUTH_TOKEN_KEY);
    if (!token || token.length === 0) {
      return next.handle(req);
    }

    return next.handle(req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }));
  }
}
