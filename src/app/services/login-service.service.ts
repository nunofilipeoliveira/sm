import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  private userLoggedIn = new Subject<boolean>();

  parmJson: string = ""
  urlTmp: string = "";
  errows: boolean = false;
  loginData!: loginData; // Pode ser inicializado como null ou com valores padrão
  private AUTH_TOKEN_KEY = 'authToken'; // Chave para armazenar o token no localStorage

  constructor(private http: HttpClient, private router: Router) {
      this.userLoggedIn.next(this.isAuthenticated()); // Inicializa com o estado de autenticação atual
   }

  login(user: string, pass: string): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    this.parmJson = "{\"user\":\"" + user + "\",\"pwd\":\"" + pass + "\"}";
    this.urlTmp = environment.apiUrl + "/sm/login";

    console.log("URL", this.urlTmp);
    console.log("json", this.parmJson);

    // Assumindo que o backend retorna um objeto com o token (ex: { ..., token: 'seu_token_jwt' })
    return this.http.put<any>(this.urlTmp, this.parmJson, { headers });
  }

  // Novo método para armazenar o token
  setAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }

  // Novo método para obter o token
  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  // Método para verificar se o utilizador está autenticado
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    // Aqui pode adicionar lógica para validar o token (ex: verificar expiração)
    // Por enquanto, apenas verifica a existência
    return !!token; // Retorna true se o token existir, false caso contrário
  }

  getHistoricoLogins() {
    const headers = { 'Content-Type': 'application/json' };
    this.urlTmp = environment.apiUrl + "/sm/gethistoricoLogins";
    console.log("URL", this.urlTmp);
    console.log("json", this.parmJson);
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
    console.log("loginService - setLogin", this.loginData);
    this.userLoggedIn.next(true); // Notifica que o utilizador está logado
  }

  getLoginData(): loginData {
    console.log("loginService - getLogin", this.loginData);
    // Se loginData não estiver definido, tenta carregar do localStorage (se necessário)
    // ou redireciona para login se não houver sessão ativa.
    if (!this.loginData && this.isAuthenticated()) {
        const loginTokenString = localStorage.getItem('loginToken');
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
    this.loginData = {} as loginData; // Limpa os dados em memória
    this.userLoggedIn.next(false); // Notifica que o utilizador fez logout
    this.router.navigate(['/']); // Redireciona para a página de login
  }

  getUserLoggedIn(): Observable<boolean> {
    return this.userLoggedIn.asObservable();
  }

  setUserLoggedIn(userLoggedIn: boolean) {
    this.userLoggedIn.next(userLoggedIn);
  }
}
