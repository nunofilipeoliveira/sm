import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginServiceService } from '../services/login-service.service'; // Importar o serviço de login

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const loginService = inject(LoginServiceService); // Injetar o serviço de login

  try {
    console.info('🚨 AuthGuard: Inicio');

    // Usar o método isAuthenticated do serviço de login
    if (loginService.isAuthenticated()) {
      console.info('✅ AuthGuard: Token válido encontrado. Acesso permitido.');
      return true; // Permite acesso
    } else {
      console.warn('🚨 AuthGuard: Nenhum token válido encontrado ou token expirado!');
      // Limpa qualquer resquício de sessão e redireciona para login
      loginService.clear(); // Garante que o localStorage é limpo
      return router.parseUrl('/login'); // Redireciona usando `parseUrl` para evitar loops
    }
  } catch (error) {
    console.error('❌ AuthGuard - Erro ao verificar sessão:', error);
    loginService.clear(); // Em caso de erro, limpa a sessão
    return router.parseUrl('/login');
  }
};
