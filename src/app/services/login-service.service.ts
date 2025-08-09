import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { of } from 'rxjs'
import { map, catchError } from 'rxjs/operators';
import { EquipaService } from './equipa.service';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  private userLoggedIn = new Subject<boolean>();


  parmJson: string = ""
  urlTmp: string = "";
  errows: boolean = false;
  loginData!: loginData; // Pode ser inicializado como null ou com valores padrão
  private AUTH_TOKEN_KEY = 'AuthToken'; // Chave para armazenar o token no localStorage

  constructor(private http: HttpClient, private router: Router, private equipaService: EquipaService) {
      this.isAuthenticated().subscribe((isAuth: boolean) => {
        this.userLoggedIn.next(isAuth);
      }); // Inicializa com o estado de autenticação atual
   }



  login(user: string, pass: string): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const body = { user: user, pwd: pass, tenant_id:environment.tenant_id };
    this.urlTmp = environment.apiUrl + "/sm/login";

    console.log("URL", this.urlTmp);
    //console.log("json", body);

    // Assumindo que o backend retorna um objeto com o token (ex: { ..., token: 'seu_token_jwt' })
    return this.http.put<any>(this.urlTmp, body, { headers });
  }

  // Novo método para armazenar o token
  setAuthToken(token: string): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }

  // Novo método para obter o token
  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }


  // Método para verificar se o token é válido
  isAuthenticated(): Observable<boolean> {
    const token = this.getAuthToken();
    console.info('🚨 LoginService: Verificando autenticação, token:', token);
    this.urlTmp = environment.apiUrl + "/sm/isAuthenticated";

        
    if (!token) {
      console.warn('🚨 LoginService: Nenhum token encontrado. Usuário não autenticado.');
      return new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      });
    }
    // Chama o backend para validar o token
    console.info('🚨 LoginService: Token encontrado, validando...');
    return this.http.put<boolean>(`${this.urlTmp}`, { token: token });
  }

 



  // Novo método para validar o token no backend
  validateAuthToken(): Observable<any> {
    const token = this.getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    this.parmJson = "{\"token\":\"" + token + "\"}";
    this.urlTmp = environment.apiUrl + "/sm/isAuthenticated";

    console.log("URL", this.urlTmp);
    console.log("json", this.parmJson);

    // Assumindo que o backend retorna um objeto com o token (ex: { ..., token: 'seu_token_jwt' })
    return this.http.put<any>(this.urlTmp, this.parmJson, { headers });
  }

  getHistoricoLogins() {
    const headers = { 'Content-Type': 'application/json' };
    this.urlTmp = environment.apiUrl + "/sm/gethistoricoLogins";
    console.log("URL", this.urlTmp);
    //console.log("json", this.parmJson);
    return this.http.put<any>(this.urlTmp, this.parmJson, { headers });
  }

  createUser(parmUser: novouserData, parmPassWord: string) {
    const headers = { 'Content-Type': 'application/json' };

    console.log("parmUser", parmUser);
    console.log("idsEscalao", parmUser.idsEscalao);
    let tmpEscaloes;
    tmpEscaloes = parmUser.idsEscalao.split(";");
    console.log("tmpEscaloes", tmpEscaloes);
    this.parmJson = "{\"nome\":\"" + parmUser.nome + "\",\"user\":\"" + parmUser.user + "\",\"password\":\"" + parmPassWord + "\", \"escalaoEpoca\" :[  ";

    for (let i = 0; i < tmpEscaloes.length - 1; i++) {
      if (i > 0) {
        this.parmJson = this.parmJson + ","
      }
      this.parmJson = this.parmJson + "{\"id_escalao_epoca\":" + tmpEscaloes[i] + "}";

    }
    this.parmJson = this.parmJson + "]}";
    this.urlTmp = environment.apiUrl + "/sm/createuser";
    console.log("URL", this.urlTmp);
    console.log("json", this.parmJson);

    return this.http.put<any>(this.urlTmp, this.parmJson, { headers });
  }

  validateCode(parmCode: string) {
    const headers = { 'Content-Type': 'application/json' };
    this.urlTmp = environment.apiUrl + "/sm/activateuser/" + parmCode;
    console.log("URL", this.urlTmp);
    return this.http.put<any>(this.urlTmp, { headers });
  }

  setLogin(parmLogin: loginData) {
    this.loginData = parmLogin;
    console.log("loginService - setLogin");
    this.userLoggedIn.next(true); // Notifica que o utilizador está logado
  }

  getLoginData(): loginData {
    console.log("loginService - getLogin");
    // Se loginData não estiver definido, tenta carregar do localStorage (se necessário)
    // ou redireciona para login se não houver sessão ativa.
    if (!this.loginData && this.isAuthenticated()) {
        const loginTokenString = localStorage.getItem('token');
        if (loginTokenString) {
          this.loginData = JSON.parse(loginTokenString) as loginData;
        } else {
           this.router.navigate(['/']);
        }
    
      return {} as loginData; // Retorna um objeto vazio para evitar erros de tipo
    } else if (!this.isAuthenticated()) {
      console.log("loginService - Não autenticado, redirecionando para login.");
      this.router.navigate(['/']);
      return {} as loginData; // Retorna um objeto vazio para evitar erros de tipo
    }
    return this.loginData;
  }

  clear() {
    console.log("loginService - Clear");
    // Limpa o token e os dados de login
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem("UserLogin"); // Manter se ainda for usado para algo específico
    localStorage.removeItem("idequipa_escalao");
    localStorage.removeItem("descritivo_escalao");
    localStorage.removeItem('token'); // Limpa o token do localStorage
    this.loginData = {} as loginData; // Limpa os dados em memória
    this.equipaService.clear(); // Limpa os dados da equipa
    this.userLoggedIn.next(false); // Notifica que o utilizador fez logout
    this.router.navigate(['/']); // Redireciona para a página de login
    
  }

  getUserLoggedIn(): Observable<boolean> {
    return this.userLoggedIn.asObservable();
  }

  setUserLoggedIn(userLoggedIn: boolean) {
    this.userLoggedIn.next(userLoggedIn);
  }


extendSession(): Observable<string> {
    const token = this.getAuthToken(); // Obtém o token atual
    const headers = { 'Content-Type': 'application/json' };
    const body = { token }; // Corpo da requisição com o token
    this.urlTmp = environment.apiUrl + "/sm/extendSession"; // URL do endpoint
    console.log("URL", this.urlTmp);
    console.log("json", body);
    // Faz a requisição PUT para estender a sessão
    return this.http.put<any>(this.urlTmp, body, { headers }).pipe( // Use 'any' para o tipo de retorno
        map(response => {
            console.log("Resposta recebida:", response);
            const newToken = response.token; // Acessa a propriedade 'token' do objeto JSON
            if (newToken) {
                this.setAuthToken(newToken); // Armazena o novo token
                console.log("Novo token armazenado:", newToken);
                this.loginData.token = newToken; // Atualiza o token em loginData
                return newToken; // Retorna o novo token
            } else {
                console.warn("Nenhum novo token recebido.");
                return ''; // Retorna uma string vazia se não houver novo token
            }
        }),
        catchError(error => {
            console.error("Erro ao estender a sessão:", error);
            return of(''); // Retorna uma string vazia em caso de erro
        })
    );
}

}
